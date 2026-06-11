import Link from "next/link";
import { Nav } from "@/components/nav";
import { Badge, Panel, StatCard } from "@/components/ui/chrome";
import { ChartIcon, LayoutIcon, MailIcon, SparklesIcon } from "@/components/ui/icons";

export default function HomePage() {
  return (
    <main className="grid-bg min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <Nav />

        <section className="grid flex-1 items-center gap-8 py-10 xl:grid-cols-[1.1fr_0.9fr] xl:py-14">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3">
              <Badge tone="cyan">Multi-tenant CRM</Badge>
              <Badge tone="emerald">AI sales workflows</Badge>
              <Badge tone="amber">Realtime notifications</Badge>
            </div>

            <div className="max-w-4xl space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-foreground sm:text-6xl xl:text-7xl">
                A premium workspace for pipeline, AI, reporting, and team operations.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-500 dark:text-slate-400">
                NexusCRM gives every organization its own clean, modern operating layer with contacts, companies, deals,
                campaigns, analytics, and AI assistance all in one beautifully structured interface.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-[8px] bg-[var(--nx-brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(99,102,241,0.22)] hover:bg-[var(--nx-brand-dark)]"
            >
              Create workspace
            </Link>
            <Link
              href="/login"
              className="rounded-[8px] border border-[#e8ecf0] bg-white px-6 py-3.5 text-sm font-semibold hover:bg-[#f8fafc]"
            >
              Sign in
            </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Tenancy" value="Org scoped" detail="Isolation built into every route and record." accent="cyan" />
              <StatCard label="Automation" value="AI guided" detail="Draft emails, score deals, forecast revenue." accent="emerald" />
              <StatCard label="Ops" value="Realtime" detail="Alerts, audit trails, and live workspace activity." accent="amber" />
            </div>
          </div>

          <Panel className="relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.16),transparent_30%)]" />
            <div className="relative space-y-5 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-500 dark:text-slate-400">
                    Workspace preview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">NexusCRM control center</h2>
                </div>
                <div className="rounded-full bg-[rgb(var(--secondary)/0.12)] px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
                  Live
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">AI Hub</p>
                    <SparklesIcon className="h-4 w-4 text-cyan-500" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                    Enrichment, email writing, deal scoring, meeting briefs, and weekly digests in one elegant workflow.
                  </p>
                </div>
                <div className="rounded-[24px] border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Pipeline</p>
                    <LayoutIcon className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                    Drag deals across stages with clean kanban cards and smooth stage transitions.
                  </p>
                </div>
                <div className="rounded-[24px] border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Campaigns</p>
                    <MailIcon className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                    Build branded sequences with segment filters, send history, and open tracking.
                  </p>
                </div>
                <div className="rounded-[24px] border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Analytics</p>
                    <ChartIcon className="h-4 w-4 text-rose-500" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                    Modern KPI tiles and chart rails that make the numbers feel crisp and actionable.
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
