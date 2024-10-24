'use client';

import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { useMessages } from '@/contexts/MessagesContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MessagePage({ params }: { params: { userId: string } }) {
  const {
    messages,
    contacts,
    loading,
    sendMessage,
    selectedContact,
    setSelectedContact,
  } = useMessages();
  const { user } = useAuth();

  // Set selected contact based on URL parameter
  useEffect(() => {
    const contact = contacts.find(c => c.id === params.userId);
    if (contact) {
      setSelectedContact(contact);
    }
  }, [params.userId, contacts, setSelectedContact]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (!selectedContact) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-gray-500">Select a contact to start messaging</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <ChatWindow
          messages={messages}
          contact={selectedContact}
          currentUser={user!}
          onSendMessage={sendMessage}
        />
      </div>
    </Layout>
  );
}