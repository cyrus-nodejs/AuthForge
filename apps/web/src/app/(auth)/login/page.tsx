'use client';

import {
  useState,
} from 'react';

import Link from 'next/link';

import {
  AuthShell,
} from '@/modules/auth/components/auth-shell';

import {
  LoginForm,
} from '@/modules/auth/components/login-form';

import {
  OtpVerification,
} from '@/modules/auth/components/otp-verification';

export default function LoginPage() {
  const [
    email,
    setEmail,
  ] = useState<string>();

  return (
    <AuthShell
      title={
        email
          ? 'Check your email'
          : 'Welcome back'
      }
      description={
        email
          ? `We sent a secure sign-in link to ${email}.`
          : 'Sign in without a password using your preferred secure method.'
      }
      footer={
        <div className="text-center text-sm text-slate-500">
          New to AuthFort?{' '}
          <Link
            href="/signup"
            className="font-medium text-slate-950 hover:underline"
          >
            Create an account
          </Link>
        </div>
      }
    >
      {email ? (
        <OtpVerification
          email={email}
          onBack={() =>
            setEmail(undefined)
          }
        />
      ) : (
        <LoginForm
          onMagicLinkSent={setEmail}
        />
      )}

      {!email ? (
        <div className="mt-5 text-center">
          <Link
            href="/recovery"
            className="text-sm text-slate-500 hover:text-slate-950"
          >
            Can't access your account?
          </Link>
        </div>
      ) : null}
    </AuthShell>
  );
}