'use client';

import {
  useEffect,
} from 'react';

export function useCsrf() {
  useEffect(() => {
    void fetch(
      '/api/auth/csrf',
      {
        method: 'GET',
        cache: 'no-store',
      },
    );
  }, []);
}

export function csrfToken(): string {
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