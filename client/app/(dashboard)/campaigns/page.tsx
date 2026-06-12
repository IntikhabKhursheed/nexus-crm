"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { createCampaign, listCampaigns, sendCampaign, type Campaign } from "@/lib/campaigns";
import { PageHeader, Panel } from "@/components/ui/chrome";

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
        <PageHeader
          eyebrow="Campaigns"
          title="Bulk email campaigns"
          description="Build branded sends with segment JSON, tracked sends, and a cleaner list view."
        />

        {error && <ErrorState description={error} onRetry={() => void loadData()} />}
        {formError && <p className="text-sm text-red-500">{formError}</p>}

        <Panel title="Create campaign" description="Compose a campaign and define a target segment.">
          <div className="mt-4 grid gap-4">
            <input
              className="rounded-lg border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 outline-none"
              placeholder="Campaign name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <input
              className="rounded-lg border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 outline-none"
              placeholder="Subject"
              value={form.subject}
              onChange={(event) => setForm({ ...form, subject: event.target.value })}
            />
            <textarea
              className="min-h-40 rounded-lg border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 outline-none"
              placeholder="Content with {{firstName}}, {{company}}, {{dealValue}}"
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
            />
            <textarea
              className="min-h-28 rounded-lg border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 font-mono text-sm outline-none"
              placeholder='Segment JSON, e.g. {"tag":"Hot"}'
              value={form.segment}
              onChange={(event) => setForm({ ...form, segment: event.target.value })}
            />
            <Button onClick={() => void handleCreate()} className="justify-self-start">
              Save campaign
            </Button>
          </div>
        </Panel>

        <Panel title="Campaign history" description="See send status, opens, and the current campaign state.">
          <div className="mt-4 space-y-3">
            {loading ? (
              <LoadingState label="Loading campaigns..." />
            ) : campaigns.length === 0 ? (
              <EmptyState title="No campaigns yet" description="Create a campaign to start tracking sends and opens." />
            ) : (
              campaigns.map((campaign) => (
                <div key={campaign._id} className="rounded-[10px] border border-[#e8ecf0] bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-[rgb(var(--nx-text-primary))]">{campaign.name}</p>
                      <p className="text-sm text-[rgb(var(--nx-text-muted))]">{campaign.subject}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[rgb(var(--nx-text-muted))]">
                        Sent {campaign.sentCount} · Opened {campaign.openedCount} · {campaign.status}
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => void handleSend(campaign._id)}>
                      Send
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </WorkspaceShell>
  );
}
