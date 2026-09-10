import { NextRequest } from 'next/server';

export function getOrigin(
  request: NextRequest,
): string | null {
  return request.headers.get('origin');
}

export function isSameOrigin(
  request: NextRequest,
): boolean {
  const origin = getOrigin(request);

  if (!origin) {
    return true;
  }

  return origin === request.nextUrl.origin;
}

export function assertSafeOrigin(
  request: NextRequest,
): void {
  if (!isSameOrigin(request)) {
    throw new Error('Invalid request origin');
  }
}

export function getCsrfToken(
  request: NextRequest,
): string | null {
  return (
    request.headers.get(
      'x-csrf-token',
    ) ??
    request.cookies.get(
      'csrf-token',
    )?.value ??
    null
  );
}