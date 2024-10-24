import React from 'react';
import { MessagesProvider } from '@/contexts/MessagesContext';
import { Sidebar } from '@/components/messages/Sidebar';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MessagesProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </MessagesProvider>
  );
}