'use client';

import type {
  SignupResponse,
} from '@/lib/auth/contracts';

export async function signup(
  input: {
    email: string;
    displayName?: string;
  },
): Promise<SignupResponse> {
  const response =
    await fetch(
      '/api/auth/signup',
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify(input),
      },
    );

  const payload =
    await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        'Signup failed',
    );
  }

  return payload.data;
}

export async function requestMagicLink(
  email: string,
  purpose:
    | 'signup'
    | 'login' = 'login',
) {
  const response =
    await fetch(
      '/api/auth/magic-link/request',
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify({
          email,
          purpose,
        }),
      },
    );

  const payload =
    await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        'Unable to send magic link',
    );
  }

  return payload.data;
}

export async function verifyMagicLink(
  token: string,
) {
  const response =
    await fetch(
      '/api/auth/magic-link/verify',
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify({
          token,
        }),
      },
    );

  const payload =
    await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        'Invalid magic link',
    );
  }

  return payload.data;
}

export async function requestOtp(
  attemptId: string,
) {
  const response =
    await fetch(
      '/api/auth/otp/request',
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify({
          attemptId,
        }),
      },
    );

  const payload =
    await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        'Unable to send OTP',
    );
  }

  return payload.data;
}

export async function verifyOtp(
  input: {
    attemptId: string;
    code: string;
  },
) {
  const response =
    await fetch(
      '/api/auth/otp/verify',
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify(input),
      },
    );

  const payload =
    await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        'Invalid OTP',
    );
  }

  return payload.data;
}

export async function startRecovery(
  email: string,
) {
  const response =
    await fetch(
      '/api/auth/recovery/start',
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      },
    );

  const payload =
    await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        'Unable to start recovery',
    );
  }

  return payload.data;
}

export async function verifyRecovery(
  input: {
    recoveryAttemptId: string;
    otp?: string;
    recoveryCode?: string;
  },
) {
  const response =
    await fetch(
      '/api/auth/recovery/verify',
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify(input),
      },
    );

  const payload =
    await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        'Recovery failed',
    );
  }

  return payload.data;
}