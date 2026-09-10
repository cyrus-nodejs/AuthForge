import 'server-only';

import {
  cookies,
} from 'next/headers';

import {
  authConfig,
} from './config';

const baseCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/api/auth',
};

export async function getAccessToken() {
  const store = await cookies();

  return store.get(
    authConfig.accessCookieName,
  )?.value;
}

export async function getRefreshToken() {
  const store = await cookies();

  return store.get(
    authConfig.refreshCookieName,
  )?.value;
}

export async function setAuthCookies(
  input: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
  },
) {
  const store = await cookies();

  store.set(
    authConfig.accessCookieName,
    input.accessToken,
    {
      ...baseCookieOptions,
      maxAge: Math.max(
        0,
        input.accessTokenExpiresAt -
          Math.floor(Date.now() / 1000),
      ),
    },
  );

  store.set(
    authConfig.refreshCookieName,
    input.refreshToken,
    {
      ...refreshCookieOptions,
      maxAge: Math.max(
        0,
        input.refreshTokenExpiresAt -
          Math.floor(Date.now() / 1000),
      ),
    },
  );
}

export async function clearAuthCookies() {
  const store = await cookies();

  store.set(
    authConfig.accessCookieName,
    '',
    {
      ...baseCookieOptions,
      maxAge: 0,
    },
  );

  store.set(
    authConfig.refreshCookieName,
    '',
    {
      ...refreshCookieOptions,
      maxAge: 0,
    },
  );
}