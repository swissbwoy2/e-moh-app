import { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { UserGroupIcon, DocumentIcon, UserIcon, UserPlusIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApplications: 0,
    activeAgents: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const applicationsSnapshot = await getDocs(
          query(collection(db, 'applications'))
        );
        const agentsSnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'AGENT'))
        );

        setStats({
          totalUsers: usersSnapshot.size,
          pendingApplications: applicationsSnapshot.docs.filter(
            doc => doc.data().status === 'PENDING'
          ).length,
          activeAgents: agentsSnapshot.size
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord administrateur</h1>
      
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Utilisateurs
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Demandes en attente
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.pendingApplications}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Agents actifs
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.activeAgents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Actions rapides</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Ajouter un nouvel agent
            </span>
          </button>
          <button
            type="button"
            className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <DocumentPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Créer une nouvelle annonce
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
