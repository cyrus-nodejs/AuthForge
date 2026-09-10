'use client';

import {
  useAuth,
} from '@/modules/auth/hooks/use-auth';

export default function DashboardPage() {
  const {
    user,
    logout,
  } = useAuth();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">
              AuthFort
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Dashboard
            </h1>
          </div>

          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        </header>

        <section className="mt-12 rounded-3xl border border-slate-200 p-8">
          <p className="text-sm text-slate-500">
            Signed in as
          </p>
          <p className="mt-2 text-lg font-medium text-slate-950">
            {user?.email}
          </p>
        </section>
      </div>
    </main>
  );
}