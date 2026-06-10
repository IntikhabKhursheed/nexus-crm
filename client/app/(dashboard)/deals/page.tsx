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
  listCompanies,
  listContacts,
  listDeals,
  updateDealStage,
  type Company,
  type Contact,
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<DealPayload>(emptyDeal);
  const [saving, setSaving] = useState(false);
  const { pushToast } = useToast();

  async function loadDeals() {
    setLoading(true);
    setLoadError("");

    try {
      const response = await listDeals();
      setDeals(response.deals);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load deals.";
      setLoadError(message);
      pushToast({ type: "error", title: "Deals failed to load", description: message });
    } finally {
      setLoading(false);
    }
  }

  async function loadFormOptions() {
    try {
      const [contactsResponse, companiesResponse] = await Promise.all([listContacts(), listCompanies()]);
      setContacts(contactsResponse.contacts);
      setCompanies(companiesResponse.companies);
    } catch {
      // Optional fields — deal creation still works without them.
    }
  }

  useEffect(() => {
    void Promise.all([loadDeals(), loadFormOptions()]);
  }, []);

  async function handleCreateDeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Deal title is required.");
      setSaving(false);
      return;
    }

    try {
      await createDeal(form);
      const createdTitle = form.title;
      setForm(emptyDeal);
      pushToast({ type: "success", title: "Deal created", description: createdTitle });
      await loadDeals();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to create deal.";
      setFormError(message);
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
          <p className="mt-2 text-sm text-slate-500">
            Contact and company are optional. Pick them from the list — do not type phone numbers or names into ID fields.
          </p>
          <form onSubmit={handleCreateDeal} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input
                placeholder="Title *"
                required
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
                placeholder="Probability (%)"
                type="number"
                min={0}
                max={100}
                value={form.probability}
                onChange={(event) => setForm({ ...form, probability: event.target.value })}
              />
              <Input
                placeholder="Expected close date"
                type="date"
                value={form.expectedCloseDate}
                onChange={(event) => setForm({ ...form, expectedCloseDate: event.target.value })}
              />
              <Select
                value={form.contactId}
                onChange={(event) => setForm({ ...form, contactId: event.target.value })}
              >
                <option value="">No contact</option>
                {contacts.map((contact) => (
                  <option key={contact._id} value={contact._id}>
                    {contact.name}
                    {contact.email ? ` (${contact.email})` : ""}
                  </option>
                ))}
              </Select>
              <Select
                value={form.companyId}
                onChange={(event) => setForm({ ...form, companyId: event.target.value })}
              >
                <option value="">No company</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <Button type="submit" disabled={saving}>
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
            ) : loadError ? (
              <ErrorState description={loadError} onRetry={() => void loadDeals()} />
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
