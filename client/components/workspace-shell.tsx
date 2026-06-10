"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  clearWorkspaceSession,
  getActiveOrganization,
  getStoredMemberships,
  getStoredUser,
  setActiveOrganizationId,
  type StoredMembership,
  type StoredUser
} from "@/lib/auth";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { BellIcon, ChevronDownIcon, MenuIcon, ShieldIcon, UsersIcon } from "./ui/icons";

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

function initials(name?: string) {
  if (!name) return "NC";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [activeOrg, setActiveOrg] = useState<StoredMembership | null>(null);
  const [memberships, setMemberships] = useState<StoredMembership[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setActiveOrg(getActiveOrganization());
    setMemberships(getStoredMemberships());
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-account-menu]")) {
        setAccountOpen(false);
      }
    }

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  function handleOrgChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextOrgId = event.target.value;
    setActiveOrganizationId(nextOrgId);
    const nextMembership = memberships.find((membership) => membership.organization.id === nextOrgId) ?? null;
    setActiveOrg(nextMembership);
  }

  function handleSignOut() {
    clearWorkspaceSession();
    window.location.href = "/login";
  }

  const userLabel = useMemo(() => user?.name ?? user?.email ?? "Account", [user]);

  return (
    <main className="grid-bg min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="surface-shell sticky top-4 z-30 rounded-[32px] px-4 py-4 shadow-shell">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <Link href="/contacts" className="group flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgb(var(--primary))] text-sm font-semibold text-[rgb(var(--background))] shadow-[0_16px_40px_rgba(15,23,42,0.22)]">
                  NX
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-500 dark:text-slate-400">
                    NexusCRM
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {activeOrg ? `${activeOrg.organization.name} | ${activeOrg.role}` : "No active workspace"}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 lg:flex">
                  <NotificationBell organizationId={activeOrg?.organization.id ?? ""} />
                  <ThemeToggle />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen((current) => !current)}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-3 py-2 text-foreground hover:bg-muted lg:hidden"
                  aria-expanded={mobileOpen}
                  aria-label="Toggle navigation"
                >
                  <MenuIcon />
                </button>

                <div className="relative hidden md:block" data-account-menu>
                  <button
                    type="button"
                    onClick={() => setAccountOpen((current) => !current)}
                    className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-2 text-left hover:bg-muted"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgb(var(--secondary)/0.14)] text-xs font-bold text-[rgb(var(--primary))]">
                      {initials(user?.name)}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold leading-none">{userLabel}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activeOrg?.role ?? "Member"}</p>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-14 z-40 w-72 rounded-[28px] border border-border bg-card p-3 shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
                      <div className="rounded-2xl bg-muted/70 p-4">
                        <p className="text-sm font-semibold">{userLabel}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user?.email ?? "Signed in user"}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white dark:bg-slate-100 dark:text-slate-950">
                            <ShieldIcon className="h-3.5 w-3.5" />
                            Secure
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
                            <UsersIcon className="h-3.5 w-3.5" />
                            {activeOrg?.role ?? "Member"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        <Link href="/notifications" className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-muted">
                          <BellIcon className="h-4 w-4" />
                          Notifications
                        </Link>
                        <Link href="/settings" className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-muted">
                          Workspace settings
                        </Link>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 dark:text-red-300"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden flex-wrap items-center gap-2 lg:flex">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={[
                      "rounded-full border px-4 py-2 text-sm font-semibold",
                      active
                        ? "border-transparent bg-[rgb(var(--primary))] text-[rgb(var(--background))] shadow-[0_14px_30px_rgba(15,23,42,0.18)]"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex min-w-0 items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400">
                <span>Workspace</span>
                <select
                  value={activeOrg?.organization.id ?? ""}
                  onChange={handleOrgChange}
                  className="max-w-56 bg-transparent text-foreground outline-none"
                >
                  {memberships.length === 0 && <option value="">No workspace</option>}
                  {memberships.map((membership) => (
                    <option key={membership.organization.id} value={membership.organization.id}>
                      {membership.organization.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex-1" />
              <div className="hidden md:block lg:hidden">
                <ThemeToggle />
              </div>
            </div>

            {mobileOpen && (
              <div className="rounded-[28px] border border-border bg-card p-3 lg:hidden">
                <div className="flex flex-col gap-2">
                  {links.map((link) => {
                    const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={[
                          "rounded-2xl px-4 py-3 text-sm font-semibold",
                          active ? "bg-[rgb(var(--primary))] text-[rgb(var(--background))]" : "hover:bg-muted"
                        ].join(" ")}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <NotificationBell organizationId={activeOrg?.organization.id ?? ""} />
                    <ThemeToggle />
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <section className="flex-1 py-6">{children}</section>
      </div>
    </main>
  );
}
