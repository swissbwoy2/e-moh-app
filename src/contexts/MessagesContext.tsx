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
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './AuthContext';
import type { Message as MessageType, User } from '@/types';

interface LastMessages {
  [key: string]: string;
}

interface UnreadCounts {
  [key: string]: number;
}

interface MessagesContextType {
  messages: MessageType[];
  contacts: User[];
  loading: boolean;
  selectedContact: User | null;
  setSelectedContact: (contact: User | null) => void;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  lastMessages: LastMessages;
  unreadCounts: UnreadCounts;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [lastMessages, setLastMessages] = useState<LastMessages>({});
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '!=', user.uid));
      const snapshot = await getDocs(q);
      const contactsList: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        contactsList.push({
          id: doc.id,
          uid: data.uid,
          email: data.email,
          role: data.role,
          displayName: data.displayName,
          photoURL: data.photoURL,
          createdAt: data.createdAt.toDate(),
          lastLogin: data.lastLogin.toDate(),
          subscriptionStatus: data.subscriptionStatus,
          subscriptionEndDate: data.subscriptionEndDate?.toDate(),
        } as User);
      });
      setContacts(contactsList);
      
      // Fetch last messages and unread counts for each contact
      const messagesRef = collection(db, 'messages');
      contactsList.forEach(async (contact) => {
        // Get last message
        const lastMessageQuery = query(
          messagesRef,
          where('participants', 'array-contains', [user.uid, contact.uid]),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const lastMessageSnap = await getDocs(lastMessageQuery);
        if (!lastMessageSnap.empty) {
          const lastMessage = lastMessageSnap.docs[0].data();
          setLastMessages(prev => ({
            ...prev,
            [contact.id]: lastMessage.content
          }));
        }

        // Get unread count
        const unreadQuery = query(
          messagesRef,
          where('receiverId', '==', user.uid),
          where('senderId', '==', contact.uid),
          where('read', '==', false)
        );
        const unreadSnap = await getDocs(unreadQuery);
        setUnreadCounts(prev => ({
          ...prev,
          [contact.id]: unreadSnap.size
        }));
      });

      setLoading(false);
    };

    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedContact) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains', [user.uid, selectedContact.uid]),
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

      // Update last message for this contact
      if (messagesList.length > 0) {
        setLastMessages(prev => ({
          ...prev,
          [selectedContact.id]: messagesList[0].content
        }));
      }
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
      participants: [user.uid, receiverId],
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
        sendMessage,
        lastMessages,
        unreadCounts
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