import Link from "next/link";
import {
  ArrowRight,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: KeyRound,
    title: "Passwordless by default",
    description:
      "Sign in securely with magic links, passkeys, OTP, or trusted devices.",
  },
  {
    icon: Sparkles,
    title: "Adaptive authentication",
    description:
      "AuthFort evaluates risk and selects the right challenge instead of forcing the same flow on everyone.",
  },
  {
    icon: Fingerprint,
    title: "Trusted devices",
    description:
      "Recognize familiar devices while continuously protecting sessions from suspicious activity.",
  },
  {
    icon: ShieldCheck,
    title: "Built for modern security",
    description:
      "Refresh-token rotation, replay detection, secure sessions, and security-event auditing are built in.",
  },
];

const authMethods = [
  "Magic links",
  "Passkeys",
  "One-time passwords",
  "Google",
  "Trusted devices",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
              <LockKeyhole className="h-4.5 w-4.5" />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              AuthFort
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-950">
              Features
            </a>
            <a href="#security" className="transition hover:text-slate-950">
              Security
            </a>
            <a href="#how-it-works" className="transition hover:text-slate-950">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(15,23,42,0.07),transparent_42%)]" />

        <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Modern authentication, without passwords
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Authentication that adapts to your users.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              AuthFort gives your application passwordless authentication,
              adaptive security, passkeys, trusted devices, and protected
              sessions in one seamless experience.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Create your account
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2">
              {authMethods.map((method) => (
                <span
                  key={method}
                  className="flex items-center gap-2 text-sm text-slate-500"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  {method}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-slate-100/70 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/10">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Authentication
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">
                      Welcome back
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <LockKeyhole className="h-5 w-5 text-slate-700" />
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <Fingerprint className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold">Low-risk sign in</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        This device is trusted. AuthFort selected your
                        strongest available authentication method.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white"
                  >
                    Continue with passkey
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {["Risk", "Device", "Session"].map((item, index) => (
                    <div
                      key={item}
                      className="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {item}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {index === 0
                          ? "Low"
                          : index === 1
                            ? "Trusted"
                            : "Protected"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-y border-slate-200 bg-slate-50/70"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-slate-500">WHY AUTHFORT</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Security that works quietly in the background.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Give users a frictionless authentication experience while your
              backend continuously evaluates risk and protects every session.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-semibold tracking-tight">{title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              ADAPTIVE BY DESIGN
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              The right challenge at the right moment.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              AuthFort does not make every user jump through the same hoops.
              Authentication is orchestrated around context, device trust,
              session state, and security signals.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Evaluate authentication risk",
                "Select the appropriate challenge",
                "Verify the user securely",
                "Create and protect the session",
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            id="security"
            className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h3 className="mt-7 text-2xl font-semibold">
              Security is part of the architecture.
            </h3>

            <p className="mt-3 leading-7 text-slate-300">
              Sessions, refresh tokens, challenges, OAuth state, device trust,
              and security events are designed as first-class authentication
              primitives.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Refresh rotation",
                "Replay detection",
                "Secure cookies",
                "CSRF protection",
                "OAuth state validation",
                "Security auditing",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <LockKeyhole className="h-5 w-5" />
          </div>

          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Authentication your users won't have to think about.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Start with passwordless authentication and let AuthFort handle the
            complexity behind a clean, secure experience.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Get started with AuthFort
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-white">
              <LockKeyhole className="h-3.5 w-3.5" />
            </div>
            AuthFort
          </div>

          <p>Passwordless authentication, built for modern applications.</p>
        </div>
      </footer>
    </main>
  );
}