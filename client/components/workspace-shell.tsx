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
import { ChevronDownIcon, MenuIcon } from "./ui/icons";

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
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const orgMenuRef = useRef<HTMLDivElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const [activeOrg, setActiveOrg] = useState<StoredMembership | null>(null);
  const [memberships, setMemberships] = useState<StoredMembership[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    setActiveOrg(getActiveOrganization());
    setMemberships(getStoredMemberships());
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    setMobileOpen(false);
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

  useEffect(() => {
    function updateScrollState() {
      const container = tabsRef.current;
      if (!container) return;
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 1);
    }

    const container = tabsRef.current;
    if (!container) return;

    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);
    container.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener("scroll", updateScrollState);
    };
  }, [links.length]);

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

  function scrollTabs(direction: "left" | "right") {
    const container = tabsRef.current;
    if (!container) return;
    const amount = direction === "left" ? -240 : 240;
    container.scrollBy({ left: amount, behavior: "smooth" });
  }

  const userLabel = useMemo(() => user?.name ?? user?.email ?? "Account", [user]);
  const userRole = activeOrg?.role ?? "Member";

  return (
    <main className="grid-bg min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-40 rounded-2xl border border-border bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.06)] backdrop-blur dark:bg-slate-900/95">
          <div className="flex h-[60px] items-center gap-3 px-3 sm:px-4">
            <div className="relative flex items-center gap-2" ref={orgMenuRef}>
              <button
                type="button"
                onClick={() => setMobileOpen((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
                aria-expanded={mobileOpen}
                aria-label="Open navigation menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>

              <Link href="/contacts" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-slate-950 text-[13px] font-bold tracking-[0.05em] text-white dark:bg-white dark:text-slate-950">
                  NX
                </div>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOrgOpen((current) => !current);
                  setAccountOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-haspopup="menu"
                aria-expanded={orgOpen}
              >
                <span className="font-medium">Codnocrats</span>
                <ChevronDownIcon className="h-3.5 w-3.5 text-slate-500" />
              </button>

              {orgOpen && (
                <div className="absolute left-0 top-12 z-50 w-72 rounded-[20px] border border-border bg-card p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                  <div className="px-3 pb-2 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Workspaces</p>
                  </div>
                  <div className="max-h-72 space-y-1 overflow-y-auto">
                    {memberships.length === 0 && (
                      <div className="rounded-xl px-3 py-2 text-sm text-slate-500">No workspaces available.</div>
                    )}
                    {memberships.map((membership) => {
                      const active = activeOrg?.organization.id === membership.organization.id;
                      return (
                        <button
                          key={membership.organization.id}
                          type="button"
                          onClick={() => handleOrgChange(membership.organization.id)}
                          className={[
                            "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition",
                            active ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          ].join(" ")}
                        >
                          <span className="truncate">{membership.organization.name}</span>
                          <span
                            className={[
                              "ml-3 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              active
                                ? "bg-white/15 text-inherit"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                            ].join(" ")}
                          >
                            {membership.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="relative hidden flex-1 items-center justify-center lg:flex">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollTabs("left")}
                  className="absolute left-0 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-sm text-slate-500 shadow-sm transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Scroll tabs left"
                >
                  {"<"}
                </button>
              )}

              <div
                ref={tabsRef}
                className="flex w-full items-center gap-1 overflow-x-auto px-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {links.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={[
                        "relative whitespace-nowrap rounded-md px-3 py-2 text-[13.5px] font-normal transition",
                        active
                          ? "font-semibold text-slate-900 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-slate-900 dark:text-white dark:after:bg-white"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollTabs("right")}
                  className="absolute right-0 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-sm text-slate-500 shadow-sm transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Scroll tabs right"
                >
                  {">"}
                </button>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <NotificationBell organizationId={activeOrg?.organization.id ?? ""} compact />
              <ThemeToggle compact />

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((current) => !current);
                    setOrgOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-full px-2 py-1.5 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                    {initials(user?.name)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[13px] font-medium leading-none text-slate-900 dark:text-slate-50">{userLabel}</p>
                    <p className="mt-1 text-[11px] leading-none text-slate-400">{userRole}</p>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-12 z-50 w-80 rounded-[20px] border border-border bg-card p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                    <div className="rounded-2xl bg-muted/60 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                          {initials(user?.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{userLabel}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email ?? "Signed in user"}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-950">
                          Secure
                        </span>
                        <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                          {userRole}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <Link
                        href="/notifications"
                        className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => setAccountOpen(false)}
                      >
                        Notifications
                      </Link>
                      <Link
                        href="/settings"
                        className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => setAccountOpen(false)}
                      >
                        Workspace settings
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-300"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {mobileOpen && (
            <div className="border-t border-border px-3 pb-3 pt-2 lg:hidden">
              <div className="grid gap-1">
                {links.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        "rounded-xl px-3 py-2 text-sm transition",
                        active
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
                  <button
                    type="button"
                    onClick={() => {
                      setOrgOpen((current) => !current);
                      setAccountOpen(false);
                    }}
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-slate-800 dark:text-slate-100"
                  >
                    Codnocrats
                    <ChevronDownIcon className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <NotificationBell organizationId={activeOrg?.organization.id ?? ""} compact />
                  <ThemeToggle compact />
                </div>
              </div>

              {orgOpen && (
                <div className="mt-2 rounded-2xl border border-border bg-card p-2 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    {memberships.map((membership) => {
                      const active = activeOrg?.organization.id === membership.organization.id;
                      return (
                        <button
                          key={membership.organization.id}
                          type="button"
                          onClick={() => handleOrgChange(membership.organization.id)}
                          className={[
                            "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition",
                            active ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          ].join(" ")}
                        >
                          <span className="truncate">{membership.organization.name}</span>
                          <span
                            className={[
                              "ml-3 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              active
                                ? "bg-white/15 text-inherit"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                            ].join(" ")}
                          >
                            {membership.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        <section className="flex-1 py-6">{children}</section>
      </div>
    </main>
  );
}
