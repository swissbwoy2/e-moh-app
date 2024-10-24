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
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any;
}

interface MessagesContextType {
  messages: Message[];
  sendMessage: (receiverId: string, content: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('senderId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList: Message[] = [];
      snapshot.forEach((doc) => {
        messagesList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) return;

    await addDoc(collection(db, 'messages'), {
      senderId: user.uid,
      receiverId,
      content,
      timestamp: serverTimestamp(),
    });
  };

  return (
    <MessagesContext.Provider value={{ messages, sendMessage }}>
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