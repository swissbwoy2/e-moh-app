import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const { user, role } = useAuth();

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Utilisateurs', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Documents', href: '/admin/documents', icon: DocumentTextIcon },
  ];

  const agentLinks = [
    { name: 'Dashboard', href: '/agent', icon: HomeIcon },
    { name: 'Mes clients', href: '/agent/clients', icon: UserGroupIcon },
    { name: 'Visites', href: '/agent/visits', icon: CalendarIcon },
    { name: 'Messages', href: '/agent/messages', icon: ChatBubbleLeftRightIcon },
  ];

  const clientLinks = [
    { name: 'Dashboard', href: '/client', icon: HomeIcon },
    { name: 'Mes documents', href: '/client/documents', icon: DocumentTextIcon },
    { name: 'Mes visites', href: '/client/visits', icon: CalendarIcon },
    { name: 'Messages', href: '/client/messages', icon: ChatBubbleLeftRightIcon },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'AGENT' ? agentLinks : clientLinks;

  return (
    <div className="flex flex-col w-64 bg-white shadow">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {links.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
