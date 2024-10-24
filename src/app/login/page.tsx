'use client';

import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';

export default function LoginPage() {
  const { user } = useAuth();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Login to Your Account
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
