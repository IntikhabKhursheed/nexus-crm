import { api } from "./api";
import { getActiveOrganizationId } from "./auth";

export const dealStages = ["Lead", "Contacted", "Meeting", "Proposal", "Negotiation", "Won", "Lost"] as const;

export type DealStage = (typeof dealStages)[number];

export type Contact = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  role: string;
  tags: string[];
  companyId: string | null;
  companyName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Company = {
  _id: string;
  name: string;
  website: string;
  industry: string;
  size: string;
  location: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  contactCount?: number;
};

export type Deal = {
  _id: string;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string | null;
  contactId: string | null;
  companyId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  _id: string;
  type: "email" | "call" | "meeting" | "note" | "WhatsApp";
  title: string;
  notes: string;
  contactId: string | null;
  companyId: string | null;
  dealId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  role: string;
  tags: string;
  companyId: string;
  notes: string;
};

export type CompanyPayload = {
  name: string;
  website: string;
  industry: string;
  size: string;
  location: string;
  notes: string;
};

export type DealPayload = {
  title: string;
  value: string;
  stage: DealStage;
  probability: string;
  expectedCloseDate: string;
  contactId: string;
  companyId: string;
  notes: string;
};

export type ActivityPayload = {
  type: Activity["type"];
  title: string;
  notes: string;
  contactId: string;
  companyId: string;
  dealId: string;
};

function orgIdOrThrow() {
  const orgId = getActiveOrganizationId();
  if (!orgId) {
    throw new Error("No active organization found. Please sign in again.");
  }
  return orgId;
}

function orgPath(path: string) {
  return `/organizations/${orgIdOrThrow()}${path}`;
}

export async function listContacts(params?: Record<string, string>) {
  const response = await api.get(orgPath("/contacts"), { params });
  return response.data.data as { contacts: Contact[] };
}

export async function getContact(contactId: string) {
  const response = await api.get(orgPath(`/contacts/${contactId}`));
  return response.data.data as { contact: Contact; activities: Activity[]; deals: Deal[] };
}

export async function createContact(payload: ContactPayload) {
  const response = await api.post(orgPath("/contacts"), payload);
  return response.data.data as { contact: Contact };
}

export async function updateContact(contactId: string, payload: ContactPayload) {
  const response = await api.put(orgPath(`/contacts/${contactId}`), payload);
  return response.data.data as { contact: Contact };
}

export async function deleteContact(contactId: string) {
  const response = await api.delete(orgPath(`/contacts/${contactId}`));
  return response.data.data as Record<string, never>;
}

export async function listCompanies() {
  const response = await api.get(orgPath("/companies"));
  return response.data.data as { companies: Company[] };
}

export async function getCompany(companyId: string) {
  const response = await api.get(orgPath(`/companies/${companyId}`));
  return response.data.data as { company: Company; contacts: Contact[]; deals: Deal[]; activities: Activity[] };
}

export async function createCompany(payload: CompanyPayload) {
  const response = await api.post(orgPath("/companies"), payload);
  return response.data.data as { company: Company };
}

export async function updateCompany(companyId: string, payload: CompanyPayload) {
  const response = await api.put(orgPath(`/companies/${companyId}`), payload);
  return response.data.data as { company: Company };
}

export async function deleteCompany(companyId: string) {
  const response = await api.delete(orgPath(`/companies/${companyId}`));
  return response.data.data as Record<string, never>;
}

export async function listDeals() {
  const response = await api.get(orgPath("/deals"));
  return response.data.data as { deals: Deal[] };
}

export async function createDeal(payload: Omit<DealPayload, "value" | "probability"> & { value: string; probability: string }) {
  const response = await api.post(orgPath("/deals"), {
    ...payload,
    value: Number(payload.value),
    probability: Number(payload.probability)
  });
  return response.data.data as { deal: Deal };
}

export async function updateDeal(dealId: string, payload: Omit<DealPayload, "value" | "probability"> & { value: string; probability: string }) {
  const response = await api.put(orgPath(`/deals/${dealId}`), {
    ...payload,
    value: Number(payload.value),
    probability: Number(payload.probability)
  });
  return response.data.data as { deal: Deal };
}

export async function updateDealStage(dealId: string, stage: DealStage) {
  const response = await api.patch(orgPath(`/deals/${dealId}/stage`), { stage });
  return response.data.data as { deal: Deal };
}

export async function deleteDeal(dealId: string) {
  const response = await api.delete(orgPath(`/deals/${dealId}`));
  return response.data.data as Record<string, never>;
}

export async function listContactActivities(contactId: string) {
  const response = await api.get(orgPath(`/contacts/${contactId}/activities`));
  return response.data.data as { activities: Activity[] };
}

export async function createContactActivity(contactId: string, payload: ActivityPayload) {
  const response = await api.post(orgPath(`/contacts/${contactId}/activities`), payload);
  return response.data.data as { activity: Activity };
}

export async function listActivities(params?: Record<string, string>) {
  const response = await api.get(orgPath("/activities"), { params });
  return response.data.data as { activities: Activity[] };
}

export async function createActivity(payload: ActivityPayload) {
  const response = await api.post(orgPath("/activities"), payload);
  return response.data.data as { activity: Activity };
}
