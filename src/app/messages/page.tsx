'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { db } from '@/config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import type { Message } from '@/types';

interface MessageWithId extends Message {
  id: string;
}

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithId[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch contacts based on user's role
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      
      const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);
      const userData = userSnapshot.docs[0]?.data();
      const userRole = userData?.role;
      
      const q = query(
        collection(db, 'users'),
        where('role', '==', userRole === 'client' ? 'agent' : 'client')
      );
      
      const snapshot = await getDocs(q);
      setContacts(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    };

    fetchContacts();
  }, [user]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!user || !selectedContact) return;

    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as MessageWithId))
        .filter(msg => 
          msg.senderId === selectedContact.id || 
          msg.receiverId === selectedContact.id
        );
      
      setMessages(newMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user, selectedContact]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      await addDoc(collection(db, 'messages'), {
        content: newMessage,
        senderId: user.uid,
        receiverId: selectedContact.id,
        participants: [user.uid, selectedContact.id],
        createdAt: Timestamp.now(),
        read: false
      });

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Contacts Sidebar */}
        <div className="w-64 bg-gray-50 border-r">
          <div className="p-4">
            <h2 className="text-lg font-medium text-gray-900">Contacts</h2>
            <div className="mt-4 space-y-2">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    selectedContact?.id === contact.id
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{contact.email}</div>
                  <div className="text-sm text-gray-500">{contact.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b px-4 py-2">
                <div className="font-medium">{selectedContact.email}</div>
                <div className="text-sm text-gray-500">{selectedContact.role}</div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.senderId === user.uid ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-2 rounded-lg ${
                        message.senderId === user.uid
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {message.createdAt.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="bg-white border-t p-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Sélectionnez un contact pour commencer une conversation
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
