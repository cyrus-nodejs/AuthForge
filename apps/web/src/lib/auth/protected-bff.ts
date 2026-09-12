import {
    NextRequest,
    NextResponse,
  } from 'next/server';
  
  import {
    authFortClient,
  } from './authfort-client';
  
  import {
    enforceBffSecurity,
    securityHeaders,
  } from './bff-security';
  
  export async function protectedBff(
    request: NextRequest,
    path: string,
  ) {
    const security =
      enforceBffSecurity(request);
  
    const csrf =
      request.headers.get(
        'x-csrf-token',
      );
  
    const csrfCookie =
      request.cookies.get(
        'csrf-token',
      )?.value;
  
    if (
      request.method !== 'GET' &&
      (!csrf ||
        !csrfCookie ||
        csrf !== csrfCookie)
    ) {
      return securityHeaders(
        NextResponse.json(
          {
            error: {
              code: 'CSRF_INVALID',
              message:
                'Invalid CSRF token',
            },
          },
          {
            status: 403,
          },
        ),
        security.requestId,
      );
    }
  
    const body =
      request.method === 'GET'
        ? undefined
        : await request.text();
  
    const response =
      await authFortClient.rawRequest(
        path,
        {
          method:
            request.method,
          headers: {
            ...(body
              ? {
                  'content-type':
                    'application/json',
                }
              : {}),
            'x-request-id':
              security.requestId,
            ...(security.fingerprint
              ? {
                  'x-auth-fingerprint':
                    security.fingerprint,
                }
              : {}),
          },
          body,
        },
      );
  
    const result =
      new NextResponse(
        await response.text(),
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