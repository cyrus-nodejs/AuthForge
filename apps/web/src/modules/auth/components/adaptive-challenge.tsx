'use client';

import {
  Mail,
  KeyRound,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

export type ChallengeMethod =
  | 'magic-link'
  | 'otp'
  | 'passkey'
  | 'fingerprint';

interface Props {
  methods: ChallengeMethod[];
  selected?: ChallengeMethod;
  onSelect: (
    method: ChallengeMethod,
  ) => void;
}

const metadata = {
  'magic-link': {
    title: 'Email link',
    description:
      'Receive a secure sign-in link.',
    icon: Mail,
  },
  otp: {
    title: 'Verification code',
    description:
      'Verify using a one-time code.',
    icon: Smartphone,
  },
  passkey: {
    title: 'Passkey',
    description:
      'Use your device authentication.',
    icon: KeyRound,
  },
  fingerprint: {
    title: 'Trusted device',
    description:
      'Verify your trusted device.',
    icon: ShieldCheck,
  },
} as const;

export function AdaptiveChallenge({
  methods,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">
        Choose a verification method
      </p>

      <div className="grid gap-2">
        {methods.map(method => {
          const item =
            metadata[method];

          const Icon =
            item.icon;

          const active =
            selected === method;

          return (
            <button
              key={method}
              type="button"
              onClick={() =>
                onSelect(method)
              }
              className={[
                'flex items-center gap-4 rounded-xl border p-4 text-left transition',
                active
                  ? 'border-slate-950 bg-slate-50'
                  : 'border-slate-200 hover:bg-slate-50',
              ].join(' ')}
            >
              <div className="rounded-lg bg-slate-100 p-2">
                <Icon className="h-4 w-4 text-slate-950" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-950">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}