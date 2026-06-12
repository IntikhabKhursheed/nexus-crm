"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { PageHeader, Panel, StatCard, Badge } from "@/components/ui/chrome";
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
        <PageHeader
          eyebrow="Analytics"
          title="Executive dashboard"
          description="Track revenue, pipeline health, activity, and AI outcomes in one clear snapshot."
        />

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
                <StatCard key={String(label)} label={String(label)} value={String(value)} accent="cyan" />
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Revenue trend" description="Month-by-month performance with a modern rail chart.">
                <h3 className="text-xl font-semibold">Revenue trend</h3>
                <div className="mt-4 space-y-3">
                  {analytics.charts.revenueTrend.map((item) => (
                    <div key={item.month}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-[rgb(var(--nx-text-secondary))]">{item.month}</span>
                        <span className="font-semibold text-[rgb(var(--nx-text-primary))]">{item.revenue}</span>
                      </div>
                      <div className="h-3 rounded-full bg-[#eef2f7]">
                        <div className="h-3 rounded-full bg-[var(--nx-brand)]" style={{ width: `${Math.min(100, item.revenue / 1000)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Pipeline distribution" description="Stage density across the current forecast window.">
                <h3 className="text-xl font-semibold">Pipeline distribution</h3>
                <div className="mt-4 space-y-3">
                  {analytics.charts.pipelineDistribution.map((item) => (
                    <div key={item.stage}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-[rgb(var(--nx-text-secondary))]">{item.stage}</span>
                        <span className="font-semibold text-[rgb(var(--nx-text-primary))]">{item.count}</span>
                      </div>
                      <div className="h-3 rounded-full bg-[#eef2f7]">
                        <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, item.count * 18)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Emails sent" value={analytics.activity.emailsSent} accent="emerald" />
              <StatCard label="Meetings completed" value={analytics.activity.meetingsCompleted} accent="amber" />
              <StatCard label="AI reports" value={analytics.ai.dealsScored} accent="rose" />
            </div>
          </>
        )}
      </div>
    </WorkspaceShell>
  );
}
