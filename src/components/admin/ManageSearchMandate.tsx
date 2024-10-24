import React, { useState, useEffect } from 'react';
import { SearchMandate } from '@/types/search-mandate';
import { db } from '@/config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';

export const ManageSearchMandate: React.FC = () => {
  const [mandates, setMandates] = useState<SearchMandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'all'
  );

  useEffect(() => {
    const mandatesRef = collection(db, 'search-mandates');
    const mandatesQuery = query(
      mandatesRef,
      filter !== 'all' ? where('status', '==', filter) : null as any,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      mandatesQuery,
      (snapshot) => {
        const mandatesList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            birthDate: data.birthDate?.toDate(),
            livingAtCurrentAddressSince: data.livingAtCurrentAddressSince?.toDate(),
            employmentStartDate: data.employmentStartDate?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            termsAcceptanceDate: data.termsAcceptanceDate?.toDate(),
            activationDate: data.activationDate?.toDate(),
            expiryDate: data.expiryDate?.toDate(),
          } as SearchMandate;
        });
        setMandates(mandatesList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching search mandates:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filter]);

  const handleStatusChange = async (mandateId: string, action: 'activate' | 'reject') => {
    try {
      const response = await fetch('/api/search-mandate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mandateId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mandate status');
      }
    } catch (error) {
      console.error('Error updating mandate status:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Search Mandates</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-4">
        {mandates.map((mandate) => (
          <div
            key={mandate.id}
            className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
          >
            <div>
              <h3 className="font-semibold">
                {mandate.firstName} {mandate.lastName}
              </h3>
              <p className="text-sm text-gray-600">{mandate.email}</p>
              <p className="text-sm text-gray-600">
                Submitted: {mandate.createdAt.toLocaleDateString()}
              </p>
            </div>

            <div className="space-x-2">
              {mandate.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange(mandate.id!, 'activate')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(mandate.id!, 'reject')}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </>
              )}

              {mandate.status === 'approved' && (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded">
                  Approved
                </span>
              )}

              {mandate.status === 'rejected' && (
                <span className="px-4 py-2 bg-red-100 text-red-800 rounded">
                  Rejected
                </span>
              )}

              <button
                onClick={() => window.open(`/admin/mandate/${mandate.id}`, '_blank')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {mandates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No search mandates found
          </div>
        )}
      </div>
    </div>
  );
};