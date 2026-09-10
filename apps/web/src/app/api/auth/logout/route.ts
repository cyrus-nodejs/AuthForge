import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  import {
    clearAuthCookies,
  } from '@/lib/auth/cookies';
  
  import {
    error,
    logoutResponse,
  } from '@/lib/auth/bff-response';
  
  export async function POST() {
    try {
      await authFortClient.authenticatedRequest(
        '/auth/logout',
        {
          method: 'POST',
          body: JSON.stringify({}),
          
        },
      );
    } catch {
      // Cookie cleanup is mandatory even
      // when the API session is already gone.
    }
  
    await clearAuthCookies();
  
    return logoutResponse();
  }