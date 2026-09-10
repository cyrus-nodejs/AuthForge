import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  import {
    authResponse,
    error,
  } from '@/lib/auth/bff-response';
  
  export async function POST() {
    try {
      const result =
        await authFortClient.refresh();
  
      return authResponse(result);
    } catch (cause) {
      const response =
        error(cause);
  
      response.cookies.delete(
        '__Host-authfort_at',
      );
  
      response.cookies.delete(
        '__Host-authfort_rt',
      );
  
      return response;
    }
  }