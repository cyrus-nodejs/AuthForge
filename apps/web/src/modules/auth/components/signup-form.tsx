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
  AuthButton,
} from './auth-button';

import {
  AuthError,
} from './auth-error';

import {
  AuthInput,
} from './auth-input';

import {
  signup,
} from '../services/auth.service';

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(
      2,
      'Enter your name',
    )
    .max(80),
  email: z.string().trim().email(
    'Enter a valid email address',
  ),
});

type Values =
  z.infer<typeof schema>;

export function SignupForm({
  onSubmitted,
}: {
  onSubmitted: (
    email: string,
  ) => void;
}) {
  const [
    error,
    setError,
  ] = useState<string>();

  const form =
    useForm<Values>({
      resolver:
        zodResolver(schema),
      defaultValues: {
        displayName: '',
        email: '',
      },
    });

  async function submit(
    values: Values,
  ) {
    setError(undefined);

    try {
      await signup(values);
      onSubmitted(
        values.email,
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to create account',
      );
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
          id="displayName"
          label="Your name"
          autoComplete="name"
          placeholder="Alex Morgan"
          error={
            form.formState.errors.displayName
              ?.message
          }
          {...form.register(
            'displayName',
          )}
        />

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
          Create account
        </AuthButton>
      </form>

      <p className="text-center text-xs leading-5 text-slate-400">
        No password required. We'll send you
        a secure authentication link.
      </p>
    </div>
  );
}