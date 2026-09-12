export const AUTH_COOKIE_NAMES = {
    ACCESS_TOKEN:
      '__Host-authfort_at',
    REFRESH_TOKEN:
      '__Host-authfort_rt',
  } as const;
  
  export interface AuthTokenResponse {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
    sessionId: string;
  }
  
  export interface BffAuthResponse {
    user: {
      id: string;
      email: string;
      displayName?: string;
    };
  
    session: {
      id: string;
      authenticationLevel: string;
    };
  
    accessToken: {
      expiresAt: number;
    };
  
    refreshToken: {
      expiresAt: number;
    };
  }
  
  export const AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
  };
  
  export const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    path: '/api/auth',
  };