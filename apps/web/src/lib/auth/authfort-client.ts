import {
  cookies,
  headers,
} from 'next/headers';
import type {
  TokenResponse,
} from './contracts';

const API_URL =
  process.env.AUTHFORT_API_URL!;
console.log(API_URL)
type AuthRequestInit = RequestInit & {
  refreshable?: boolean;
};

class AuthFortClient {
  private async buildRequest(
    path: string,
    init: AuthRequestInit = {},
  ): Promise<Response> {

    const {
      refreshable: _refreshable,
      ...requestInit
    } = init;

    const cookieStore =
      await cookies();

    const headerStore =
      await headers();

    const requestId =
      headerStore.get(
        'x-request-id',
      );

    const fingerprint =
      headerStore.get(
        'x-auth-fingerprint',
      );

    const cookieHeader =
      cookieStore
        .getAll()
        .map(
          cookie =>
            `${cookie.name}=${cookie.value}`,
        )
        .join('; ');

    return fetch(
      `${API_URL}${path}`,
      {
        ...init,
        headers: {
          accept:
            'application/json',

          ...(cookieHeader
            ? {
                cookie:
                  cookieHeader,
              }
            : {}),

          ...(requestId
            ? {
                'x-request-id':
                  requestId,
              }
            : {}),

          ...(fingerprint
            ? {
                'x-auth-fingerprint':
                  fingerprint,
              }
            : {}),

          ...(init.headers ?? {}),
        },
        cache: 'no-store',
      },
    );
  }

  async request<T>(
    path: string,
    init: AuthRequestInit = {},
  ): Promise<T> {
    const response =
      await this.buildRequest(
        path,
        init,
      );

    if (!response.ok) {
      const errorBody =
        await response.json().catch(
          () => null,
        );

      throw Object.assign(
        new Error(
          errorBody?.message ??
            `AuthFort request failed: ${response.status}`,
        ),
        {
          status: response.status,
          code: errorBody?.code,
        },
      );
    }

    return response.json() as Promise<T>;
  }

  async rawRequest(
    path: string,
    init: AuthRequestInit = {},
  ): Promise<Response> {
    return this.buildRequest(
      path,
      init,
    );
  }

  async authenticatedRequest<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    return this.request<T>(
      path,
      {
        ...init,
        headers: {
          ...(init.headers ?? {}),
        },
      },
    );
  }

  async refresh(): Promise<TokenResponse> {
  return this.request<TokenResponse>(
    '/auth/token/refresh',
    {
      method: 'POST',
        refreshable: false,
    },
  );
}

}

export const authFortClient =
  new AuthFortClient();
