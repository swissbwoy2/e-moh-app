'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { MessagesProvider } from '@/contexts/MessagesContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MessagesProvider>{children}</MessagesProvider>
    </AuthProvider>
  );
}
