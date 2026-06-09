import { Types } from "mongoose";
import { Company } from "../models/Company.js";
import { Contact } from "../models/Contact.js";
import { Deal } from "../models/Deal.js";
import { createOrganizationNotifications } from "../services/notification.service.js";
import { recordAuditLog } from "../services/audit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

const validStages = ["Lead", "Contacted", "Meeting", "Proposal", "Negotiation", "Won", "Lost"] as const;

async function resolveDealRefs(orgId: string, contactId?: string | null, companyId?: string | null) {
  let contact = null;
  let company = null;

  if (contactId) {
    if (!Types.ObjectId.isValid(contactId)) return null;
    contact = await Contact.findOne({ _id: contactId, organizationId: orgId }).lean();
    if (!contact) return null;
  }

  if (companyId) {
    if (!Types.ObjectId.isValid(companyId)) return null;
    company = await Company.findOne({ _id: companyId, organizationId: orgId }).lean();
    if (!company) return null;
  }

  return { contact, company };
}

export const listDeals = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const deals = await Deal.find({ organizationId: req.organization.id }).sort({ createdAt: -1 }).lean();

  return sendResponse(res, 200, "Deals loaded successfully.", { deals });
});

export const createDeal = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { title, value, stage, probability, expectedCloseDate, contactId, companyId, notes } = req.body as {
    title?: string;
    value?: number;
    stage?: typeof validStages[number];
    probability?: number;
    expectedCloseDate?: string;
    contactId?: string | null;
    companyId?: string | null;
    notes?: string;
  };

  if (!title) {
    return sendResponse(res, 400, "Deal title is required.", {});
  }

  if (stage && !validStages.includes(stage)) {
    return sendResponse(res, 400, "Invalid deal stage.", {});
  }

  const refs = await resolveDealRefs(req.organization.id, contactId, companyId);

  if (contactId && !refs?.contact) {
    return sendResponse(res, 404, "Contact not found in this organization.", {});
  }

  if (companyId && !refs?.company) {
    return sendResponse(res, 404, "Company not found in this organization.", {});
  }

  const deal = await Deal.create({
    organizationId: req.organization.id,
    title,
    value: value ?? 0,
    stage: stage ?? "Lead",
    probability: probability ?? 0,
    expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
    contactId: refs?.contact?._id ?? null,
    companyId: refs?.company?._id ?? null,
    notes: notes ?? ""
  });

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth?.userId ?? "",
    action: "deal_created",
    entityType: "deal",
    entityId: String(deal._id),
    metadata: { title, stage: stage ?? "Lead", value: value ?? 0 }
  });

  return sendResponse(res, 201, "Deal created successfully.", { deal });
});

export const updateDeal = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const dealId = String(req.params.dealId);

  if (!Types.ObjectId.isValid(dealId)) {
    return sendResponse(res, 400, "A valid deal id is required.", {});
  }

  const deal = await Deal.findOne({ _id: dealId, organizationId: req.organization.id });

  if (!deal) {
    return sendResponse(res, 404, "Deal not found.", {});
  }

  const { title, value, stage, probability, expectedCloseDate, contactId, companyId, notes } = req.body as {
    title?: string;
    value?: number;
    stage?: typeof validStages[number];
    probability?: number;
    expectedCloseDate?: string | null;
    contactId?: string | null;
    companyId?: string | null;
    notes?: string;
  };

  if (title !== undefined) deal.title = title;
  if (value !== undefined) deal.value = value;
  if (stage !== undefined) {
    if (!validStages.includes(stage)) {
      return sendResponse(res, 400, "Invalid deal stage.", {});
    }
    deal.stage = stage;
  }
  if (probability !== undefined) deal.probability = probability;
  if (expectedCloseDate !== undefined) deal.expectedCloseDate = expectedCloseDate ? new Date(expectedCloseDate) : null;
  if (notes !== undefined) deal.notes = notes;

  if (contactId !== undefined || companyId !== undefined) {
    const refs = await resolveDealRefs(
      req.organization.id,
      contactId ?? String(deal.contactId ?? ""),
      companyId ?? String(deal.companyId ?? "")
    );

    if (contactId && !refs?.contact) {
      return sendResponse(res, 404, "Contact not found in this organization.", {});
    }
    if (companyId && !refs?.company) {
      return sendResponse(res, 404, "Company not found in this organization.", {});
    }

    if (contactId !== undefined) deal.contactId = refs?.contact?._id ?? null;
    if (companyId !== undefined) deal.companyId = refs?.company?._id ?? null;
  }

  await deal.save();

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth?.userId ?? "",
    action: "deal_updated",
    entityType: "deal",
    entityId: String(deal._id)
  });

  return sendResponse(res, 200, "Deal updated successfully.", { deal });
});

export const updateDealStage = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const dealId = String(req.params.dealId);
  const { stage } = req.body as { stage?: typeof validStages[number] };

  if (!Types.ObjectId.isValid(dealId)) {
    return sendResponse(res, 400, "A valid deal id is required.", {});
  }

  if (!stage || !validStages.includes(stage)) {
    return sendResponse(res, 400, "A valid deal stage is required.", {});
  }

  const deal = await Deal.findOneAndUpdate(
    { _id: dealId, organizationId: req.organization.id },
    { $set: { stage } },
    { new: true }
  );

  if (!deal) {
    return sendResponse(res, 404, "Deal not found.", {});
  }

  await createOrganizationNotifications({
    organizationId: req.organization.id,
    type: "deal_stage_changed",
    title: "Deal stage updated",
    message: `${deal.title} moved to ${stage}.`,
    metadata: { dealId: String(deal._id), stage },
    excludeUserId: req.auth?.userId
  });

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth?.userId ?? "",
    action: "deal_stage_updated",
    entityType: "deal",
    entityId: String(deal._id),
    metadata: { stage }
  });

  return sendResponse(res, 200, "Deal stage updated successfully.", { deal });
});

export const deleteDeal = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const dealId = String(req.params.dealId);

  if (!Types.ObjectId.isValid(dealId)) {
    return sendResponse(res, 400, "A valid deal id is required.", {});
  }

  const deal = await Deal.findOneAndDelete({ _id: dealId, organizationId: req.organization.id });

  if (!deal) {
    return sendResponse(res, 404, "Deal not found.", {});
  }

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth?.userId ?? "",
    action: "deal_deleted",
    entityType: "deal",
    entityId: dealId
  });

  return sendResponse(res, 200, "Deal deleted successfully.", {});
});
