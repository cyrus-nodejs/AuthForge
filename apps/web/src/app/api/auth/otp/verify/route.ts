import {
    NextRequest,
  } from 'next/server';
  
  import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  import {
    body,
  } from '@/lib/auth/request';
 
  
  import type {
    OtpVerifyResponse,
  } from '@/lib/auth/contracts';
  import {
  json,
  error,
} from '@/lib/auth/bff-response';

  interface OtpVerifyRequest {
    challengeId: string;
    code: string;
  }
  
  export async function POST(
    request: NextRequest,
  ) {
    try {
      const input =
        await body<OtpVerifyRequest>(
          request,
        );
  
      const result =
  await authFortClient.request<OtpVerifyResponse>(
    '/auth/otp/verify',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );

return json(result);
    } catch (cause) {
      return error(cause);
    }
  }