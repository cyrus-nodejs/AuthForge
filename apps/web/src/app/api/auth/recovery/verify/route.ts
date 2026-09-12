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
    authResponse,
    error,
    json
  } from '@/lib/auth/bff-response';
  
  import type {
    RecoveryVerifyResponse,
  } from '@/lib/auth/contracts';
  
  interface RecoveryVerify {
    recoveryAttemptId: string;
    otp?: string;
    recoveryCode?: string;
  }
  
  export async function POST(
    request: NextRequest,
  ) {
    try {
      const input =
        await body<RecoveryVerify>(
          request,
        );
  
      const result =
        await authFortClient.request<RecoveryVerifyResponse>(
          '/auth/recovery/verify',
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