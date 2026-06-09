"use client";

import Link from "next/link";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { getActiveOrganization, getStoredMemberships, setActiveOrganizationId, type StoredMembership } from "@/lib/auth";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/contacts", label: "Contacts" },
  { href: "/companies", label: "Companies" },
  { href: "/deals", label: "Deal Pipeline" },
  { href: "/ai", label: "AI Hub" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/reports", label: "Reports" },
  { href: "/analytics", label: "Analytics" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" },
  { href: "/audit-logs", label: "Audit Logs" },
  { href: "/notifications", label: "Notifications" }
];

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const [activeOrg, setActiveOrg] = useState<StoredMembership | null>(null);
  const [memberships, setMemberships] = useState<StoredMembership[]>([]);

  useEffect(() => {
    const current = getActiveOrganization();
    setActiveOrg(current);
    setMemberships(getStoredMemberships());
  }, []);

  function handleOrgChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextOrgId = event.target.value;
    setActiveOrganizationId(nextOrgId);
    const nextMembership = memberships.find((membership) => membership.organization.id === nextOrgId) ?? null;
    setActiveOrg(nextMembership);
  }

  return (
    <main className="grid-bg min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="glass-card sticky top-4 z-20 rounded-3xl px-4 py-4 shadow-glow">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Workspace</p>
                <h1 className="text-xl font-semibold text-foreground">NexusCRM</h1>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell organizationId={activeOrg?.organization.id ?? ""} />
                <ThemeToggle />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <nav className="flex flex-wrap gap-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <label className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-slate-500">
                <span>Org</span>
                <select
                  value={activeOrg?.organization.id ?? ""}
                  onChange={handleOrgChange}
                  className="bg-transparent text-foreground outline-none"
                >
                  {memberships.length === 0 && <option value="">No workspace</option>}
                  {memberships.map((membership) => (
                    <option key={membership.organization.id} value={membership.organization.id}>
                      {membership.organization.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </header>

        <section className="flex-1 py-6">{children}</section>
      </div>
    </main>
  );
}
