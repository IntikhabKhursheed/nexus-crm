"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  BellIcon,
  BuildingIcon,
  ChartIcon,
  ChevronDownIcon,
  LayoutIcon,
  MailIcon,
  SearchIcon,
  ShieldIcon,
  SparklesIcon,
  UsersIcon
} from "./ui/icons";

const links = [
  { href: "/contacts", label: "Contacts", icon: UsersIcon },
  { href: "/companies", label: "Companies", icon: BuildingIcon },
  { href: "/deals", label: "Pipeline Board", icon: LayoutIcon, count: "12" },
  { href: "/ai", label: "AI Hub", icon: SparklesIcon, badge: "AI" },
  { href: "/campaigns", label: "Campaigns", icon: MailIcon },
  { href: "/reports", label: "Reports", icon: ChartIcon },
  { href: "/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/team", label: "Team", icon: UsersIcon },
  { href: "/settings", label: "Settings", icon: ShieldIcon },
  { href: "/audit-logs", label: "Audit Logs", icon: BellIcon },
  { href: "/notifications", label: "Notifications", icon: BellIcon }
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
  const orgMenuRef = useRef<HTMLDivElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const [activeOrg, setActiveOrg] = useState<StoredMembership | null>(null);
  const [memberships, setMemberships] = useState<StoredMembership[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [orgOpen, setOrgOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setActiveOrg(getActiveOrganization());
    setMemberships(getStoredMemberships());
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    setOrgOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (orgMenuRef.current && !orgMenuRef.current.contains(target)) {
        setOrgOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setAccountOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function handleOrgChange(nextOrgId: string) {
    setActiveOrganizationId(nextOrgId);
    const nextMembership = memberships.find((membership) => membership.organization.id === nextOrgId) ?? null;
    setActiveOrg(nextMembership);
    setOrgOpen(false);
  }

  function handleSignOut() {
    clearWorkspaceSession();
    window.location.href = "/login";
  }

  const userLabel = useMemo(() => user?.name ?? user?.email ?? "Account", [user]);
  const userRole = activeOrg?.role ?? "Member";
  const activeTenantName = activeOrg?.organization.name ?? "Codnocrats";

  return (
    <main className="grid h-screen overflow-hidden bg-[var(--nx-page-bg)] md:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="flex h-screen flex-col overflow-y-auto border-r border-[color:var(--nx-sidebar-border)] bg-[var(--nx-sidebar-bg)] text-[color:var(--nx-sidebar-text)]">
        <div className="border-b border-[color:var(--nx-sidebar-border)] px-4 py-[18px]">
          <Link href="/contacts" className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-indigo-500 to-violet-500 text-[13px] font-extrabold tracking-[-0.05em] text-white">
              NX
            </div>
            <div className="hidden md:block">
              <p className="text-[15px] font-bold text-[#f1f5f9]">NexusCRM</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--nx-brand)]">B2B AI PLATFORM</p>
            </div>
          </Link>
        </div>

        <div ref={orgMenuRef} className="relative border-b border-[color:var(--nx-sidebar-border)] px-3 py-2">
          <button
            type="button"
            onClick={() => {
              setOrgOpen((current) => !current);
              setAccountOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-[8px] border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/8"
            aria-haspopup="menu"
            aria-expanded={orgOpen}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--nx-green)]" />
            <div className="min-w-0 flex-1 hidden md:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--nx-sidebar-section-label)]">
                Select active tenant
              </p>
              <p className="truncate text-[12px] font-semibold text-[#e2e8f0]">{activeTenantName}</p>
            </div>
            <ChevronDownIcon className="h-3 w-3 shrink-0 text-[var(--nx-sidebar-icon)]" />
          </button>

          {orgOpen && (
            <div className="absolute left-3 top-[72px] z-40 w-[calc(100%-1.5rem)] rounded-[10px] border border-white/10 bg-[#111827] p-2 shadow-[0_24px_70px_rgba(15,23,42,0.35)]">
              <div className="px-2 py-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nx-sidebar-section-label)]">
                  Workspaces
                </p>
              </div>
              <div className="max-h-72 space-y-1 overflow-y-auto">
                {memberships.length === 0 && (
                  <div className="rounded-[8px] px-3 py-2 text-sm text-slate-400">No workspaces available.</div>
                )}
                {memberships.map((membership) => {
                  const active = activeOrg?.organization.id === membership.organization.id;
                  return (
                    <button
                      key={membership.organization.id}
                      type="button"
                      onClick={() => handleOrgChange(membership.organization.id)}
                      className={[
                        "flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-sm transition",
                        active ? "border border-[rgba(99,102,241,0.35)] bg-[rgba(99,102,241,0.18)] text-[#e2e8f0]" : "text-slate-300 hover:bg-white/5"
                      ].join(" ")}
                    >
                      <span className="truncate">{membership.organization.name}</span>
                      <span className={["ml-3 rounded-lg px-2 py-0.5 text-[11px] font-semibold", active ? "bg-white/10" : "bg-slate-800 text-slate-400"].join(" ")}>
                        {membership.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <nav className="px-3 py-4">
          <p className="hidden px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--nx-sidebar-section-label)] md:block">
            Command Center
          </p>
          <div className="space-y-1">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "flex items-center gap-2 rounded-[8px] border px-3 py-2 text-[13px] transition",
                    active
                      ? "border-[color:var(--nx-sidebar-active-border)] bg-[color:var(--nx-sidebar-active-bg)] text-[color:var(--nx-sidebar-text-active)]"
                      : "border-transparent text-[color:var(--nx-sidebar-text)] hover:bg-white/5 hover:text-[#e2e8f0]"
                  ].join(" ")}
                >
                  <Icon className={["h-4 w-4 shrink-0", active ? "text-[color:var(--nx-sidebar-icon-active)]" : "text-[color:var(--nx-sidebar-icon)]"].join(" ")} />
                  <span className="hidden md:block">{link.label}</span>
                  {link.badge && (
                    <span className="ml-auto hidden rounded-[4px] bg-[rgba(99,102,241,0.3)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-[#818cf8] md:inline-flex">
                      {link.badge}
                    </span>
                  )}
                  {link.count && (
                    <span className="ml-auto hidden rounded-full bg-[var(--nx-brand)] px-2 py-0.5 text-[10px] font-bold text-white md:inline-flex">
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mt-auto border-t border-[color:var(--nx-sidebar-border)] p-3">
          <div className="rounded-[8px] border border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.08)] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--nx-green)]" />
              <div className="hidden md:block">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--nx-green)]">Data Isolation Safe</p>
                <p className="text-[10px] text-slate-500">Enterprise Tier Protocol</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col overflow-hidden">
        <header className="flex h-[52px] items-center gap-3 border-b border-[color:var(--nx-topbar-border)] bg-[var(--nx-topbar-bg)] px-5" style={{ boxShadow: "var(--nx-topbar-shadow)" }}>
          <div className="min-w-0">
            <p className="text-[12px] text-[var(--nx-text-muted)]">
              Sandbox Pipeline Profile: <span className="font-semibold text-[var(--nx-brand)]">{activeTenantName}</span>
            </p>
          </div>

          <div className="mx-4 hidden h-8 max-w-[380px] flex-1 items-center gap-2 rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] px-3 md:flex">
            <SearchIcon className="h-3.5 w-3.5 text-[var(--nx-text-muted)]" />
            <input
              type="text"
              placeholder="Search contacts, companies, deals..."
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] text-[var(--nx-text-secondary)] placeholder:text-[var(--nx-text-placeholder)] focus:ring-0"
            />
            <span className="rounded-[4px] border border-[#e2e8f0] bg-[#f1f5f9] px-1.5 py-0.5 font-mono text-[10px] text-[var(--nx-text-muted)]">
              ⌘K
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <NotificationBell organizationId={activeOrg?.organization.id ?? ""} compact />
            <ThemeToggle compact />

            <div className="h-5 w-px bg-[#e8ecf0]" />

            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setAccountOpen((current) => !current);
                  setOrgOpen(false);
                }}
                className="flex items-center gap-2 rounded-[8px] border border-[#e8ecf0] bg-white px-1.5 py-1 transition hover:bg-[#f8fafc]"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-bold text-white">
                  {initials(user?.name)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[12.5px] font-semibold leading-none text-[#1e293b]">{userLabel}</p>
                  <p className="mt-1 text-[10px] leading-none text-[var(--nx-text-muted)]">{userRole}</p>
                </div>
                <ChevronDownIcon className="h-3 w-3 text-[#94a3b8]" />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-[10px] border border-[#e8ecf0] bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                  <div className="rounded-[10px] bg-[#f8fafc] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                        {initials(user?.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--nx-text-primary)]">{userLabel}</p>
                        <p className="truncate text-xs text-[var(--nx-text-muted)]">{user?.email ?? "Signed in user"}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-[4px] bg-[var(--nx-brand)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                        Secure
                      </span>
                      <span className="rounded-[4px] bg-[var(--nx-brand-light)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nx-brand-text)]">
                        {userRole}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <Link
                      href="/notifications"
                      className="block rounded-[8px] px-3 py-2 text-sm text-[var(--nx-text-secondary)] transition hover:bg-[#f8fafc]"
                      onClick={() => setAccountOpen(false)}
                    >
                      Notifications
                    </Link>
                    <Link
                      href="/settings"
                      className="block rounded-[8px] px-3 py-2 text-sm text-[var(--nx-text-secondary)] transition hover:bg-[#f8fafc]"
                      onClick={() => setAccountOpen(false)}
                    >
                      Workspace settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full rounded-[8px] px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-500/10"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
