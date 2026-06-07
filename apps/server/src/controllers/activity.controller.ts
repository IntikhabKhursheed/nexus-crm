import { Types } from "mongoose";
import { Activity } from "../models/Activity.js";
import { Company } from "../models/Company.js";
import { Contact } from "../models/Contact.js";
import { Deal } from "../models/Deal.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const listActivities = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const filter: Record<string, unknown> = { organizationId: req.organization.id };

  if (typeof req.query.contactId === "string" && Types.ObjectId.isValid(req.query.contactId)) {
    filter.contactId = req.query.contactId;
  }

  if (typeof req.query.companyId === "string" && Types.ObjectId.isValid(req.query.companyId)) {
    filter.companyId = req.query.companyId;
  }

  if (typeof req.query.dealId === "string" && Types.ObjectId.isValid(req.query.dealId)) {
    filter.dealId = req.query.dealId;
  }

  const activities = await Activity.find(filter).sort({ createdAt: -1 }).lean();

  return sendResponse(res, 200, "Activities loaded successfully.", { activities });
});

export const createActivity = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { type, title, notes, contactId, companyId, dealId } = req.body as {
    type?: "email" | "call" | "meeting" | "note" | "WhatsApp";
    title?: string;
    notes?: string;
    contactId?: string | null;
    companyId?: string | null;
    dealId?: string | null;
  };

  if (!type || !notes) {
    return sendResponse(res, 400, "Activity type and notes are required.", {});
  }

  if (contactId && !Types.ObjectId.isValid(contactId)) {
    return sendResponse(res, 400, "A valid contact id is required.", {});
  }

  if (companyId && !Types.ObjectId.isValid(companyId)) {
    return sendResponse(res, 400, "A valid company id is required.", {});
  }

  if (dealId && !Types.ObjectId.isValid(dealId)) {
    return sendResponse(res, 400, "A valid deal id is required.", {});
  }

  if (contactId) {
    const contact = await Contact.findOne({ _id: contactId, organizationId: req.organization.id }).lean();
    if (!contact) {
      return sendResponse(res, 404, "Contact not found in this organization.", {});
    }
  }

  if (companyId) {
    const company = await Company.findOne({ _id: companyId, organizationId: req.organization.id }).lean();
    if (!company) {
      return sendResponse(res, 404, "Company not found in this organization.", {});
    }
  }

  if (dealId) {
    const deal = await Deal.findOne({ _id: dealId, organizationId: req.organization.id }).lean();
    if (!deal) {
      return sendResponse(res, 404, "Deal not found in this organization.", {});
    }
  }

  const activity = await Activity.create({
    organizationId: req.organization.id,
    type,
    title: title?.trim() ?? "",
    notes,
    contactId: contactId || null,
    companyId: companyId || null,
    dealId: dealId || null
  });

  return sendResponse(res, 201, "Activity created successfully.", { activity });
});
