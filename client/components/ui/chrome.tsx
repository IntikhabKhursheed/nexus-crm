"use client";

import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  }) {
  return (
    <section
      className="relative overflow-hidden rounded-[var(--nx-radius-xl)] border border-[rgba(99,102,241,0.28)] px-7 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      style={{ background: "var(--nx-hero-gradient)" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_28%)]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl space-y-2">
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#818cf8]">
              {eyebrow}
            </p>
          )}
          <div>
            <h1 className="text-[22px] font-extrabold tracking-[-0.04em] text-[#f1f5f9] sm:text-3xl">{title}</h1>
            {description && <p className="mt-2 max-w-3xl text-[12.5px] leading-6 text-[#94a3b8]">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
      {children && <div className="relative mt-6">{children}</div>}
    </section>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className = ""
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-[var(--nx-card-radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-[18px] py-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.04)]",
        className
      ].join(" ")}
    >
      {(title || description || actions) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--nx-text-primary)]">{title}</h2>}
            {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--nx-text-muted)]">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  detail,
  accent = "slate"
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  accent?: "slate" | "cyan" | "emerald" | "amber" | "rose";
}) {
  const accentClasses: Record<"slate" | "cyan" | "emerald" | "amber" | "rose", string> = {
    slate: "from-slate-500/20 to-slate-400/5 text-slate-700 dark:text-slate-200",
    cyan: "from-cyan-500/20 to-cyan-400/5 text-cyan-700 dark:text-cyan-200",
    emerald: "from-emerald-500/20 to-emerald-400/5 text-emerald-700 dark:text-emerald-200",
    amber: "from-amber-500/20 to-amber-400/5 text-amber-700 dark:text-amber-200",
    rose: "from-rose-500/20 to-rose-400/5 text-rose-700 dark:text-rose-200"
  };

  return (
    <div className="rounded-[var(--nx-card-radius)] border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-[18px] py-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className={`inline-flex rounded-[8px] bg-gradient-to-br px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${accentClasses[accent]}`}>
        {label}
      </div>
      <div className="mt-4 text-[22px] font-extrabold tracking-[-0.03em] text-[var(--nx-text-primary)]">{value}</div>
      {detail && <div className="mt-3 text-sm leading-6 text-[var(--nx-text-muted)]">{detail}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = "slate"
}: {
  children: ReactNode;
  tone?: "slate" | "cyan" | "emerald" | "amber" | "rose" | "violet";
}) {
  const classes: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    cyan: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-200",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-200",
    violet: "bg-violet-500/10 text-violet-700 dark:text-violet-200"
  };

  return (
    <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold ${classes[tone]}`}>
      {children}
    </span>
  );
}
