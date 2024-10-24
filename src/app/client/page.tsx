'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  ClockIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState({
    daysLeft: 0,
    isActive: false
  });
  const [stats, setStats] = useState({
    pendingDocuments: 0,
    upcomingVisits: 0,
    unreadMessages: 0
  });

  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      const userData = userDoc.docs[0]?.data();
      if (userData?.subscriptionEndDate) {
        const endDate = userData.subscriptionEndDate.toDate();
        const now = new Date();
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setSubscriptionData({
          daysLeft,
          isActive: daysLeft > 0
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      // Récupérer les documents en attente
      const documentsQuery = query(
        collection(db, 'documents'),
        where('userId', '==', user.uid),
        where('status', '==', 'PENDING')
      );
      const documentsSnapshot = await getDocs(documentsQuery);

      // Récupérer les visites à venir
      const visitsQuery = query(
        collection(db, 'visits'),
        where('clientId', '==', user.uid),
        where('status', '==', 'CONFIRMED')
      );
      const visitsSnapshot = await getDocs(visitsQuery);

      setStats({
        pendingDocuments: documentsSnapshot.size,
        upcomingVisits: visitsSnapshot.size,
        unreadMessages: 0 // À implémenter avec la messagerie en temps réel
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchStats();
    }
  }, [user, fetchUserData, fetchStats]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Bannière d'abonnement */}
        <div className={`rounded-md p-4 mb-6 ${
          subscriptionData.isActive ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <ClockIcon className={`h-5 w-5 ${
                subscriptionData.isActive ? 'text-green-400' : 'text-red-400'
              }`} />
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                subscriptionData.isActive ? 'text-green-800' : 'text-red-800'
              }`}>
                {subscriptionData.isActive
                  ? `Votre abonnement est actif - ${subscriptionData.daysLeft} jours restants`
                  : 'Votre abonnement a expiré'}
              </h3>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Documents à fournir
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
                <CalendarIcon className="h-6 w-6 text-gray-400" />
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Visites prévues
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.upcomingVisits}
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
              onClick={() => window.location.href = '/client/documents'}
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Gérer mes documents
              </span>
            </button>

            <button
              onClick={() => window.location.href = '/client/visits'}
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Voir mes visites
              </span>
            </button>

            <button
              onClick={() => window.location.href = '/client/messages'}
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Contacter mon agent
              </span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
