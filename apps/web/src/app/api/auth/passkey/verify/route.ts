import {
    NextRequest,
  } from 'next/server';
  
  import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  import {
    authResponse,
    error,
    json
  } from '@/lib/auth/bff-response';
  
  import type {
    PasskeyVerifyResponse,
  } from '@/lib/auth/contracts';
  
  export async function POST(
    request: NextRequest,
  ) {
    try {
      const input =
        await request.json();
  
      const result =
        await authFortClient.request<PasskeyVerifyResponse>(
          '/auth/passkey/login/verify',
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