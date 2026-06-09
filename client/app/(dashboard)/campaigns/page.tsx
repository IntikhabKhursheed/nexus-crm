"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { createCampaign, listCampaigns, sendCampaign, type Campaign } from "@/lib/campaigns";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ name: "", subject: "", content: "", segment: "" });

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const response = await listCampaigns();
      setCampaigns(response.campaigns);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load campaigns.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreate() {
    try {
      setFormError("");
      const segment = form.segment ? JSON.parse(form.segment) : undefined;
      await createCampaign({ name: form.name, subject: form.subject, content: form.content, segment });
      setForm({ name: "", subject: "", content: "", segment: "" });
      await loadData();
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : "Unable to create campaign.");
    }
  }

  async function handleSend(campaignId: string) {
    try {
      await sendCampaign(campaignId);
      await loadData();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send campaign.");
    }
  }

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Campaigns</p>
          <h2 className="mt-2 text-3xl font-semibold">Bulk email campaigns</h2>
        </div>

        {error && <ErrorState description={error} onRetry={() => void loadData()} />}
        {formError && <p className="text-sm text-red-500">{formError}</p>}

        <Card>
          <h3 className="text-xl font-semibold">Create campaign</h3>
          <div className="mt-4 grid gap-4">
            <input
              className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
              placeholder="Campaign name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <input
              className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
              placeholder="Subject"
              value={form.subject}
              onChange={(event) => setForm({ ...form, subject: event.target.value })}
            />
            <textarea
              className="min-h-40 rounded-2xl border border-border bg-card px-4 py-3 outline-none"
              placeholder="Content with {{firstName}}, {{company}}, {{dealValue}}"
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
            />
            <textarea
              className="min-h-28 rounded-2xl border border-border bg-card px-4 py-3 font-mono text-sm outline-none"
              placeholder='Segment JSON, e.g. {"tag":"Hot"}'
              value={form.segment}
              onChange={(event) => setForm({ ...form, segment: event.target.value })}
            />
            <button
              onClick={() => void handleCreate()}
              className="justify-self-start rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white"
            >
              Save campaign
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold">Campaign history</h3>
          <div className="mt-4 space-y-3">
            {loading ? (
              <LoadingState label="Loading campaigns..." />
            ) : campaigns.length === 0 ? (
              <EmptyState
                title="No campaigns yet"
                description="Create a campaign to start tracking sends and opens."
              />
            ) : (
              campaigns.map((campaign) => (
                <div key={campaign._id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{campaign.name}</p>
                      <p className="text-sm text-slate-500">{campaign.subject}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        Sent {campaign.sentCount} · Opened {campaign.openedCount} · {campaign.status}
                      </p>
                    </div>
                    <button
                      onClick={() => void handleSend(campaign._id)}
                      className="rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
