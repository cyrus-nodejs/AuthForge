'use client';

import {
  randomUUID,
} from 'crypto';

export function clientRequestId(): string {
  /*
   * Browser-compatible fallback. crypto.randomUUID()
   * is preferred and available in supported browsers.
   */
  if (
    typeof window !==
      'undefined' &&
    'crypto' in window &&
    typeof window.crypto.randomUUID ===
      'function'
  ) {
    return window.crypto.randomUUID();
  }

  return randomUUID();
}

export async function clientFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const requestId =
    clientRequestId();

  return fetch(
    input,
    {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        'x-request-id':
          requestId,
      },
    },
  );
}