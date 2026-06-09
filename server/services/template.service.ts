import type { ContactDocument } from "../models/Contact.js";
import type { DealDocument } from "../models/Deal.js";
import type { CompanyDocument } from "../models/Company.js";

function getFirstName(name?: string) {
  if (!name) return "";
  return name.trim().split(/\s+/)[0] ?? "";
}

export function renderCampaignTemplate(
  template: string,
  contact: ContactDocument & { _id?: unknown },
  company: CompanyDocument | null,
  deal: DealDocument | null
) {
  const replacements: Record<string, string> = {
    firstName: getFirstName(contact.name),
    company: company?.name ?? contact.companyName ?? "",
    dealValue: deal ? `$${Number(deal.value ?? 0).toLocaleString()}` : "$0"
  };

  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => replacements[key] ?? "");
}

