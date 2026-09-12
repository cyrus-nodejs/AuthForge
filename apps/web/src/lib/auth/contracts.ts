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

export interface RecoveryVerifyResponse {
  verified: boolean;
  userId: string;
}

export interface SignupResponse {
  challengeId: string;
  method: 'magic_link';
  expiresAt: string;
}

export interface PasskeyVerifyResponse {
  authenticated: boolean;
  userId?: string;
}

