import { api } from "./api";
import { orgPath } from "./org";

export type Campaign = {
  _id: string;
  name: string;
  subject: string;
  content: string;
  segment?: Record<string, unknown> | null;
  recipients: Array<{
    contactId: string;
    email: string;
    name: string;
    token: string;
    sentAt?: string | null;
    openedAt?: string | null;
    lastOpenedAt?: string | null;
    isOpened?: boolean;
  }>;
  sentCount: number;
  openedCount: number;
  status: "draft" | "sent";
  createdAt: string;
  updatedAt: string;
};

export async function listCampaigns() {
  const response = await api.get(orgPath("/campaigns"));
  return response.data.data as { campaigns: Campaign[] };
}

export async function createCampaign(payload: {
  name: string;
  subject: string;
  content: string;
  segment?: Record<string, unknown>;
}) {
  const response = await api.post(orgPath("/campaigns"), payload);
  return response.data.data as { campaign: Campaign; recipientCount: number };
}

export async function previewCampaign(payload: {
  subject: string;
  content: string;
  contactId?: string;
}) {
  const response = await api.post(orgPath("/campaigns/preview"), payload);
  return response.data.data as { preview: { subject: string; content: string } };
}

export async function sendCampaign(campaignId: string) {
  const response = await api.post(orgPath(`/campaigns/${campaignId}/send`));
  return response.data.data as { campaign: Campaign; sentRecipients: string[] };
}

export async function getCampaignStats(campaignId: string) {
  const response = await api.get(orgPath(`/campaigns/${campaignId}/stats`));
  return response.data.data as {
    campaign: Campaign;
    stats: {
      sentCount: number;
      openedCount: number;
      openRate: number;
    };
  };
}

