import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { useAuth } from '../../../contexts/AuthContext';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingVisits: 0,
    unreadMessages: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!user) return;

      try {
        // Récupérer les statistiques
        const clientsQuery = query(
          collection(db, 'users'),
          where('agentId', '==', user.uid)
        );
        const clientsSnapshot = await getDocs(clientsQuery);

        const visitsQuery = query(
          collection(db, 'visits'),
          where('agentId', '==', user.uid),
          where('status', '==', 'PENDING')
        );
        const visitsSnapshot = await getDocs(visitsQuery);

        const messagesQuery = query(
          collection(db, 'messages'),
          where('agentId', '==', user.uid),
          where('read', '==', false)
        );
        const messagesSnapshot = await getDocs(messagesQuery);

        setStats({
          totalClients: clientsSnapshot.size,
          pendingVisits: visitsSnapshot.size,
          unreadMessages: messagesSnapshot.size
        });

        // Récupérer les activités récentes
        // ... Logique pour les activités récentes
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

    fetchAgentData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord agent</h1>
      
      {/* Statistiques */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Clients
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.totalClients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Visites en attente
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.pendingVisits}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Messages non lus
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.unreadMessages}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prochaines visites */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Prochaines visites</h2>
        <div className="mt-4 bg-white shadow rounded-lg">
          {/* Liste des visites à venir */}
        </div>
      </div>

      {/* Messages récents */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Messages récents</h2>
        <div className="mt-4 bg-white shadow rounded-lg">
          {/* Liste des messages récents */}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
