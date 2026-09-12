import {
    NextRequest,
  } from 'next/server';
  
  import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  import {
    error,
    json,
  } from '@/lib/auth/bff-response';
  
  export async function POST(
    request: NextRequest,
  ) {
    try {
      const body =
        await request.text();
  
      const result =
        await authFortClient.authenticatedRequest(
          '/onboarding/complete',
          {
            method: 'POST',
            body,
          },
          )
        ;
  
      return json(result);
    } catch (cause) {
      return error(cause);
    }
  }