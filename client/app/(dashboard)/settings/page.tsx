"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { getOrganizationSettings, updateOrganizationSettings } from "@/lib/settings";

export default function SettingsPage() {
  const [organization, setOrganization] = useState<Awaited<ReturnType<typeof getOrganizationSettings>>["organization"] | null>(null);
  const [form, setForm] = useState({
    name: "",
    timezone: "UTC",
    currency: "USD",
    primaryColor: "#0f172a",
    secondaryColor: "#64748b",
    accentColor: "#38bdf8"
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    void getOrganizationSettings().then((response) => {
      setOrganization(response.organization);
      setForm({
        name: response.organization.name,
        timezone: response.organization.timezone ?? "UTC",
        currency: response.organization.currency ?? "USD",
        primaryColor: response.organization.branding?.primaryColor ?? "#0f172a",
        secondaryColor: response.organization.branding?.secondaryColor ?? "#64748b",
        accentColor: response.organization.branding?.accentColor ?? "#38bdf8"
      });
    });
  }, []);

  async function handleSave() {
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("timezone", form.timezone);
      payload.append("currency", form.currency);
      payload.append(
        "branding",
        JSON.stringify({
          primaryColor: form.primaryColor,
          secondaryColor: form.secondaryColor,
          accentColor: form.accentColor
        })
      );
      if (logoFile) {
        payload.append("logo", logoFile);
      }
      const response = await updateOrganizationSettings(payload);
      setOrganization((current) => (current ? { ...current, name: response.organization.name } : current));
    } catch {
      // Keep this lightweight for now.
    }
  }

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Settings</p>
          <h2 className="mt-2 text-3xl font-semibold">Organization settings</h2>
        </div>

        {organization && (
          <section className="glass-card rounded-3xl p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-2xl border border-border bg-card px-4 py-3 outline-none" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <input className="rounded-2xl border border-border bg-card px-4 py-3 outline-none" value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })} />
              <input className="rounded-2xl border border-border bg-card px-4 py-3 outline-none" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} />
              <input type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} className="rounded-2xl border border-border bg-card px-4 py-3 outline-none" />
              <input className="rounded-2xl border border-border bg-card px-4 py-3 outline-none" value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} />
              <input className="rounded-2xl border border-border bg-card px-4 py-3 outline-none" value={form.secondaryColor} onChange={(event) => setForm({ ...form, secondaryColor: event.target.value })} />
              <input className="rounded-2xl border border-border bg-card px-4 py-3 outline-none md:col-span-2" value={form.accentColor} onChange={(event) => setForm({ ...form, accentColor: event.target.value })} />
            </div>
            <button onClick={() => void handleSave()} className="mt-4 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white">Save settings</button>
          </section>
        )}
      </div>
    </WorkspaceShell>
  );
}
