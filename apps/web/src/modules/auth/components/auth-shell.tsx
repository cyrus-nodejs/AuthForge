'use client';

import type { ReactNode } from 'react';
import {
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AuthShellProps {
  children: ReactNode;
  title: string;
  description: string;
  footer?: ReactNode;
}

export function AuthShell({
  children,
  title,
  description,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_480px]">
          <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:block">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="mb-10 flex items-center gap-2">
                  <div className="rounded-xl bg-white/10 p-2">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="font-semibold tracking-tight">
                    AuthFort
                  </span>
                </div>

                <div className="max-w-md">
                  <p className="mb-4 text-sm font-medium text-white/60">
                    Passwordless by design
                  </p>

                  <h2 className="text-4xl font-semibold tracking-tight">
                    Authentication that adapts to you.
                  </h2>

                  <p className="mt-5 text-base leading-7 text-white/65">
                    Secure access using magic links, passkeys,
                    trusted devices and adaptive verification.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-white/50">
                <Sparkles className="h-4 w-4" />
                <span>Protected by adaptive risk controls</span>
              </div>
            </div>
          </section>

          <section className="flex min-h-[680px] items-center p-7 sm:p-10">
            <div className="w-full">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>

              {children}

              {footer ? (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  {footer}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}