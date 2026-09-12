import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-5 font-semibold tracking-tight">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}