'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  Check,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

import {
  useAuth,
} from '@/modules/auth/hooks/use-auth';

import {
  PasskeyPrompt,
} from '@/modules/auth/components/passkey-prompt';

import {
  completeOnboarding,
} from '@/modules/onboarding/services/onboarding.service';

export default function OnboardingPage() {
  const router = useRouter();

  const {
    status,
    user,
    session,
    hydrate,
  } = useAuth();

  const [
    completing,
    setCompleting,
  ] = useState(false);

  const [
    showPasskey,
    setShowPasskey,
  ] = useState(false);

  useEffect(() => {
    if (
      status ===
      'unauthenticated'
    ) {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (
      status !== 'authenticated' ||
      !session
    ) {
      return;
    }

    if (
      session.onboarding
        ?.completed
    ) {
      router.replace('/dashboard');
      return;
    }

    if (
      session.onboarding
        ?.passkeyRegistrationRequired
    ) {
      setShowPasskey(true);
    }
  }, [
    status,
    session,
    router,
  ]);

  async function finish() {
    setCompleting(true);

    try {
      await completeOnboarding();
      await hydrate();
      router.replace('/dashboard');
    } finally {
      setCompleting(false);
    }
  }

  if (
    status === 'unknown' ||
    status ===
      'unauthenticated'
  ) {
    return null;
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
          <div className="w-full">
            <div className="mb-10">
              <div className="mb-6 inline-flex rounded-2xl bg-slate-100 p-3">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <p className="text-sm font-medium text-slate-500">
                Welcome to AuthFort
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                Your account is ready.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-500">
                {user?.displayName
                  ? `Welcome, ${user.displayName}.`
                  : 'Let’s finish setting up your secure account.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-6">
                <Check className="h-5 w-5 text-slate-950" />
                <h2 className="mt-5 font-semibold text-slate-950">
                  Email verified
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your account identity has been verified.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6">
                <KeyRound className="h-5 w-5 text-slate-950" />
                <h2 className="mt-5 font-semibold text-slate-950">
                  Secure sign-in
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add a passkey for faster future authentication.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={completing}
              onClick={finish}
              className="mt-8 h-12 rounded-xl bg-slate-950 px-6 text-sm font-medium text-white disabled:opacity-50"
            >
              {completing
                ? 'Finishing…'
                : 'Continue to dashboard'}
            </button>
          </div>
        </div>
      </main>

      <PasskeyPrompt
        open={showPasskey}
        onComplete={() => {
          setShowPasskey(false);
        }}
        onDismiss={() => {
          setShowPasskey(false);
        }}
      />
    </>
  );
}