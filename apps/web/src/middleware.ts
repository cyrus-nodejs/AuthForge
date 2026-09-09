import {
    NextRequest,
    NextResponse,
  } from 'next/server';
  
  import {
    createRequestId,
    } from '@/lib/security/request-id';
  
  const PUBLIC_PATHS = [
    '/login',
    '/signup',
    '/recovery',
    '/auth/callback',
    '/api/auth',
    '/_next',
    '/favicon.ico',
  ];
  
  const PUBLIC_PREFIXES = [
    '/api/health',
  ];
  
  const PROTECTED_PATHS = [
    '/dashboard',
    '/onboarding',
    '/account',
  ];
  
  function matches(
    pathname: string,
  ): boolean {
    return (
      PUBLIC_PATHS.some(path =>
        pathname === path ||
        pathname.startsWith(`${path}/`),
      ) ||
      PUBLIC_PREFIXES.some(path =>
        pathname === path ||
        pathname.startsWith(`${path}/`),
      )
    );
  }
  
  function isProtected(
    pathname: string,
  ): boolean {
    return PROTECTED_PATHS.some(path =>
      pathname === path ||
      pathname.startsWith(`${path}/`),
    );
  }
  
  export async function middleware(
    request: NextRequest,
  ) {
    const requestId =
      createRequestId(
        request.headers.get(
          'x-request-id',
        ),
      );
  
    const pathname =
      request.nextUrl.pathname;
  
    const requestHeaders =
      new Headers(
        request.headers,
      );
  
    requestHeaders.set(
      'x-request-id',
      requestId,
    );
  
    /*
     * The middleware only performs an inexpensive
     * cookie-presence gate. Final authentication
     * remains server-side in the protected layout/BFF.
     */
    const hasSession =
      Boolean(
        request.cookies.get(
          'auth-session',
        ) ||
          request.cookies.get(
            'access-token',
          ),
      );
  
    if (
      isProtected(pathname) &&
      !hasSession
    ) {
      const login =
        new URL(
          '/login',
          request.url,
        );
  
      login.searchParams.set(
        'returnTo',
        pathname,
      );
  
      const response =
        NextResponse.redirect(
          login,
        );
  
      response.headers.set(
        'x-request-id',
        requestId,
      );
  
      return response;
    }
  
    const response =
      matches(pathname)
        ? NextResponse.next({
            request: {
              headers:
                requestHeaders,
            },
          })
        : NextResponse.next({
            request: {
              headers:
                requestHeaders,
            },
          });
  
    response.headers.set(
      'x-request-id',
      requestId,
    );
  
    return response;
  }
  
  export const config = {
    matcher: [
      '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
  };