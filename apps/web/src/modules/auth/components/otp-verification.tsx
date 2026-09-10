'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  ArrowLeft,
  MailCheck,
} from 'lucide-react';

import {
  AuthButton,
} from './auth-button';

import {
  AuthError,
} from './auth-error';

import {
  requestMagicLink,
  requestOtp,
  verifyOtp,
} from '../services/auth.service';

interface Props {
  email: string;
  onBack: () => void;
}

export function OtpVerification({
  email,
  onBack,
}: Props) {
  const [
    code,
    setCode,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState<string>();

  const [
    resendIn,
    setResendIn,
  ] = useState(30);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  useEffect(() => {
    if (resendIn <= 0) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setResendIn(
          value => Math.max(0, value - 1),
        );
      }, 1000);

    return () =>
      window.clearInterval(
        timer,
      );
  }, [resendIn]);

  async function resend() {
    if (resendIn > 0) {
      return;
    }

    setError(undefined);

    try {
      await requestMagicLink(
        email,
        'login',
      );

      setResendIn(30);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to resend link',
      );
    }
  }

  async function submit() {
    if (!/^\d{6}$/.test(code)) {
      setError(
        'Enter the 6-digit verification code.',
      );
      return;
    }

    setError(undefined);
    setSubmitting(true);

    try {
      /*
       * OTP attempt creation is API-driven. This endpoint accepts
       * the challenge established by the adaptive authentication
       * flow.
       */
      const attempt =
        await requestOtp(email);

      await verifyOtp({
        attemptId:
          attempt.attemptId,
        code,
      });

      window.location.assign(
        '/dashboard',
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Verification failed',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="rounded-2xl bg-slate-100 p-4">
          <MailCheck className="h-7 w-7 text-slate-900" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-500">
          Enter the verification code sent to
        </p>
        <p className="mt-1 font-medium text-slate-950">
          {email}
        </p>
      </div>

      <AuthError message={error} />

      <input
        value={code}
        onChange={event =>
          setCode(
            event.target.value
              .replace(/\D/g, '')
              .slice(0, 6),
          )
        }
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="000000"
        maxLength={6}
        className="h-14 w-full rounded-xl border border-slate-200 text-center text-2xl font-semibold tracking-[0.4em] text-slate-950 outline-none focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5"
      />

      <AuthButton
        type="button"
        loading={submitting}
        onClick={submit}
      >
        Verify and continue
      </AuthButton>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Change email
        </button>

        <button
          type="button"
          disabled={resendIn > 0}
          onClick={resend}
          className="font-medium text-slate-950 disabled:text-slate-400"
        >
          {resendIn > 0
            ? `Resend in ${resendIn}s`
            : 'Resend code'}
        </button>
      </div>
    </div>
  );
}