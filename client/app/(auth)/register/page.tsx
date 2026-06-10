import { AuthForm } from "@/components/auth-form";
import { Nav } from "@/components/nav";
import { Badge, Panel } from "@/components/ui/chrome";

export default function RegisterPage() {
  return (
    <main className="grid-bg min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <Nav />

        <section className="grid flex-1 items-center gap-8 py-10 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <Badge tone="emerald">Build your workspace</Badge>
            <div className="max-w-2xl space-y-4">
              <h1 className="text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">Create a modern CRM workspace in minutes.</h1>
              <p className="max-w-xl text-lg leading-8 text-slate-500 dark:text-slate-400">
                Start with a polished organization shell, then customize users, branding, pipeline, campaigns, and AI flows.
              </p>
            </div>

            <Panel className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold">Organization first</p>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  Every action is scoped to a workspace, keeping data isolated and clean.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">Ready for growth</p>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  Teams, billing, notifications, reports, and audit logs are already in place.
                </p>
              </div>
            </Panel>
          </div>

          <Panel className="mx-auto w-full max-w-md p-8">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.04em]">Create account</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Set up your owner account and create the first organization.
              </p>
            </div>
            <div className="mt-8">
              <AuthForm mode="register" />
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
