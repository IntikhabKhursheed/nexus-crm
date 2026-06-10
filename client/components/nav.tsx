import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  return (
    <header className="flex items-center justify-between gap-4 rounded-[28px] border border-border bg-card/80 px-4 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(var(--primary))] text-sm font-semibold text-[rgb(var(--background))]">
          NX
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-500 dark:text-slate-400">
            NexusCRM
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Modern workspace for revenue teams</p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-muted hover:text-foreground">
          Login
        </Link>
        <Link href="/register" className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted">
          Register
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
