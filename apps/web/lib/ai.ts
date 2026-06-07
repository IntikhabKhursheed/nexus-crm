import { api } from "./api";
import { getActiveOrganizationId } from "./auth";
import type { AiDealScore, AiEnrichment, Activity, Company, Contact, Deal } from "./crm";

function orgIdOrThrow() {
  const orgId = getActiveOrganizationId();
  if (!orgId) {
    throw new Error("No active organization found. Please sign in again.");
  }
  return orgId;
}

function orgPath(path: string) {
  return `/organizations/${orgIdOrThrow()}/ai${path}`;
}

export type AiEmailDraft = {
  subject: string;
  body: string;
  callToAction: string;
  tone: string;
};

export type AiMeetingBrief = {
  talkingPoints: string[];
  questionsToAsk: string[];
  risksToAddress: string[];
  recommendedApproach: string;
  summary: string;
};

export type AiRevenueForecast = {
  currentMonthRevenue: number;
  nextMonthRevenue: number;
  confidence: number;
  reasoning: string;
  assumptions: string[];
};

export type AiWeeklyDigest = {
  subject: string;
  summary: string;
  highlights: string[];
  wins: string[];
  risks: string[];
  nextWeekFocus: string[];
};

export type AiInsightRecord = {
  _id: string;
  type: string;
  title: string;
  input: unknown;
  output: unknown;
  sentToEmail?: string;
  emailStatus?: "not_sent" | "sent" | "failed";
  createdAt: string;
  updatedAt: string;
};

export async function listAiInsights() {
  const response = await api.get(orgPath("/insights"));
  return response.data.data as { insights: AiInsightRecord[] };
}

export async function enrichContactOrCompany(payload: {
  companyId?: string;
  contactId?: string;
  companyName?: string;
  website?: string;
  emailDomain?: string;
}) {
  const response = await api.post(orgPath("/contact-enrichment"), payload);
  return response.data.data as {
    enrichment: AiEnrichment;
    contact: Contact | null;
    company: Company | null;
  };
}

export async function writeAiEmail(payload: {
  contactId?: string;
  companyId?: string;
  dealId?: string;
  goal?: string;
}) {
  const response = await api.post(orgPath("/email-writer"), payload);
  return response.data.data as { draft: AiEmailDraft };
}

export async function scoreDealWithAi(payload: { dealId: string }) {
  const response = await api.post(orgPath("/deal-scoring"), payload);
  return response.data.data as { aiScore: AiDealScore; deal: Deal };
}

export async function generateMeetingBrief(payload: {
  contactId?: string;
  companyId?: string;
  dealId?: string;
}) {
  const response = await api.post(orgPath("/meeting-brief"), payload);
  return response.data.data as { brief: AiMeetingBrief };
}

export async function generateRevenueForecast() {
  const response = await api.post(orgPath("/revenue-forecast"), {});
  return response.data.data as { forecast: AiRevenueForecast };
}

export async function sendWeeklyDigest(payload: { toEmail?: string }) {
  const response = await api.post(orgPath("/weekly-digest"), payload);
  return response.data.data as {
    digest: AiWeeklyDigest;
    sentToEmail: string;
    emailStatus?: "sent" | "failed" | "not_sent";
  };
}

export type { AiDealScore, AiEnrichment, Activity, Company, Contact, Deal };
