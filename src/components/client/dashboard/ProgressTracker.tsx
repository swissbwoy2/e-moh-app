import { useEffect, useState } from 'react';
import { getClientProgress, getProgressTimeline, getNextRequiredActions } from '@/lib/clientProgress';
import type { ClientProgress, ProgressUpdate } from '@/types/progress';

interface ProgressTrackerProps {
  clientId: string;
}

export function ProgressTracker({ clientId }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<ClientProgress | null>(null);
  const [timeline, setTimeline] = useState<ProgressUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progressData = await getClientProgress(clientId);
        const timelineData = await getProgressTimeline(clientId);
        setProgress(progressData);
        setTimeline(timelineData);
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [clientId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center py-8 text-gray-500">
        No progress data available
      </div>
    );
  }

  const nextActions = getNextRequiredActions(progress);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Progression de votre recherche
        </h2>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progression globale
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {progress.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stages Progress */}
        <div className="relative">
          {progress.stages.map((stage, index) => (
            <div key={stage.id} className="relative flex items-start mb-8 last:mb-0">
              {/* Stage Connection Line */}
              {index < progress.stages.length - 1 && (
                <div className="absolute left-3.5 top-6 bottom-0 w-px bg-gray-200"></div>
              )}

              {/* Stage Status Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                {stage.status === 'completed' ? (
                  <div className="bg-green-500 rounded-full p-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : stage.status === 'in_progress' ? (
                  <div className="bg-blue-500 rounded-full p-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="bg-gray-200 rounded-full p-2">
                    <div className="w-4 h-4"></div>
                  </div>
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{stage.name}</h3>
                
                {stage.completedActions && stage.completedActions.length > 0 && (
                  <ul className="mt-2 text-sm text-gray-600">
                    {stage.completedActions.map(action => (
                      <li key={action} className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {action}
                      </li>
                    ))}
                  </ul>
                )}
                
                {stage.status === 'in_progress' && nextActions.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Prochaines étapes:</h4>
                    <ul className="mt-1 text-sm text-gray-600">
                      {nextActions.map(action => (
                        <li key={action} className="flex items-center">
                          <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stage Timestamps */}
                {stage.startedAt && (
                  <div className="mt-2 text-sm text-gray-500">
                    {stage.status === 'completed' ? (
                      <>
                        Complété le {new Date(stage.completedAt!).toLocaleDateString()}
                      </>
                    ) : (
                      <>
                        Démarré le {new Date(stage.startedAt).toLocaleDateString()}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Activité récente
          </h2>

          <div className="flow-root">
            <ul className="-mb-8">
              {timeline.map((update, updateIdx) => (
                <li key={update.timestamp.toString()}>
                  <div className="relative pb-8">
                    {updateIdx !== timeline.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`
                          h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                          ${update.status === 'completed' ? 'bg-green-500' : 'bg-gray-400'}
                        `}>
                          {update.status === 'completed' ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm text-gray-500">
                            {new Date(update.timestamp).toLocaleString()}
                          </div>
                          <p className="mt-0.5 text-sm text-gray-600">
                            {update.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}