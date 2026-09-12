'use client';

import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function AuthButton({
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: AuthButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={[
        // Layout
        'flex w-full items-center justify-center gap-2',
        'min-h-12 sm:min-h-[52px]',
        'rounded-xl sm:rounded-[14px]',
        'px-4 sm:px-5',

        // Typography
        'text-sm sm:text-[15px] font-semibold',
        'tracking-[-0.01em]',

        // Premium background
        'bg-gradient-to-b from-slate-900 to-slate-950',
        'text-white',

        // Border + depth
        'border border-white/10',
        'shadow-[0_4px_14px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]',

        // Motion
        'transition-all duration-200 ease-out',
        'active:scale-[0.98]',

        // Hover
        'hover:from-slate-800 hover:to-slate-950',
        'hover:shadow-[0_6px_20px_rgba(15,23,42,0.24)]',

        // Focus
        'focus:outline-none',
        'focus-visible:ring-4',
        'focus-visible:ring-slate-950/10',
        'focus-visible:ring-offset-2',

        // Disabled
        'disabled:cursor-not-allowed',
        'disabled:opacity-50',
        'disabled:shadow-none',
        'disabled:hover:from-slate-900',
        'disabled:hover:to-slate-950',

        // User-provided classes
        className,
      ].join(' ')}
    >
      {loading && (
        <Loader2
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin"
        />
      )}

      <span className="truncate">
        {children}
      </span>
    </button>
  );
}
