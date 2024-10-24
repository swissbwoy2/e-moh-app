'use client';

import { UserCircleIcon } from '@heroicons/react/24/outline';

interface ProfileCardProps {
  name: string;
  email: string;
  role: string;
  imageUrl?: string;
}

export default function ProfileCard({ name, email, role, imageUrl }: ProfileCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <UserCircleIcon className="h-12 w-12 text-gray-400" />
          )}
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
