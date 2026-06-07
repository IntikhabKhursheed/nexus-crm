"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { DealKanban } from "@/components/deal-kanban";
import {
  createDeal,
  listDeals,
  updateDealStage,
  type Deal,
  dealStages,
  type DealPayload
} from "@/lib/crm";

const emptyDeal: DealPayload = {
  title: "",
  value: "0",
  stage: "Lead",
  probability: "0",
  expectedCloseDate: "",
  contactId: "",
  companyId: "",
  notes: ""
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<DealPayload>(emptyDeal);
  const [saving, setSaving] = useState(false);

  async function loadDeals() {
    setLoading(true);
    setError("");

    try {
      const response = await listDeals();
      setDeals(response.deals);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load deals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDeals();
  }, []);

  async function handleCreateDeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createDeal(form);
      setForm(emptyDeal);
      await loadDeals();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create deal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStageChange(dealId: string, nextStage: (typeof dealStages)[number]) {
    const response = await updateDealStage(dealId, nextStage);
    setDeals((currentDeals) =>
      currentDeals.map((deal) => (deal._id === dealId ? response.deal : deal))
    );
  }

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Deals</p>
            <h2 className="mt-2 text-3xl font-semibold">Deal pipeline</h2>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-xl font-semibold">Create deal</h3>
          <form onSubmit={handleCreateDeal} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <input
                className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                placeholder="Title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
              <input
                className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                placeholder="Value"
                type="number"
                value={form.value}
                onChange={(event) => setForm({ ...form, value: event.target.value })}
              />
              <select
                className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                value={form.stage}
                onChange={(event) => setForm({ ...form, stage: event.target.value as DealPayload["stage"] })}
              >
                {dealStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              <input
                className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                placeholder="Probability"
                type="number"
                value={form.probability}
                onChange={(event) => setForm({ ...form, probability: event.target.value })}
              />
              <input
                className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                placeholder="Expected close date"
                type="date"
                value={form.expectedCloseDate}
                onChange={(event) => setForm({ ...form, expectedCloseDate: event.target.value })}
              />
              <input
                className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                placeholder="Contact ID"
                value={form.contactId}
                onChange={(event) => setForm({ ...form, contactId: event.target.value })}
              />
              <input
                className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                placeholder="Company ID"
                value={form.companyId}
                onChange={(event) => setForm({ ...form, companyId: event.target.value })}
              />
            </div>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none"
              placeholder="Notes"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950"
            >
              {saving ? "Saving..." : "Create deal"}
            </button>
          </form>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-xl font-semibold">Pipeline board</h3>
          <p className="mt-2 text-sm text-slate-500">Drag a card between stages to update the deal stage.</p>
          <div className="mt-6">
            {loading ? (
              <p className="text-sm text-slate-500">Loading deals...</p>
            ) : (
              <DealKanban deals={deals} onStageChange={handleStageChange} />
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
