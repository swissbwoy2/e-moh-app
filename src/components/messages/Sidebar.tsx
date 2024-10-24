import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessagesContext';
import { User } from '@/types';

interface ContactProps {
  contact: User;
  lastMessage?: string;
  unreadCount?: number;
  isActive: boolean;
  onClick: () => void;
}

const Contact: React.FC<ContactProps> = ({
  contact,
  lastMessage,
  unreadCount,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 ${
      isActive ? 'bg-blue-50' : ''
    }`}
  >
    {/* Avatar */}
    <div className="relative flex-shrink-0">
      {contact.photoURL ? (
        <img
          src={contact.photoURL}
          alt={contact.displayName}
          className="h-12 w-12 rounded-full"
        />
      ) : (
        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xl text-gray-600">
            {contact.displayName?.[0] || contact.email[0].toUpperCase()}
          </span>
        </div>
      )}
      {unreadCount ? (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
          {unreadCount}
        </span>
      ) : null}
    </div>

    {/* Contact Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-gray-900 truncate">
          {contact.displayName || contact.email}
        </p>
      </div>
      {lastMessage && (
        <p className="mt-1 text-sm text-gray-500 truncate">{lastMessage}</p>
      )}
    </div>
  </button>
);

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const {
    contacts,
    selectedContact,
    setSelectedContact,
    unreadCounts,
    lastMessages,
    loading,
  } = useMessages();

  if (loading) {
    return (
      <aside className="w-96 border-r border-gray-200 bg-white">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-96 border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
      </div>

      <div className="overflow-y-auto h-full">
        {contacts.map((contact) => (
          <Contact
            key={contact.id}
            contact={contact}
            lastMessage={lastMessages[contact.id]}
            unreadCount={unreadCounts[contact.id]}
            isActive={selectedContact?.id === contact.id}
            onClick={() => setSelectedContact(contact)}
          />
        ))}

        {contacts.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        )}
      </div>
    </aside>
  );
};