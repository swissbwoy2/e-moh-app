import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { db } from '@/config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
} from 'firebase/firestore';

export const ClientAgentAssignment: React.FC = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<{ [clientId: string]: string }>({}); // clientId -> agentId
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersAndAssignments = async () => {
      try {
        // Fetch clients
        const clientsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'client')
        );
        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsList = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];

        // Fetch agents
        const agentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'agent')
        );
        const agentsSnapshot = await getDocs(agentsQuery);
        const agentsList = agentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];

        // Fetch current assignments
        const assignmentsQuery = query(collection(db, 'agent-assignments'));
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        const assignmentsMap: { [key: string]: string } = {};
        assignmentsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          assignmentsMap[data.clientId] = data.agentId;
        });

        setClients(clientsList);
        setAgents(agentsList);
        setAssignments(assignmentsMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users and assignments:', error);
        setLoading(false);
      }
    };

    fetchUsersAndAssignments();
  }, []);

  const handleAssignmentChange = async (clientId: string, agentId: string) => {
    try {
      // Update assignment in Firestore
      const assignmentRef = doc(collection(db, 'agent-assignments'), clientId);
      await updateDoc(assignmentRef, {
        agentId,
        updatedAt: new Date()
      });

      // Update local state
      setAssignments(prev => ({
        ...prev,
        [clientId]: agentId
      }));

      // Create notification for both agent and client
      const notificationsRef = collection(db, 'notifications');
      
      // Notify agent
      await addDoc(notificationsRef, {
        userId: agentId,
        type: 'system',
        title: 'New Client Assignment',
        content: `You have been assigned to a new client: ${clients.find(c => c.id === clientId)?.displayName}`,
        read: false,
        createdAt: new Date()
      });

      // Notify client
      await addDoc(notificationsRef, {
        userId: clientId,
        type: 'system',
        title: 'Agent Assignment',
        content: `You have been assigned to agent: ${agents.find(a => a.id === agentId)?.displayName}`,
        read: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const getClientLoad = (agentId: string) => {
    return Object.values(assignments).filter(id => id === agentId).length;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Client-Agent Assignments</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assign To
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {client.displayName || client.email}
                      </div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {agents.find(a => a.id === assignments[client.id])?.displayName || 'Unassigned'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={assignments[client.id] || ''}
                    onChange={(e) => handleAssignmentChange(client.id, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select an agent</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.displayName || agent.email} ({getClientLoad(agent.id)} clients)
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {clients.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No clients found
        </div>
      )}
    </div>
  );
};