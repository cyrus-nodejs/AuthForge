import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  import {
    clearAuthCookies,
  } from '@/lib/auth/cookies';
  
  import {
    logoutResponse,
  } from '@/lib/auth/bff-response';
  
  export async function POST() {
    try {
      await authFortClient.authenticatedRequest(
        '/auth/logout/all',
        {
          method: 'POST',
          body: JSON.stringify({}),
        },
      );
    } finally {
      await clearAuthCookies();
    }
  
    return logoutResponse();
  }