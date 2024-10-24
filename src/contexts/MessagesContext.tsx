'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './AuthContext';
import type { Message as MessageType } from '@/types';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
}

interface MessagesContextType {
  messages: MessageType[];
  contacts: Contact[];
  loading: boolean;
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '!=', user.uid));
      const snapshot = await getDocs(q);
      const contactsList: Contact[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        contactsList.push({
          id: doc.id,
          name: data.name || data.email,
          avatar: data.avatar,
        });
      });
      setContacts(contactsList);
      setLoading(false);
    };

    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('senderId', 'in', [user.uid, selectedContact?.id]),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList: MessageType[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          read: data.read || false,
          createdAt: data.timestamp?.toDate() || new Date(),
          attachments: data.attachments || [],
        });
      });
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [user, selectedContact]);

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) return;

    await addDoc(collection(db, 'messages'), {
      senderId: user.uid,
      receiverId,
      content,
      read: false,
      timestamp: serverTimestamp(),
      createdAt: new Date(),
    });
  };

  return (
    <MessagesContext.Provider 
      value={{ 
        messages, 
        contacts, 
        loading, 
        selectedContact, 
        setSelectedContact, 
        sendMessage 
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}