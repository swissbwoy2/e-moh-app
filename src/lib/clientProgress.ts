import { db } from '@/config/firebase';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, setDoc, arrayUnion, addDoc, orderBy } from 'firebase/firestore';
import type { ClientProgress, ProgressStage, ProgressUpdate } from '@/types/progress';

const STAGES: ProgressStage[] = [
  {
    id: 'mandate_creation',
    name: 'Création du mandat',
    requiredActions: ['submit_search_criteria', 'upload_documents', 'accept_terms']
  },
  {
    id: 'property_search',
    name: 'Recherche de biens',
    requiredActions: ['review_recommendations', 'save_favorites', 'schedule_visits']
  },
  {
    id: 'property_visits',
    name: 'Visites de biens',
    requiredActions: ['attend_visits', 'provide_feedback', 'update_preferences']
  },
  {
    id: 'offer_submission',
    name: 'Soumission d\'offre',
    requiredActions: ['prepare_offer', 'submit_financials', 'negotiate_terms']
  },
  {
    id: 'contract_signing',
    name: 'Signature du contrat',
    requiredActions: ['review_contract', 'provide_documents', 'sign_agreement']
  }
];

export async function getClientProgress(clientId: string): Promise<ClientProgress> {
  const progressRef = doc(db, 'client-progress', clientId);
  const progressDoc = await getDoc(progressRef);
  
  if (!progressDoc.exists()) {
    // Initialize progress if it doesn't exist
    const initialProgress: ClientProgress = {
      clientId,
      currentStage: STAGES[0].id,
      stages: STAGES.map(stage => ({
        ...stage,
        status: stage.id === STAGES[0].id ? 'in_progress' : 'pending',
        completedActions: [],
        startedAt: stage.id === STAGES[0].id ? new Date() : null,
        completedAt: null
      })),
      lastUpdated: new Date(),
      completionPercentage: 0
    };
    
    await setDoc(progressRef, {
      ...initialProgress,
      stages: initialProgress.stages.map(stage => ({
        ...stage,
        startedAt: stage.startedAt ? stage.startedAt.toISOString() : null,
        completedAt: stage.completedAt ? stage.completedAt.toISOString() : null
      })),
      lastUpdated: initialProgress.lastUpdated.toISOString()
    });
    
    return initialProgress;
  }
  
  const data = progressDoc.data();
  return {
    ...data,
    stages: data.stages.map((stage: any) => ({
      ...stage,
      startedAt: stage.startedAt ? new Date(stage.startedAt) : null,
      completedAt: stage.completedAt ? new Date(stage.completedAt) : null
    })),
    lastUpdated: new Date(data.lastUpdated)
  } as ClientProgress;
}

export function calculateProgressPercentage(progress: ClientProgress): number {
  const totalActions = STAGES.reduce((sum, stage) => sum + stage.requiredActions.length, 0);
  
  const completedActions = progress.stages.reduce((sum, stage) => 
    sum + (stage.completedActions?.length || 0), 0
  );
  
  return Math.round((completedActions / totalActions) * 100);
}

export async function updateClientProgress(
  clientId: string,
  stageId: string,
  action: string,
  status: 'completed' | 'failed' = 'completed'
): Promise<void> {
  const progressRef = doc(db, 'client-progress', clientId);
  const progressDoc = await getDoc(progressRef);
  const progress = progressDoc.data() as ClientProgress;
  
  const stageIndex = progress.stages.findIndex(s => s.id === stageId);
  if (stageIndex === -1) return;
  
  const stage = progress.stages[stageIndex];
  const actionExists = stage.requiredActions.includes(action);
  if (!actionExists) return;
  
  const updates: Record<string, any> = {};
  
  if (!stage.completedActions?.includes(action) && status === 'completed') {
    updates[`stages.${stageIndex}.completedActions`] = arrayUnion(action);
    
    // Check if stage is complete
    const currentCompletedCount = stage.completedActions?.length || 0;
    if (currentCompletedCount === stage.requiredActions.length - 1) {
      updates[`stages.${stageIndex}.status`] = 'completed';
      updates[`stages.${stageIndex}.completedAt`] = new Date().toISOString();
      
      // Move to next stage if available
      if (stageIndex < STAGES.length - 1) {
        updates[`stages.${stageIndex + 1}.status`] = 'in_progress';
        updates[`stages.${stageIndex + 1}.startedAt`] = new Date().toISOString();
        updates.currentStage = STAGES[stageIndex + 1].id;
      }
    }
  }
  
  // Update completion percentage and last updated
  updates.completionPercentage = calculateProgressPercentage({
    ...progress,
    stages: progress.stages.map((s, i) => 
      i === stageIndex ? {
        ...s,
        completedActions: [...(s.completedActions || []), action]
      } : s
    )
  });
  updates.lastUpdated = new Date().toISOString();
  
  await updateDoc(progressRef, updates);
  
  // Record progress update
  const update: ProgressUpdate = {
    timestamp: new Date(),
    stageId,
    action,
    status,
    details: `Action ${action} marked as ${status} for stage ${stageId}`
  };
  
  await addDoc(collection(db, 'progress-updates'), {
    clientId,
    ...update,
    timestamp: update.timestamp.toISOString()
  });
  
  // Notify agent if significant progress is made
  if (status === 'completed') {
    await notifyAgentOfProgress(clientId, update);
  }
}

async function notifyAgentOfProgress(clientId: string, update: ProgressUpdate): Promise<void> {
  const clientDoc = await getDoc(doc(db, 'users', clientId));
  const clientData = clientDoc.data();
  const agentId = clientData?.agentId;
  
  if (!agentId) return;
  
  const notification = {
    userId: agentId,
    type: 'progress_update',
    title: 'Client Progress Update',
    message: `Your client has completed ${update.action} in stage ${update.stageId}`,
    data: { clientId, update: { ...update, timestamp: update.timestamp.toISOString() } },
    read: false,
    createdAt: new Date().toISOString()
  };
  
  await addDoc(collection(db, 'notifications'), notification);
}

export async function getProgressTimeline(clientId: string): Promise<ProgressUpdate[]> {
  const updatesQuery = query(
    collection(db, 'progress-updates'),
    where('clientId', '==', clientId),
    orderBy('timestamp', 'desc')
  );
  
  const snapshot = await getDocs(updatesQuery);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    timestamp: new Date(doc.data().timestamp)
  }) as ProgressUpdate);
}

export function getNextRequiredActions(progress: ClientProgress): string[] {
  const currentStage = progress.stages.find(s => s.id === progress.currentStage);
  if (!currentStage) return [];
  
  return currentStage.requiredActions.filter(
    action => !currentStage.completedActions?.includes(action)
  );
}

export function getProgressSummary(progress: ClientProgress): string {
  const currentStage = progress.stages.find(s => s.id === progress.currentStage);
  if (!currentStage) return '';
  
  const completedStages = progress.stages.filter(s => s.status === 'completed').length;
  const nextActions = getNextRequiredActions(progress);
  
  return `
    Currently in ${currentStage.name} stage (${completedStages}/${STAGES.length} stages completed)
    Next actions required: ${nextActions.join(', ')}
    Overall progress: ${progress.completionPercentage}%
  `.trim();
}