'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import DataTable from '@/components/shared/DataTable';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  uid: string;
  // add other properties as needed
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingVisits: 0,
    pendingDocuments: 0,
    unreadMessages: 0
  });
  const [recentClients, setRecentClients] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);

  const fetchStats = useCallback(async () => {
    if (!user?.uid) return;
    
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

      // Mettre à jour les stats
      setStats({
        totalClients: clientsSnapshot.size,
        pendingVisits: visitsSnapshot.size,
        pendingDocuments: 0, // À implémenter
        unreadMessages: 0 // À implémenter
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  }, [user?.uid]);

  const fetchRecentClients = useCallback(async () => {
    // Implementation here
  }, []);

  const fetchUpcomingVisits = useCallback(async () => {
    // Implementation here
  }, []);

  useEffect(() => {
    if (user?.uid) {
      fetchStats();
      fetchRecentClients();
      fetchUpcomingVisits();
    }
  }, [user?.uid, fetchStats, fetchRecentClients, fetchUpcomingVisits]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord Agent</h1>

        {/* Statistiques */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Clients actifs
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.totalClients}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Visites en attente
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.pendingVisits}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Documents à valider
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.pendingDocuments}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Messages non lus
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.unreadMessages}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Actions rapides</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => {/* Implémenter la logique */}}
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Planifier une visite
              </span>
            </button>

            <button
              onClick={() => {/* Implémenter la logique */}}
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Valider des documents
              </span>
            </button>

            <button
              onClick={() => {/* Implémenter la logique */}}
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Envoyer un message
              </span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
