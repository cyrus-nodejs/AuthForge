'use client';

import {
  create,
} from 'zustand';

import type {
  AuthUser,
  AuthSession,
  SessionResponse,
} from '@/lib/auth/contracts';

type AuthStatus =
  | 'unknown'
  | 'authenticated'
  | 'unauthenticated'
  | 'expired';

interface AuthState {
  status: AuthStatus;
  user?: AuthUser;
  session?: AuthSession;
  requestId?: string;

  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth =
  create<AuthState>((set) => ({
    status: 'unknown',

    async hydrate() {
      try {
        const response =
          await fetch(
            '/api/auth/session',
            {
              method: 'GET',
              cache: 'no-store',
              headers: {
                accept:
                  'application/json',
              },
            },
          );

        const payload =
          (await response.json()) as
            SessionResponse & {
              requestId?: string;
            };

        if (
          response.status === 401 ||
          !payload.authenticated
        ) {
          set({
            status:
              'unauthenticated',
            user: undefined,
            session: undefined,
          });

          return;
        }

        set({
          status:
            'authenticated',
          user:
            payload.user,
          session:
            payload.session,
          requestId:
            payload.requestId,
        });
      } catch {
        set({
          status:
            'unauthenticated',
          user: undefined,
          session: undefined,
        });
      }
    },

    async logout() {
      await fetch(
        '/api/auth/logout',
        {
          method: 'POST',
          headers: {
            'x-csrf-token':
              getClientCsrfToken(),
          },
        },
      );

      set({
        status:
          'unauthenticated',
        user: undefined,
        session: undefined,
      });

      window.location.assign(
        '/login',
      );
    },
  }));

function getClientCsrfToken() {
  if (
    typeof document ===
    'undefined'
  ) {
    return '';
  }

  return (
    document.cookie
      .split('; ')
      .find(row =>
        row.startsWith(
          'csrf-token=',
        ),
      )
      ?.split('=')[1] ?? ''
  );
}