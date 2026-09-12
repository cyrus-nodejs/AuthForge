'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ArrowLeft,
  Check,
  MailCheck,
  Loader2,
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

  const inputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      window.clearInterval(timer);
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

      inputRef.current?.focus();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to resend code',
      );
    }
  }

  async function submit() {
    if (!/^\d{6}$/.test(code)) {
      setError(
        'Enter the 6-digit verification code.',
      );
      inputRef.current?.focus();
      return;
    }

    setError(undefined);
    setSubmitting(true);

    try {
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
    <div className="w-full space-y-6 sm:space-y-7">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute -inset-2 rounded-[22px] bg-slate-950/[0.04] blur-md" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-slate-950 text-white shadow-sm">
              <MailCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Heading */}
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
          Check your email
        </h2>

        <p className="mx-auto max-w-sm text-sm leading-6 text-slate-500">
          We sent a 6-digit verification
          code to
        </p>

        <div className="mx-auto flex max-w-full items-center justify-center gap-2 px-2">
          <span className="max-w-[260px] truncate rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-800 ring-1 ring-inset ring-slate-200/70">
            {email}
          </span>
        </div>
      </div>

      {/* Error */}
      <AuthError message={error} />

      {/* OTP */}
      <div className="space-y-3">
        <label
          htmlFor="otp"
          className="block text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
        >
          Verification code
        </label>

        <div className="relative">
          <input
            ref={inputRef}
            id="otp"
            value={code}
            onChange={event => {
              setError(undefined);

              setCode(
                event.target.value
                  .replace(/\D/g, '')
                  .slice(0, 6),
              );
            }}
            onKeyDown={event => {
              if (
                event.key === 'Enter'
              ) {
                event.preventDefault();
                submit();
              }
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoCorrect="off"
            spellCheck={false}
            placeholder="000000"
            maxLength={6}
            disabled={submitting}
            aria-label="6-digit verification code"
            className={[
              'h-[68px] w-full rounded-2xl',
              'border border-slate-200',
              'bg-slate-50/60',
              'px-4',
              'text-center text-3xl font-semibold',
              'tracking-[0.32em] text-slate-950',
              'placeholder:text-slate-300',
              'placeholder:tracking-[0.32em]',
              'outline-none',
              'shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)]',
              'transition-all duration-200',
              'hover:border-slate-300',
              'focus:border-slate-950',
              'focus:bg-white',
              'focus:ring-4 focus:ring-slate-950/[0.06]',
              'disabled:cursor-not-allowed',
              'disabled:opacity-60',
              'sm:h-[72px]',
              'sm:text-[32px]',
            ].join(' ')}
          />

          {code.length === 6 &&
            !submitting && (
              <div className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <Check className="h-4 w-4" />
              </div>
            )}
        </div>

        <p className="text-center text-xs text-slate-400">
          Enter the code exactly as it
          appears in your email.
        </p>
      </div>

      {/* Submit */}
      <AuthButton
        type="button"
        loading={submitting}
        onClick={submit}
        disabled={code.length !== 6}
        className="group"
      >
        {submitting ? (
          'Verifying…'
        ) : (
          <>
            <span>
              Verify and continue
            </span>

            <span className="ml-auto opacity-60 transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </>
        )}
      </AuthButton>

      {/* Secondary actions */}
      <div className="flex flex-col items-center gap-4 pt-1 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className={[
            'group inline-flex min-h-10',
            'items-center gap-1.5',
            'rounded-lg px-2',
            'text-sm font-medium text-slate-500',
            'transition-colors',
            'hover:text-slate-950',
            'focus:outline-none',
            'focus-visible:ring-4 focus-visible:ring-slate-950/10',
            'disabled:opacity-50',
          ].join(' ')}
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Change email
        </button>

        <button
          type="button"
          disabled={
            resendIn > 0 ||
            submitting
          }
          onClick={resend}
          className={[
            'inline-flex min-h-10',
            'items-center justify-center',
            'rounded-lg px-3',
            'text-sm font-semibold',
            'transition-all duration-200',
            'focus:outline-none',
            'focus-visible:ring-4 focus-visible:ring-slate-950/10',
            resendIn > 0
              ? 'text-slate-400'
              : 'text-slate-950 hover:bg-slate-50',
          ].join(' ')}
        >
          {resendIn > 0 ? (
            <>
              <span className="tabular-nums">
                Resend in {resendIn}s
              </span>
            </>
          ) : (
            'Resend code'
          )}
        </button>
      </div>

      {/* Security note */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-center">
        <p className="text-[11px] leading-5 text-slate-400">
          Your verification code is
          private and should never be
          shared with anyone.
        </p>
      </div>
    </div>
  );
}
