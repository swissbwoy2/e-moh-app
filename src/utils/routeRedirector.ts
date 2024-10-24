import { NextRouter } from 'next/router';

export const handleRouteRedirect = (
  userRole: string | null,
  router: NextRouter
) => {
  if (!userRole) {
    router.push('/login');
    return;
  }

  switch (userRole) {
    case 'ADMIN':
      router.push('/admin');
      break;
    case 'AGENT':
      router.push('/agent');
      break;
    case 'CLIENT':
      router.push('/client');
      break;
    default:
      router.push('/');
  }
};
