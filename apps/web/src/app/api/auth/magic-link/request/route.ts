import {
    NextRequest,
  } from 'next/server';
  
  import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  import {
    body,
  } from '@/lib/auth/request';
  
  import {
    error,
    json,
  } from '@/lib/auth/bff-response';
  
  interface MagicLinkRequest {
    email: string;
    purpose?:
      | 'signup'
      | 'login';
  }
  
  export async function POST(
    request: NextRequest,
  ) {
    try {
      const input =
        await body<MagicLinkRequest>(
          request,
        );
  
      const result =
        await authFortClient.request(
          '/auth/magic-link/request',
          {
            method: 'POST',
            body: JSON.stringify(
              input,
            ),
          },
        );
  
      return json(result);
    } catch (cause) {
      return error(cause);
    }
  }