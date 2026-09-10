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
    <div className="space-y-5">
      <AuthError message={error} />

      <form
        onSubmit={form.handleSubmit(
          submit,
        )}
        className="space-y-5"
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
        >
          <Mail className="h-4 w-4" />
          Continue with email
        </AuthButton>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-slate-400">
            or
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          window.location.assign(
            '/api/auth/google',
          )
        }
        className="h-12 w-full rounded-xl border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Continue with Google
      </button>

      <button
        type="button"
        disabled={passkeyLoading}
        onClick={passkey}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
      >
        <KeyRound className="h-4 w-4" />
        {passkeyLoading
          ? 'Checking passkey…'
          : 'Continue with passkey'}
      </button>
    </div>
  );
}