'use client';

import { Layout } from '@/components/layout/Layout';
import { useVisits } from '@/hooks/useVisits';
import { useAuth } from '@/contexts/AuthContext';
import { Visit } from '@/types';
import { useState } from 'react';
import Link from 'next/link';

export default function VisitsPage() {
  const { user } = useAuth();
  const { visits, loading, error, updateVisitStatus, addVisitNotes } = useVisits(
    user?.id || '',
    (user?.role === 'agent' || user?.role === 'client') ? user.role : 'client'
  );
  const [editingVisit, setEditingVisit] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const handleStatusChange = async (visitId: string, status: Visit['status']) => {
    try {
      await updateVisitStatus(visitId, status);
    } catch (error) {
      console.error('Error updating visit status:', error);
    }
  };

  const handleNotesSubmit = async (visitId: string) => {
    try {
      await addVisitNotes(visitId, notes);
      setEditingVisit(null);
      setNotes('');
    } catch (error) {
      console.error('Error adding visit notes:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Property Visits</h1>
            <p className="mt-2 text-sm text-gray-700">
              {user?.role === 'client'
                ? 'View and manage your property visits'
                : 'Manage scheduled property visits'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Property
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        {user?.role === 'client' ? 'Agent' : 'Client'}
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {visits.map((visit) => (
                      <tr key={visit.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <Link
                            href={`/property/${visit.propertyId}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Property
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {user?.role === 'client' ? visit.agentId : visit.clientId}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(visit.date).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              visit.status === 'scheduled'
                                ? 'bg-green-100 text-green-800'
                                : visit.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {visit.status}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {user?.role === 'agent' && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  handleStatusChange(visit.id, 'scheduled')
                                }
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(visit.id, 'cancelled')
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => setEditingVisit(visit.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Add Notes
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Modal */}
        {editingVisit && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Visit Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 border border-gray-300 rounded-md p-2"
                placeholder="Enter visit notes..."
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setEditingVisit(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleNotesSubmit(editingVisit)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
