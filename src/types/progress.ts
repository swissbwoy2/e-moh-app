export interface ProgressStage {
  id: string;
  name: string;
  requiredActions: string[];
  status?: 'pending' | 'in_progress' | 'completed';
  completedActions?: string[];
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface ClientProgress {
  clientId: string;
  currentStage: string;
  stages: ProgressStage[];
  lastUpdated: Date;
  completionPercentage: number;
}

export interface ProgressUpdate {
  timestamp: Date;
  stageId: string;
  action: string;
  status: 'completed' | 'failed';
  details?: string;
}