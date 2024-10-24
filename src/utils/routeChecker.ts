import { auth } from '../config/firebase';

export const routes = {
  public: ['/', '/login', '/register'],
  admin: ['/admin', '/admin/users', '/admin/documents'],
  agent: ['/agent', '/agent/clients', '/agent/visits', '/agent/messages'],
  client: ['/client', '/client/documents', '/client/visits', '/client/messages']
};

export const checkRouteAccess = (pathname: string, userRole?: string | null) => {
  if (routes.public.includes(pathname)) return true;
  
  if (!userRole) return false;

  switch (userRole) {
    case 'ADMIN':
      return routes.admin.includes(pathname);
    case 'AGENT':
      return routes.agent.includes(pathname);
    case 'CLIENT':
      return routes.client.includes(pathname);
    default:
      return false;
  }
};
