import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  return (
    <header className="flex items-center justify-between gap-4 rounded-[14px] border border-[#e8ecf0] bg-white px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[var(--nx-brand)] text-sm font-semibold text-white">
          NX
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[var(--nx-text-muted)]">
            NexusCRM
          </p>
          <p className="text-sm text-[var(--nx-text-muted)]">Modern workspace for revenue teams</p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded-[8px] px-4 py-2 text-sm font-semibold text-[var(--nx-text-secondary)] hover:bg-[#f8fafc] hover:text-[rgb(var(--foreground))]">
          Login
        </Link>
        <Link href="/register" className="rounded-[8px] border border-[#e8ecf0] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f8fafc]">
          Register
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
