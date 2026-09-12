'use client';

import {
  useEffect,
  type ReactNode,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  useAuth,
} from '../hooks/use-auth';

interface Props {
  children: ReactNode;
}

export function AuthRouteGuard({
  children,
}: Props) {
  const router = useRouter();

  const status =
    useAuth(
      state => state.status,
    );
const auth = useAuth;
  useEffect(() => {
    if (
      status ===
      'unauthenticated'
    ) {
      router.replace('/login');
    }
  }, [status, router]);

  if (
    status === 'unknown' ||
    status ===
      'unauthenticated'
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
      </div>
    );
  }

  return children;
}