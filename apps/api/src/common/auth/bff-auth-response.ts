import {
    BffAuthResponse,
  } from './auth-cookie.contract';
  
  export function toBffAuthResponse(
    input: {
      user: {
        id: string;
        email: string;
        displayName?: string;
      };
      sessionId: string;
      authenticationLevel: string;
      accessTokenExpiresAt: number;
      refreshTokenExpiresAt: number;
    },
  ): BffAuthResponse {
    return {
      user: input.user,
      session: {
        id: input.sessionId,
        authenticationLevel:
          input.authenticationLevel,
      },
      accessToken: {
        expiresAt:
          input.accessTokenExpiresAt,
      },
      refreshToken: {
        expiresAt:
          input.refreshTokenExpiresAt,
      },
    };
  }