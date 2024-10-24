import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import type { User } from '@/types';
import type { SearchMandate } from '@/types/search-mandate';

interface ClientWithSearchMandate extends User {
  id: string;
  searchCriteria?: SearchMandate;
  status: 'active' | 'inactive';
}

export const ClientsList = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientWithSearchMandate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;

      try {
        const clientsQuery = query(
          collection(db, 'users'),
          where('agentId', '==', user.uid)
        );
        const snapshot = await getDocs(clientsQuery);
        const clientsData = await Promise.all(snapshot.docs.map(async doc => {
          const data = doc.data();
          
          // Fetch search mandate
          const mandateQuery = query(
            collection(db, 'search-mandates'),
            where('userId', '==', doc.id)
          );
          const mandateSnapshot = await getDocs(mandateQuery);
          const searchCriteria = mandateSnapshot.docs[0]?.data() as SearchMandate | undefined;

          return {
            id: doc.id,
            uid: data.uid,
            email: data.email,
            role: data.role,
            displayName: data.displayName,
            photoURL: data.photoURL,
            phone: data.phone,
            address: data.address,
            createdAt: data.createdAt.toDate(),
            lastLogin: data.lastLogin.toDate(),
            subscriptionStatus: data.subscriptionStatus,
            subscriptionEndDate: data.subscriptionEndDate?.toDate(),
            searchCriteria,
            status: data.status || 'inactive'
          } as ClientWithSearchMandate;
        }));
        setClients(clientsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Mes Clients</h1>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Nom
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Critères de recherche
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Budget
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {client.displayName || client.email}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {client.searchCriteria ? (
                          `${client.searchCriteria.propertyType} - ${client.searchCriteria.rooms} pièces`
                        ) : (
                          'Pas de critères de recherche'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {client.searchCriteria ? (
                          `${client.searchCriteria.maxBudget.toLocaleString()} CHF`
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {client.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {/* Navigation vers les détails du client */}}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {clients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Vous n'avez pas encore de clients assignés
        </div>
      )}
    </div>
  );
};
