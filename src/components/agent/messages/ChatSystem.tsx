import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import type { User } from '@/types';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Client extends User {
  id: string;
}

export const ChatSystem = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user) return;

    // Fetch clients list
    const clientsQuery = query(
      collection(db, 'users'),
      where('agentId', '==', user.uid)
    );

    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => {
        const data = doc.data();
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
        } as Client;
      });
      setClients(clientsData);
    });

    return () => unsubscribeClients();
  }, [user]);

  useEffect(() => {
    if (!selectedClient || !user) return;

    // Listen for messages in real-time
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', `${user.uid}_${selectedClient.id}`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Message;
      });
      setMessages(messagesData);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedClient, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClient || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: `${user.uid}_${selectedClient.id}`,
        senderId: user.uid,
        receiverId: selectedClient.id,
        content: newMessage,
        timestamp: serverTimestamp(),
        read: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Clients list */}
      <div className="w-1/4 bg-white border-r border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
        </div>
        <div className="overflow-y-auto">
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedClient?.id === client.id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="font-medium text-gray-900">
                {client.displayName || client.email}
              </div>
              <div className="text-sm text-gray-500">
                {client.email}
              </div>
            </div>
          ))}

          {clients.length === 0 && (
            <div className="p-4 text-gray-500 text-center">
              Pas de clients assignés
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedClient ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedClient.displayName || selectedClient.email}
              </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.senderId === user.uid ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.senderId === user.uid
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div>{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.senderId === user.uid ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Écrivez votre message..."
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Sélectionnez une conversation pour commencer
          </div>
        )}
      </div>
    </div>
  );
};
