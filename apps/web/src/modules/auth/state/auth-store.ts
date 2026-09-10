'use client';

import {
  create,
} from 'zustand';

import type {
  AuthSession,
  AuthUser,
} from '@/lib/auth/contracts';

interface AuthState {
  status:
    | 'unknown'
    | 'authenticated'
    | 'unauthenticated';

  user?: AuthUser;
  session?: AuthSession;

  hydrate(): Promise<void>;
  logout(): Promise<void>;
  logoutAll(): Promise<void>;
}

export const useAuthStore =
  create<AuthState>(
    (set) => ({
      status: 'unknown',

      async hydrate() {
        try {
          const response =
            await fetch(
              '/api/auth/session',
              {
                cache: 'no-store',
              },
            );

          if (!response.ok) {
            set({
              status:
                'unauthenticated',
              user: undefined,
              session: undefined,
            });

            return;
          }

          const payload =
            await response.json();

          const session =
            payload.data;

          if (
            !session.authenticated
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
            user: session.user,
            session:
              session.session,
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
          },
        );

        set({
          status:
            'unauthenticated',
          user: undefined,
          session: undefined,
        });
      },

      async logoutAll() {
        await fetch(
          '/api/auth/logout/all',
          {
            method: 'POST',
          },
        );

        set({
          status:
            'unauthenticated',
          user: undefined,
          session: undefined,
        });
      },
    }),
  );