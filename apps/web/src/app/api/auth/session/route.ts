import {
    NextRequest,
    NextResponse,
  } from 'next/server';
  
  import {
    authFortClient,
  } from '@/lib/auth/authfort-client';
  
  import {
    enforceBffSecurity,
    securityHeaders,
  } from '@/lib/auth/bff-security';
  
  export async function GET(
    request: NextRequest,
  ) {
    const security =
      enforceBffSecurity(request);
  
    const response =
      await authFortClient.rawRequest(
        '/auth/session',
        {
          method: 'GET',
          headers: {
            'x-request-id':
              security.requestId,
            ...(security.fingerprint
              ? {
                  'x-auth-fingerprint':
                    security.fingerprint,
                }
              : {}),
          },
        },
      );
  
    const body =
      await response.text();
  
    const result =
      new NextResponse(
        body,
        {
          status:
            response.status,
          headers: {
            'content-type':
              response.headers.get(
                'content-type',
              ) ??
              'application/json',
          },
        },
      );
  
    return securityHeaders(
      result,
      security.requestId,
    );
  }