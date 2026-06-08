import Link from "next/link";
import { Nav } from "@/components/nav";

export default function HomePage() {
  return (
    <main className="grid-bg min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6">
        <Nav />

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <span className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-slate-500 shadow-glow">
              Phase 1 foundation is ready
            </span>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                NexusCRM keeps every organization isolated, secure, and ready for AI sales workflows.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-500">
                Built with Next.js 14, Express, MongoDB, JWT refresh auth, and Stripe billing scaffolding.
                The app is structured to grow into a production SaaS without rewrites.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-slate-100 dark:text-slate-950"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-border bg-card px-6 py-3 font-semibold text-foreground transition hover:bg-muted"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 shadow-glow">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Foundation</p>
                <h2 className="mt-2 text-2xl font-semibold">What Phase 1 includes</h2>
              </div>
              <ul className="space-y-4 text-sm leading-6 text-slate-500">
                <li>• Authentication with register, login, and refresh token rotation.</li>
                <li>• Multi-tenant organization membership checks on protected routes.</li>
                <li>• Stripe plan scaffolding for Free, Pro, and Enterprise tiers.</li>
                <li>• Tailwind-powered responsive UI with dark and light mode.</li>
                <li>• Axios interceptor setup for automatic bearer token handling.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
