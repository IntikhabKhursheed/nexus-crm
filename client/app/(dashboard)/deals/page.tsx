"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { DealKanban } from "@/components/deal-kanban";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Input, Textarea, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
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
  const { pushToast } = useToast();

  async function loadDeals() {
    setLoading(true);
    setError("");

    try {
      const response = await listDeals();
      setDeals(response.deals);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load deals.";
      setError(message);
      pushToast({ type: "error", title: "Deals failed to load", description: message });
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
      pushToast({ type: "success", title: "Deal created", description: form.title });
      await loadDeals();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to create deal.";
      setError(message);
      pushToast({ type: "error", title: "Unable to create deal", description: message });
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

        <Card>
          <h3 className="text-xl font-semibold">Create deal</h3>
          <form onSubmit={handleCreateDeal} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
              <Input
                placeholder="Value"
                type="number"
                value={form.value}
                onChange={(event) => setForm({ ...form, value: event.target.value })}
              />
              <Select
                value={form.stage}
                onChange={(event) => setForm({ ...form, stage: event.target.value as DealPayload["stage"] })}
              >
                {dealStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Probability"
                type="number"
                value={form.probability}
                onChange={(event) => setForm({ ...form, probability: event.target.value })}
              />
              <Input
                placeholder="Expected close date"
                type="date"
                value={form.expectedCloseDate}
                onChange={(event) => setForm({ ...form, expectedCloseDate: event.target.value })}
              />
              <Input
                placeholder="Contact ID"
                value={form.contactId}
                onChange={(event) => setForm({ ...form, contactId: event.target.value })}
              />
              <Input
                placeholder="Company ID"
                value={form.companyId}
                onChange={(event) => setForm({ ...form, companyId: event.target.value })}
              />
            </div>
            <Textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Create deal"}
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold">Pipeline board</h3>
          <p className="mt-2 text-sm text-slate-500">Drag a card between stages to update the deal stage.</p>
          <div className="mt-6">
            {loading ? (
              <LoadingState label="Loading deals..." />
            ) : error ? (
              <ErrorState description={error} onRetry={() => void loadDeals()} />
            ) : deals.length === 0 ? (
              <EmptyState
                title="No deals yet"
                description="Create your first deal to populate the pipeline and track stage movement."
                actionLabel="Reload deals"
                onAction={() => void loadDeals()}
              />
            ) : (
              <DealKanban deals={deals} onStageChange={handleStageChange} />
            )}
          </div>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
