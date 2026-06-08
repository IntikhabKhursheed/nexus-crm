import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  return (
    <header className="flex items-center justify-between gap-4">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        NexusCRM
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm text-slate-500 transition hover:text-foreground">
          Login
        </Link>
        <Link href="/register" className="text-sm text-slate-500 transition hover:text-foreground">
          Register
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
