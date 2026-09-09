import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId: string;
  ip?: string;
  userAgent?: string;
  fingerprint?: string;
  userId?: string;
  sessionId?: string;
}

export const requestContextStorage =
  new AsyncLocalStorage<RequestContext>();

export function getRequestContext() {
  return requestContextStorage.getStore();
}

export function setRequestContext(
  patch: Partial<RequestContext>,
) {
  const context = requestContextStorage.getStore();

  if (!context) {
    return;
  }

  Object.assign(context, patch);
}