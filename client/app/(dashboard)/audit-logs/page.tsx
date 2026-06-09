"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { listAuditLogs } from "@/lib/audit";

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<Awaited<ReturnType<typeof listAuditLogs>>["auditLogs"]>([]);

  useEffect(() => {
    void listAuditLogs().then((response) => setAuditLogs(response.auditLogs));
  }, []);

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Audit Logs</p>
          <h2 className="mt-2 text-3xl font-semibold">Activity trail</h2>
        </div>

        <div className="space-y-3">
          {auditLogs.map((entry) => (
            <div key={entry._id} className="rounded-2xl border border-border bg-card p-4">
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
        </div>
      </div>
    </WorkspaceShell>
  );
}

