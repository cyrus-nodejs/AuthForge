'use client';

import type {
  InputHTMLAttributes,
} from 'react';

interface AuthInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AuthInput({
  label,
  error,
  id,
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <input
        id={id}
        aria-invalid={Boolean(error)}
        className={[
          'h-12 w-full rounded-xl border bg-white px-4 text-sm',
          'text-slate-950 outline-none transition',
          'placeholder:text-slate-400',
          'focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5',
          error
            ? 'border-red-300'
            : 'border-slate-200',
        ].join(' ')}
        {...props}
      />

      {error ? (
        <p className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}