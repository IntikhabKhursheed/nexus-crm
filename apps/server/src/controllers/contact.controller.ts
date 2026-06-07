import { Types } from "mongoose";
import { Activity } from "../models/Activity.js";
import { Company } from "../models/Company.js";
import { Contact } from "../models/Contact.js";
import { Deal } from "../models/Deal.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

function normalizeTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function buildContactQuery(orgId: string, query: Record<string, unknown>) {
  const filter: Record<string, unknown> = { organizationId: orgId };
  const q = typeof query.q === "string" ? query.q.trim() : "";

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { companyName: { $regex: q, $options: "i" } },
      { tags: { $in: [new RegExp(q, "i")] } }
    ];
  }

  if (typeof query.name === "string" && query.name.trim()) {
    filter.name = { $regex: query.name.trim(), $options: "i" };
  }

  if (typeof query.email === "string" && query.email.trim()) {
    filter.email = { $regex: query.email.trim(), $options: "i" };
  }

  if (typeof query.company === "string" && query.company.trim()) {
    filter.companyName = { $regex: query.company.trim(), $options: "i" };
  }

  if (typeof query.tags === "string" && query.tags.trim()) {
    const tags = query.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (tags.length) {
      filter.tags = { $in: tags };
    }
  }

  return filter;
}

async function resolveCompanySnapshot(orgId: string, companyId?: string | null) {
  if (!companyId) {
    return { companyId: null, companyName: "" };
  }

  if (!Types.ObjectId.isValid(companyId)) {
    return null;
  }

  const company = await Company.findOne({ _id: companyId, organizationId: orgId }).lean();

  if (!company) {
    return null;
  }

  return {
    companyId: company._id,
    companyName: company.name
  };
}

export const listContacts = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const contacts = await Contact.find(buildContactQuery(req.organization.id, req.query as Record<string, unknown>))
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, 200, "Contacts loaded successfully.", { contacts });
});

export const createContact = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { name, email, phone, linkedin, role, companyId, notes } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    role?: string;
    companyId?: string;
    notes?: string;
    tags?: string[] | string;
  };

  if (!name) {
    return sendResponse(res, 400, "Contact name is required.", {});
  }

  const companySnapshot = await resolveCompanySnapshot(req.organization.id, companyId);

  if (companyId && !companySnapshot) {
    return sendResponse(res, 404, "Company not found in this organization.", {});
  }

  const contact = await Contact.create({
    organizationId: req.organization.id,
    name,
    email: email?.toLowerCase().trim() ?? "",
    phone: phone?.trim() ?? "",
    linkedin: linkedin?.trim() ?? "",
    role: role?.trim() ?? "",
    tags: normalizeTags((req.body as { tags?: string[] | string }).tags),
    companyId: companySnapshot?.companyId ?? null,
    companyName: companySnapshot?.companyName ?? "",
    notes: notes ?? ""
  });

  return sendResponse(res, 201, "Contact created successfully.", { contact });
});

export const getContact = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { contactId } = req.params;

  if (!Types.ObjectId.isValid(contactId)) {
    return sendResponse(res, 400, "A valid contact id is required.", {});
  }

  const contact = await Contact.findOne({ _id: contactId, organizationId: req.organization.id }).lean();

  if (!contact) {
    return sendResponse(res, 404, "Contact not found.", {});
  }

  const [activities, deals] = await Promise.all([
    Activity.find({ organizationId: req.organization.id, contactId }).sort({ createdAt: -1 }).lean(),
    Deal.find({ organizationId: req.organization.id, contactId }).sort({ createdAt: -1 }).lean()
  ]);

  return sendResponse(res, 200, "Contact loaded successfully.", {
    contact,
    activities,
    deals
  });
});

export const updateContact = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { contactId } = req.params;

  if (!Types.ObjectId.isValid(contactId)) {
    return sendResponse(res, 400, "A valid contact id is required.", {});
  }

  const existingContact = await Contact.findOne({ _id: contactId, organizationId: req.organization.id });

  if (!existingContact) {
    return sendResponse(res, 404, "Contact not found.", {});
  }

  const { name, email, phone, linkedin, role, companyId, notes } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    role?: string;
    companyId?: string | null;
    notes?: string;
    tags?: string[] | string;
  };

  if (name !== undefined) existingContact.name = name;
  if (email !== undefined) existingContact.email = email.toLowerCase().trim();
  if (phone !== undefined) existingContact.phone = phone.trim();
  if (linkedin !== undefined) existingContact.linkedin = linkedin.trim();
  if (role !== undefined) existingContact.role = role.trim();
  if (notes !== undefined) existingContact.notes = notes;
  if (req.body.tags !== undefined) existingContact.tags = normalizeTags(req.body.tags);

  if (companyId !== undefined) {
    const companySnapshot = await resolveCompanySnapshot(req.organization.id, companyId);
    if (companyId && !companySnapshot) {
      return sendResponse(res, 404, "Company not found in this organization.", {});
    }
    existingContact.companyId = companySnapshot?.companyId ?? null;
    existingContact.companyName = companySnapshot?.companyName ?? "";
  }

  await existingContact.save();

  return sendResponse(res, 200, "Contact updated successfully.", { contact: existingContact });
});

export const deleteContact = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { contactId } = req.params;

  if (!Types.ObjectId.isValid(contactId)) {
    return sendResponse(res, 400, "A valid contact id is required.", {});
  }

  const contact = await Contact.findOneAndDelete({ _id: contactId, organizationId: req.organization.id });

  if (!contact) {
    return sendResponse(res, 404, "Contact not found.", {});
  }

  await Promise.all([
    Deal.updateMany({ organizationId: req.organization.id, contactId }, { $set: { contactId: null } }),
    Activity.updateMany({ organizationId: req.organization.id, contactId }, { $set: { contactId: null } })
  ]);

  return sendResponse(res, 200, "Contact deleted successfully.", {});
});

export const listContactActivities = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { contactId } = req.params;

  if (!Types.ObjectId.isValid(contactId)) {
    return sendResponse(res, 400, "A valid contact id is required.", {});
  }

  const activities = await Activity.find({ organizationId: req.organization.id, contactId })
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, 200, "Activity timeline loaded successfully.", { activities });
});

export const createContactActivity = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { contactId } = req.params;

  if (!Types.ObjectId.isValid(contactId)) {
    return sendResponse(res, 400, "A valid contact id is required.", {});
  }

  const { type, title, notes, companyId, dealId } = req.body as {
    type?: "email" | "call" | "meeting" | "note" | "WhatsApp";
    title?: string;
    notes?: string;
    companyId?: string;
    dealId?: string;
  };

  if (!type || !notes) {
    return sendResponse(res, 400, "Activity type and notes are required.", {});
  }

  if (companyId && !Types.ObjectId.isValid(companyId)) {
    return sendResponse(res, 400, "A valid company id is required.", {});
  }

  if (dealId && !Types.ObjectId.isValid(dealId)) {
    return sendResponse(res, 400, "A valid deal id is required.", {});
  }

  const contact = await Contact.findOne({ _id: contactId, organizationId: req.organization.id }).lean();

  if (!contact) {
    return sendResponse(res, 404, "Contact not found.", {});
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
    contactId,
    companyId: companyId || null,
    dealId: dealId || null
  });

  return sendResponse(res, 201, "Activity logged successfully.", { activity });
});
