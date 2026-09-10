'use client';

import type {
  ButtonHTMLAttributes,
} from 'react';

import {
  Loader2,
} from 'lucide-react';

interface AuthButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function AuthButton({
  loading,
  children,
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <button
      {...props}
      disabled={
        disabled || loading
      }
      className={[
        'flex h-12 w-full items-center justify-center gap-2 rounded-xl',
        'bg-slate-950 px-5 text-sm font-medium text-white',
        'transition hover:bg-slate-800',
        'focus:outline-none focus:ring-4 focus:ring-slate-950/10',
        'disabled:cursor-not-allowed disabled:opacity-50',
      ].join(' ')}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : null}
      {children}
    </button>
  );
}