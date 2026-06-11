"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { listAuditLogs } from "@/lib/audit";
import { PageHeader, Panel } from "@/components/ui/chrome";

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<Awaited<ReturnType<typeof listAuditLogs>>["auditLogs"]>([]);

  useEffect(() => {
    void listAuditLogs().then((response) => setAuditLogs(response.auditLogs));
  }, []);

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Audit logs"
          title="Activity trail"
          description="A clean record of important workspace actions, updates, and events."
        />

        <Panel className="space-y-3">
          {auditLogs.map((entry) => (
            <div key={entry._id} className="rounded-2xl border border-border bg-card p-4 hover:bg-muted/40">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{entry.action}</p>
                  <p className="text-sm text-slate-500">
                    {entry.entityType} · {entry.entityId}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            ))}
            {auditLogs.length === 0 && <p className="text-sm text-slate-500">No audit logs yet.</p>}
        </Panel>
      </div>
    </WorkspaceShell>
  );
}
