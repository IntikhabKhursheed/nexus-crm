"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { getAnalyticsDashboard } from "@/lib/analytics";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof getAnalyticsDashboard>>["analytics"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getAnalyticsDashboard()
      .then((response) => setAnalytics(response.analytics))
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load analytics.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Analytics</p>
          <h2 className="mt-2 text-3xl font-semibold">Executive dashboard</h2>
        </div>

        {loading ? (
          <LoadingState label="Loading analytics..." />
        ) : error ? (
          <ErrorState description={error} onRetry={() => window.location.reload()} />
        ) : !analytics ? (
          <Card>
            <p className="text-sm text-slate-500">No analytics available yet.</p>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
              {[
                ["Revenue", analytics.sales.totalRevenue],
                ["Pipeline", analytics.sales.pipelineValue],
                ["Win rate", `${analytics.sales.winRate}%`],
                ["Avg deal", analytics.sales.averageDealSize],
                ["Avg cycle", `${analytics.sales.averageSalesCycle} days`]
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-3xl border border-border bg-card p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                  <p className="mt-3 text-2xl font-semibold">{String(value)}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="glass-card rounded-3xl p-6">
                <h3 className="text-xl font-semibold">Revenue trend</h3>
                <div className="mt-4 space-y-3">
                  {analytics.charts.revenueTrend.map((item) => (
                    <div key={item.month}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{item.month}</span>
                        <span>{item.revenue}</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted">
                        <div className="h-3 rounded-full bg-slate-950 dark:bg-slate-100" style={{ width: `${Math.min(100, item.revenue / 1000)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-card rounded-3xl p-6">
                <h3 className="text-xl font-semibold">Pipeline distribution</h3>
                <div className="mt-4 space-y-3">
                  {analytics.charts.pipelineDistribution.map((item) => (
                    <div key={item.stage}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{item.stage}</span>
                        <span>{item.count}</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted">
                        <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, item.count * 18)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Emails sent</p>
                <p className="mt-3 text-2xl font-semibold">{analytics.activity.emailsSent}</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Meetings completed</p>
                <p className="mt-3 text-2xl font-semibold">{analytics.activity.meetingsCompleted}</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI reports</p>
                <p className="mt-3 text-2xl font-semibold">{analytics.ai.dealsScored}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </WorkspaceShell>
  );
}
