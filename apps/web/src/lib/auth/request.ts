import {
    NextRequest,
  } from 'next/server';
  
  export async function body<T>(
    request: NextRequest,
  ): Promise<T> {
    return request.json() as Promise<T>;
  }
  
  export function forwardedHeaders(
    request: NextRequest,
  ) {
    const headers = new Headers();
  
    const fingerprint =
      request.headers.get(
        'x-device-fingerprint',
      );
  
    const requestId =
      request.headers.get(
        'x-request-id',
      );
  
    if (fingerprint) {
      headers.set(
        'x-device-fingerprint',
        fingerprint,
      );
    }
  
    if (requestId) {
      headers.set(
        'x-request-id',
        requestId,
      );
    }
  
    return headers;
  }