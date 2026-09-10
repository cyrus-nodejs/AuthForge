import 'server-only';

import {
  authFortClient,
} from './authfort-client';

import type {
  SessionResponse,
} from './contracts';

export async function getServerSession() {
  try {
    return await authFortClient.authenticatedRequest<SessionResponse>(
      '/auth/session',
    );
  } catch {
    return {
      authenticated: false,
    } satisfies SessionResponse;
  }
}

export async function requireServerSession() {
  const session =
    await getServerSession();

  if (!session.authenticated) {
    throw new Error(
      'AUTHENTICATION_REQUIRED',
    );
  }

  return session;
}