export interface AuthUser {
    id: string;
    email: string;
    displayName?: string;
  }
  
  export interface AuthSession {
    id: string;
    authenticationLevel: string;
  
    onboarding?: {
      completed: boolean;
      passkeyRegistrationRequired?: boolean;
    };
  
    security?: {
      trustedFingerprint?: boolean;
      passkeyAvailable?: boolean;
    };
  }
  
  export interface SessionResponse {
    authenticated: boolean;
    user?: AuthUser;
    session?: AuthSession;
  }

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  sessionId: string;
}

export interface OtpVerifyResponse {
  authenticated: boolean;
  userId?: string;
}
