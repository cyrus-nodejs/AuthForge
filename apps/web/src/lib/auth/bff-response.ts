import {
    NextResponse,
  } from 'next/server';
  
  import {
    clearAuthCookies,
    setAuthCookies,
  } from './cookies';
  
  import type {
    TokenResponse,
  } from './contracts';
  
  export function json<T>(
    data: T,
    init?: ResponseInit,
  ) {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      init,
    );
  }
  
  export function error(
    error: unknown,
  ) {
    const status =
      error instanceof Error &&
      'status' in error
        ? Number(
            (error as any).status,
          )
        : 500;
  
    return NextResponse.json(
      {
        success: false,
        error: {
          code:
            error instanceof Error &&
            'code' in error
              ? String(
                  (error as any).code,
                )
              : 'AUTHENTICATION_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Authentication request failed',
        },
      },
      { status },
    );
  }
  
  export async function authResponse<
    T extends TokenResponse,
  >(
    data: T,
    body?: unknown,
  ) {
    await setAuthCookies({
      accessToken:
        data.accessToken,
      refreshToken:
        data.refreshToken,
      accessTokenExpiresAt:
        data.accessTokenExpiresAt,
      refreshTokenExpiresAt:
        data.refreshTokenExpiresAt,
    });
  
    return json(
      body ?? {
        authenticated: true,
        sessionId:
          data.sessionId,
      },
    );
  }
  
  export async function logoutResponse() {
    await clearAuthCookies();
  
    return json({
      authenticated: false,
    });
  }