import { Types } from "mongoose";
import { AiInsight } from "../models/AiInsight.js";
import { Activity } from "../models/Activity.js";
import { Company } from "../models/Company.js";
import { Contact } from "../models/Contact.js";
import { Deal } from "../models/Deal.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { env } from "../config/env.js";
import { generateContactEnrichment, generateSalesAnalysis, generateSalesDraft } from "../services/grok.service.js";
import { isEmailConfigured, sendEmailMessage } from "../services/email.service.js";

type AiInsightType =
  | "contact-enrichment"
  | "email-writer"
  | "deal-scoring"
  | "meeting-brief"
  | "revenue-forecast"
  | "weekly-digest";

type EnrichmentResult = {
  industry: string;
  companySize: string;
  location: string;
  description: string;
  keyInsights: string[];
  confidence: number;
};

type EmailDraftResult = {
  subject: string;
  body: string;
  callToAction: string;
  tone: string;
};

type DealScoreResult = {
  probabilityScore: number;
  confidence: number;
  reasoning: string;
  riskFactors: string[];
  recommendedNextAction: string;
};

type MeetingBriefResult = {
  talkingPoints: string[];
  questionsToAsk: string[];
  risksToAddress: string[];
  recommendedApproach: string;
  summary: string;
};

type RevenueForecastResult = {
  currentMonthRevenue: number;
  nextMonthRevenue: number;
  confidence: number;
  reasoning: string;
  assumptions: string[];
};

type WeeklyDigestResult = {
  subject: string;
  summary: string;
  highlights: string[];
  wins: string[];
  risks: string[];
  nextWeekFocus: string[];
};

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function buildDomainFromWebsite(website: string) {
  const cleaned = normalizeText(website).replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  return cleaned.split("/")[0] ?? "";
}

function serializeContact(contact: Record<string, unknown> | null | undefined) {
  if (!contact) return null;
  return {
    id: String(contact._id ?? ""),
    name: contact.name,
    email: contact.email,
    role: contact.role,
    companyName: contact.companyName,
    notes: contact.notes,
    tags: contact.tags,
    aiEnrichment: contact.aiEnrichment ?? null
  };
}

function serializeCompany(company: Record<string, unknown> | null | undefined) {
  if (!company) return null;
  return {
    id: String(company._id ?? ""),
    name: company.name,
    website: company.website,
    industry: company.industry,
    size: company.size,
    location: company.location,
    notes: company.notes,
    aiEnrichment: company.aiEnrichment ?? null
  };
}

function serializeDeal(deal: Record<string, unknown> | null | undefined) {
  if (!deal) return null;
  return {
    id: String(deal._id ?? ""),
    title: deal.title,
    value: deal.value,
    stage: deal.stage,
    probability: deal.probability,
    expectedCloseDate: deal.expectedCloseDate,
    notes: deal.notes,
    aiScore: deal.aiScore ?? null
  };
}

async function storeInsight(params: {
  organizationId: string;
  type: AiInsightType;
  title: string;
  input: unknown;
  output: unknown;
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
  sentToEmail?: string;
  emailStatus?: "not_sent" | "sent" | "failed";
}) {
  await AiInsight.create({
    organizationId: params.organizationId,
    type: params.type,
    title: params.title,
    input: params.input,
    output: params.output,
    relatedContactId: params.contactId ?? null,
    relatedCompanyId: params.companyId ?? null,
    relatedDealId: params.dealId ?? null,
    sentToEmail: params.sentToEmail ?? "",
    emailStatus: params.emailStatus ?? "not_sent",
    model: env.grokModel
  });
}

async function resolveCompanyTarget(
  organizationId: string,
  input: {
    companyId?: string;
    companyName?: string;
    website?: string;
    emailDomain?: string;
  }
) {
  if (input.companyId && Types.ObjectId.isValid(input.companyId)) {
    const company = await Company.findOne({ _id: input.companyId, organizationId }).lean();
    if (company) {
      return company;
    }
  }

  if (input.companyName?.trim()) {
    const company = await Company.findOne({
      organizationId,
      name: { $regex: input.companyName.trim(), $options: "i" }
    }).lean();
    if (company) {
      return company;
    }
  }

  const websiteDomain = input.website ? buildDomainFromWebsite(input.website) : "";
  const emailDomain = normalizeText(input.emailDomain).toLowerCase();
  const domainHint = websiteDomain || emailDomain;

  if (domainHint) {
    const company = await Company.findOne({
      organizationId,
      $or: [
        { website: { $regex: domainHint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { name: { $regex: domainHint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
      ]
    }).lean();

    if (company) {
      return company;
    }
  }

  return null;
}

async function gatherDealContext(organizationId: string, dealId: string) {
  const deal = await Deal.findOne({ _id: dealId, organizationId }).lean();

  if (!deal) {
    return null;
  }

  const [contact, company, activities] = await Promise.all([
    deal.contactId ? Contact.findOne({ _id: deal.contactId, organizationId }).lean() : Promise.resolve(null),
    deal.companyId ? Company.findOne({ _id: deal.companyId, organizationId }).lean() : Promise.resolve(null),
    Activity.find({
      organizationId,
      $or: [{ dealId }, { contactId: deal.contactId ?? null }, { companyId: deal.companyId ?? null }]
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()
  ]);

  return {
    deal,
    contact,
    company,
    activities
  };
}

function renderDigestHtml(result: WeeklyDigestResult) {
  const list = (items: string[]) => `<ul style="margin:0;padding-left:18px;">${items
    .map((item) => `<li style="margin-bottom:6px;">${item}</li>`)
    .join("")}</ul>`;

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <h1 style="margin-bottom: 8px;">${result.subject}</h1>
      <p>${result.summary}</p>
      <h2>Highlights</h2>
      ${list(result.highlights)}
      <h2>Wins</h2>
      ${list(result.wins)}
      <h2>Risks</h2>
      ${list(result.risks)}
      <h2>Next Week Focus</h2>
      ${list(result.nextWeekFocus)}
    </div>
  `;
}

export const listAiInsights = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const insights = await AiInsight.find({ organizationId: req.organization.id }).sort({ createdAt: -1 }).limit(20).lean();
  return sendResponse(res, 200, "AI insights loaded successfully.", { insights });
});

export const enrichContactOrCompany = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const {
    companyId,
    contactId,
    companyName,
    website,
    emailDomain
  } = req.body as {
    companyId?: string;
    contactId?: string;
    companyName?: string;
    website?: string;
    emailDomain?: string;
  };

  const contact =
    contactId && Types.ObjectId.isValid(contactId)
      ? await Contact.findOne({ _id: contactId, organizationId: req.organization.id })
      : null;

  const targetCompany = await resolveCompanyTarget(req.organization.id, {
    companyId,
    companyName,
    website,
    emailDomain
  });

  const companyContext = targetCompany ?? (contact?.companyId ? await Company.findOne({ _id: contact.companyId, organizationId: req.organization.id }).lean() : null);

  const prompt = JSON.stringify(
    {
      organization: {
        name: req.organization.name,
        plan: req.organization.plan
      },
      input: {
        companyName: companyName ?? companyContext?.name ?? "",
        website: website ?? companyContext?.website ?? "",
        emailDomain: emailDomain ?? "",
        contact: serializeContact(contact?.toObject?.() ?? contact),
        company: serializeCompany(companyContext)
      },
      instructions: [
        "Infer the best possible B2B enrichment from the available input.",
        "Be practical and concise.",
        "Use company size ranges like 1-10, 11-50, 51-200, 201-1000, 1000+ when possible.",
        "If a field is uncertain, make a reasonable inference and keep the wording brief."
      ]
    },
    null,
    2
  );

  const enrichment = await generateContactEnrichment<EnrichmentResult>(`
${prompt}

Return JSON with this shape:
{
  "industry": string,
  "companySize": string,
  "location": string,
  "description": string,
  "keyInsights": string[],
  "confidence": number
}
`);

  const enrichmentPayload = {
    ...enrichment,
    companyName: companyContext?.name ?? companyName ?? "",
    website: companyContext?.website ?? website ?? "",
    emailDomain: emailDomain ?? buildDomainFromWebsite(website ?? companyContext?.website ?? ""),
    model: env.grokModel,
    generatedAt: new Date().toISOString()
  };

  if (targetCompany) {
    await Company.findByIdAndUpdate(targetCompany._id, {
      $set: {
        aiEnrichment: enrichmentPayload,
        ...(targetCompany.industry ? {} : { industry: enrichment.industry }),
        ...(targetCompany.size ? {} : { size: enrichment.companySize }),
        ...(targetCompany.location ? {} : { location: enrichment.location }),
        ...(targetCompany.notes ? {} : { notes: enrichment.description })
      }
    });
  }

  if (contact) {
    contact.aiEnrichment = enrichmentPayload;
    await contact.save();
  }

  await storeInsight({
    organizationId: req.organization.id,
    type: "contact-enrichment",
    title: "AI contact and company enrichment",
    input: { companyId, contactId, companyName, website, emailDomain },
    output: enrichmentPayload,
    contactId: contact ? String(contact._id) : null,
    companyId: targetCompany ? String(targetCompany._id) : null
  });

  return sendResponse(res, 200, "Enrichment completed successfully.", {
    enrichment: enrichmentPayload,
    contact: contact ? serializeContact(contact.toObject()) : null,
    company: targetCompany ? serializeCompany(targetCompany) : null
  });
});

export const writeAiEmail = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { contactId, companyId, dealId, goal } = req.body as {
    contactId?: string;
    companyId?: string;
    dealId?: string;
    goal?: string;
  };

  const [contact, company, dealContext] = await Promise.all([
    contactId && Types.ObjectId.isValid(contactId)
      ? Contact.findOne({ _id: contactId, organizationId: req.organization.id }).lean()
      : Promise.resolve(null),
    companyId && Types.ObjectId.isValid(companyId)
      ? Company.findOne({ _id: companyId, organizationId: req.organization.id }).lean()
      : Promise.resolve(null),
    dealId && Types.ObjectId.isValid(dealId) ? gatherDealContext(req.organization.id, dealId) : Promise.resolve(null)
  ]);

  if (contactId && !contact) {
    return sendResponse(res, 404, "Contact not found in this organization.", {});
  }

  if (companyId && !company) {
    return sendResponse(res, 404, "Company not found in this organization.", {});
  }

  if (dealId && !dealContext) {
    return sendResponse(res, 404, "Deal not found in this organization.", {});
  }

  const prompt = JSON.stringify(
    {
      contact: serializeContact(contact),
      company: serializeCompany(company ?? dealContext?.company ?? null),
      deal: serializeDeal(dealContext?.deal ?? null),
      recentActivities: dealContext?.activities?.slice(0, 5) ?? [],
      goal: normalizeText(goal) || "Write a thoughtful outreach or follow-up email."
    },
    null,
    2
  );

  const draft = await generateSalesDraft<EmailDraftResult>(`
${prompt}

Return JSON with this shape:
{
  "subject": string,
  "body": string,
  "callToAction": string,
  "tone": string
}
`);

  await storeInsight({
    organizationId: req.organization.id,
    type: "email-writer",
    title: "AI email draft",
    input: { contactId, companyId, dealId, goal },
    output: draft,
    contactId: contact ? String(contact._id) : null,
    companyId: company ? String(company._id) : dealContext?.company ? String(dealContext.company._id) : null,
    dealId: dealContext?.deal ? String(dealContext.deal._id) : null
  });

  return sendResponse(res, 200, "Email draft generated successfully.", { draft });
});

export const scoreDealWithAi = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { dealId } = req.body as { dealId?: string };

  if (!dealId || !Types.ObjectId.isValid(dealId)) {
    return sendResponse(res, 400, "A valid deal id is required.", {});
  }

  const dealContext = await gatherDealContext(req.organization.id, dealId);

  if (!dealContext) {
    return sendResponse(res, 404, "Deal not found in this organization.", {});
  }

  const prompt = JSON.stringify(
    {
      deal: serializeDeal(dealContext.deal),
      contact: serializeContact(dealContext.contact),
      company: serializeCompany(dealContext.company),
      activities: dealContext.activities.map((activity) => ({
        type: activity.type,
        title: activity.title,
        notes: activity.notes,
        createdAt: activity.createdAt
      }))
    },
    null,
    2
  );

  const aiScore = await generateSalesAnalysis<DealScoreResult>(`
${prompt}

Return JSON with this shape:
{
  "probabilityScore": number,
  "confidence": number,
  "reasoning": string,
  "riskFactors": string[],
  "recommendedNextAction": string
}
`);

  const deal = await Deal.findOne({ _id: dealId, organizationId: req.organization.id });

  if (!deal) {
    return sendResponse(res, 404, "Deal not found in this organization.", {});
  }

  deal.aiScore = {
    ...aiScore,
    model: env.grokModel,
    generatedAt: new Date().toISOString()
  };
  await deal.save();

  await storeInsight({
    organizationId: req.organization.id,
    type: "deal-scoring",
    title: "AI deal score",
    input: { dealId },
    output: deal.aiScore,
    dealId: String(deal._id),
    contactId: deal.contactId ? String(deal.contactId) : null,
    companyId: deal.companyId ? String(deal.companyId) : null
  });

  return sendResponse(res, 200, "Deal scored successfully.", { aiScore: deal.aiScore, deal });
});

export const generateMeetingBrief = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { contactId, companyId, dealId } = req.body as {
    contactId?: string;
    companyId?: string;
    dealId?: string;
  };

  const [contact, company, dealContext] = await Promise.all([
    contactId && Types.ObjectId.isValid(contactId)
      ? Contact.findOne({ _id: contactId, organizationId: req.organization.id }).lean()
      : Promise.resolve(null),
    companyId && Types.ObjectId.isValid(companyId)
      ? Company.findOne({ _id: companyId, organizationId: req.organization.id }).lean()
      : Promise.resolve(null),
    dealId && Types.ObjectId.isValid(dealId) ? gatherDealContext(req.organization.id, dealId) : Promise.resolve(null)
  ]);

  if (contactId && !contact) {
    return sendResponse(res, 404, "Contact not found in this organization.", {});
  }

  if (companyId && !company) {
    return sendResponse(res, 404, "Company not found in this organization.", {});
  }

  if (dealId && !dealContext) {
    return sendResponse(res, 404, "Deal not found in this organization.", {});
  }

  const prompt = JSON.stringify(
    {
      contact: serializeContact(contact),
      company: serializeCompany(company ?? dealContext?.company ?? null),
      deal: serializeDeal(dealContext?.deal ?? null),
      previousActivities: dealContext?.activities ?? []
    },
    null,
    2
  );

  const brief = await generateSalesAnalysis<MeetingBriefResult>(`
${prompt}

Return JSON with this shape:
{
  "talkingPoints": string[],
  "questionsToAsk": string[],
  "risksToAddress": string[],
  "recommendedApproach": string,
  "summary": string
}
`);

  await storeInsight({
    organizationId: req.organization.id,
    type: "meeting-brief",
    title: "AI meeting brief",
    input: { contactId, companyId, dealId },
    output: brief,
    contactId: contact ? String(contact._id) : null,
    companyId: company ? String(company._id) : dealContext?.company ? String(dealContext.company._id) : null,
    dealId: dealContext?.deal ? String(dealContext.deal._id) : null
  });

  return sendResponse(res, 200, "Meeting brief generated successfully.", { brief });
});

export const generateRevenueForecast = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const [deals, activities] = await Promise.all([
    Deal.find({ organizationId: req.organization.id }).lean(),
    Activity.find({ organizationId: req.organization.id }).sort({ createdAt: -1 }).limit(50).lean()
  ]);

  const prompt = JSON.stringify(
    {
      deals: deals.map((deal) => ({
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
        probability: deal.probability,
        expectedCloseDate: deal.expectedCloseDate,
        aiScore: deal.aiScore
      })),
      activities: activities.map((activity) => ({
        type: activity.type,
        title: activity.title,
        createdAt: activity.createdAt
      }))
    },
    null,
    2
  );

  const forecast = await generateSalesAnalysis<RevenueForecastResult>(`
${prompt}

Return JSON with this shape:
{
  "currentMonthRevenue": number,
  "nextMonthRevenue": number,
  "confidence": number,
  "reasoning": string,
  "assumptions": string[]
}
`);

  await storeInsight({
    organizationId: req.organization.id,
    type: "revenue-forecast",
    title: "AI revenue forecast",
    input: { dealCount: deals.length, activityCount: activities.length },
    output: forecast
  });

  return sendResponse(res, 200, "Revenue forecast generated successfully.", { forecast });
});

export const sendWeeklyDigest = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { toEmail } = req.body as { toEmail?: string };
  const recipient = normalizeText(toEmail) || req.auth?.email || "";

  if (!recipient) {
    return sendResponse(res, 400, "A recipient email address is required.", {});
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [contacts, deals, activities, wonDeals, lostDeals] = await Promise.all([
    Contact.find({ organizationId: req.organization.id, createdAt: { $gte: since } }).lean(),
    Deal.find({ organizationId: req.organization.id, updatedAt: { $gte: since } }).lean(),
    Activity.find({ organizationId: req.organization.id, createdAt: { $gte: since } }).sort({ createdAt: -1 }).lean(),
    Deal.find({ organizationId: req.organization.id, stage: "Won", updatedAt: { $gte: since } }).lean(),
    Deal.find({ organizationId: req.organization.id, stage: "Lost", updatedAt: { $gte: since } }).lean()
  ]);

  const prompt = JSON.stringify(
    {
      weekRange: {
        since: since.toISOString(),
        until: new Date().toISOString()
      },
      contacts: contacts.slice(0, 30).map((contact) => ({
        name: contact.name,
        email: contact.email,
        companyName: contact.companyName,
        createdAt: contact.createdAt
      })),
      deals: deals.slice(0, 40).map((deal) => ({
        title: deal.title,
        value: deal.value,
        stage: deal.stage,
        probability: deal.probability,
        expectedCloseDate: deal.expectedCloseDate
      })),
      activities: activities.slice(0, 40).map((activity) => ({
        type: activity.type,
        title: activity.title,
        notes: activity.notes,
        createdAt: activity.createdAt
      })),
      wonDeals: wonDeals.map((deal) => ({ title: deal.title, value: deal.value })),
      lostDeals: lostDeals.map((deal) => ({ title: deal.title, value: deal.value }))
    },
    null,
    2
  );

  const digest = await generateSalesAnalysis<WeeklyDigestResult>(`
${prompt}

Write a professional weekly sales digest.
Return JSON with this shape:
{
  "subject": string,
  "summary": string,
  "highlights": string[],
  "wins": string[],
  "risks": string[],
  "nextWeekFocus": string[]
}
`);

  const emailText = [
    digest.subject,
    "",
    digest.summary,
    "",
    "Highlights:",
    ...digest.highlights.map((item) => `- ${item}`),
    "",
    "Wins:",
    ...digest.wins.map((item) => `- ${item}`),
    "",
    "Risks:",
    ...digest.risks.map((item) => `- ${item}`),
    "",
    "Next Week Focus:",
    ...digest.nextWeekFocus.map((item) => `- ${item}`)
  ].join("\n");

  let emailStatus: "not_sent" | "sent" | "failed" = "not_sent";

  try {
    if (!isEmailConfigured()) {
      throw new Error("Email delivery is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.");
    }

    await sendEmailMessage({
      to: recipient,
      subject: digest.subject,
      text: emailText,
      html: renderDigestHtml(digest)
    });

    emailStatus = "sent";
  } catch (error) {
    emailStatus = "failed";
    await storeInsight({
      organizationId: req.organization.id,
      type: "weekly-digest",
      title: "AI weekly sales digest",
      input: { toEmail: recipient, since: since.toISOString() },
      output: { digest, error: error instanceof Error ? error.message : "Unknown error" },
      sentToEmail: recipient,
      emailStatus
    });

    return sendResponse(res, 503, error instanceof Error ? error.message : "Unable to send weekly digest.", {
      digest,
      emailStatus
    });
  }

  await storeInsight({
    organizationId: req.organization.id,
    type: "weekly-digest",
    title: "AI weekly sales digest",
    input: { toEmail: recipient, since: since.toISOString() },
    output: digest,
    sentToEmail: recipient,
    emailStatus
  });

  return sendResponse(res, 200, "Weekly digest sent successfully.", { digest, sentToEmail: recipient });
});
