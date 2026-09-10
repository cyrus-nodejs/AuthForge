'use client';

import {
  useState,
} from 'react';

import {
  KeyRound,
  X,
} from 'lucide-react';

import {
  registerPasskey,
} from '../services/passkey-registration.client';

interface PasskeyPromptProps {
  open: boolean;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function PasskeyPrompt({
  open,
  onComplete,
  onDismiss,
}: PasskeyPromptProps) {
  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string>();

  if (!open) {
    return null;
  }

  async function create() {
    setLoading(true);
    setError(undefined);

    try {
      await registerPasskey();
      onComplete?.();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Passkey registration failed',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="rounded-2xl bg-slate-100 p-3">
            <KeyRound className="h-6 w-6 text-slate-950" />
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mt-6 text-xl font-semibold tracking-tight text-slate-950">
          Add a passkey
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in faster and protect your account
          with Face ID, Touch ID, Windows Hello,
          or your device PIN.
        </p>

        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          disabled={loading}
          onClick={create}
          className="mt-6 h-12 w-full rounded-xl bg-slate-950 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading
            ? 'Creating passkey…'
            : 'Create passkey'}
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 h-11 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50"
        >
          Not now
        </button>
      </div>
    </div>
  );
}