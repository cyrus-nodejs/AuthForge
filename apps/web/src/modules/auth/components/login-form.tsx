'use client';

import {
  useState,
} from 'react';

import {
  useForm,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  z,
} from 'zod';

import {
  KeyRound,
  Mail,
  Chrome,
  ArrowRight,
  Loader2,
} from 'lucide-react';

import {
  AuthButton,
} from './auth-button';

import {
  AuthError,
} from './auth-error';

import {
  AuthInput,
} from './auth-input';

import {
  requestMagicLink,
} from '../services/auth.service';

import {
  beginPasskeyLogin,
} from '../services/passkey.client';

const schema = z.object({
  email: z.string().trim().email(
    'Enter a valid email address',
  ),
});

type FormValues =
  z.infer<typeof schema>;

export function LoginForm({
  onMagicLinkSent,
}: {
  onMagicLinkSent: (
    email: string,
  ) => void;
}) {
  const [error, setError] =
    useState<string>();

  const [passkeyLoading, setPasskeyLoading] =
    useState(false);

  const form =
    useForm<FormValues>({
      resolver:
        zodResolver(schema),
      defaultValues: {
        email: '',
      },
    });

  async function submit(
    values: FormValues,
  ) {
    setError(undefined);

    try {
      await requestMagicLink(
        values.email,
        'login',
      );

      onMagicLinkSent(
        values.email,
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to continue',
      );
    }
  }

  async function passkey() {
    setError(undefined);
    setPasskeyLoading(true);

    try {
      const response =
        await beginPasskeyLogin();

      if (!response.ok) {
        throw new Error(
          'Passkey authentication failed',
        );
      }

      window.location.assign(
        '/dashboard',
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Passkey authentication failed',
      );
    } finally {
      setPasskeyLoading(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Error */}
      <AuthError message={error} />

      {/* Email authentication */}
      <form
        onSubmit={form.handleSubmit(
          submit,
        )}
        className="space-y-4"
      >
        <AuthInput
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={
            form.formState.errors.email
              ?.message
          }
          {...form.register('email')}
        />

        <AuthButton
          type="submit"
          loading={
            form.formState.isSubmitting
          }
          className="group"
        >
          <Mail className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          <span>Continue with email</span>
          <ArrowRight className="ml-auto h-4 w-4 opacity-60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
        </AuthButton>
      </form>

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-slate-200" />

        <span className="mx-4 shrink-0 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
          or continue with
        </span>

        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 to-slate-200" />
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={() =>
          window.location.assign(
            '/api/auth/google',
          )
        }
        className={[
          'group flex min-h-12 w-full items-center',
          'justify-center gap-3 rounded-xl',
          'border border-slate-200/90',
          'bg-white px-5',
          'text-sm font-semibold text-slate-700',
          'shadow-sm shadow-slate-950/[0.03]',
          'transition-all duration-200',
          'hover:-translate-y-0.5',
          'hover:border-slate-300',
          'hover:bg-slate-50/80',
          'hover:shadow-md hover:shadow-slate-950/[0.06]',
          'active:translate-y-0 active:scale-[0.99]',
          'focus:outline-none',
          'focus-visible:ring-4 focus-visible:ring-slate-950/10',
          'sm:min-h-[52px]',
        ].join(' ')}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-white shadow-sm">
          <Chrome className="h-4 w-4 text-slate-700" />
        </span>

        <span>
          Continue with Google
        </span>
      </button>

      {/* Passkey */}
      <button
        type="button"
        disabled={passkeyLoading}
        onClick={passkey}
        className={[
          'group flex min-h-12 w-full items-center',
          'justify-center gap-3 rounded-xl',
          'border border-slate-200/90',
          'bg-slate-50/60 px-5',
          'text-sm font-semibold text-slate-700',
          'transition-all duration-200',
          'hover:-translate-y-0.5',
          'hover:border-slate-300',
          'hover:bg-slate-100',
          'hover:shadow-md hover:shadow-slate-950/[0.05]',
          'active:translate-y-0 active:scale-[0.99]',
          'focus:outline-none',
          'focus-visible:ring-4 focus-visible:ring-slate-950/10',
          'disabled:cursor-not-allowed',
          'disabled:opacity-50',
          'disabled:hover:translate-y-0',
          'disabled:hover:shadow-none',
          'sm:min-h-[52px]',
        ].join(' ')}
      >
        {passkeyLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
            <KeyRound className="h-3.5 w-3.5" />
          </span>
        )}

        <span>
          {passkeyLoading
            ? 'Checking passkey…'
            : 'Continue with passkey'}
        </span>
      </button>

      {/* Security hint */}
      <p className="px-4 text-center text-[11px] leading-5 text-slate-400">
        Secure authentication with no password required.
      </p>
    </div>
  );
}
