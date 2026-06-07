import { Types } from "mongoose";
import { Activity } from "../models/Activity.js";
import { Company } from "../models/Company.js";
import { Contact } from "../models/Contact.js";
import { Deal } from "../models/Deal.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const listCompanies = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const companies = await Company.find({ organizationId: req.organization.id }).sort({ createdAt: -1 }).lean();
  const contacts = await Contact.find({ organizationId: req.organization.id }).select("companyId").lean();

  const contactCounts = contacts.reduce<Record<string, number>>((acc, contact) => {
    if (!contact.companyId) return acc;
    const key = String(contact.companyId);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return sendResponse(res, 200, "Companies loaded successfully.", {
    companies: companies.map((company) => ({
      ...company,
      contactCount: contactCounts[String(company._id)] ?? 0
    }))
  });
});

export const getCompany = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { companyId } = req.params;

  if (!Types.ObjectId.isValid(companyId)) {
    return sendResponse(res, 400, "A valid company id is required.", {});
  }

  const company = await Company.findOne({ _id: companyId, organizationId: req.organization.id }).lean();

  if (!company) {
    return sendResponse(res, 404, "Company not found.", {});
  }

  const [contacts, deals, activities] = await Promise.all([
    Contact.find({ organizationId: req.organization.id, companyId }).sort({ createdAt: -1 }).lean(),
    Deal.find({ organizationId: req.organization.id, companyId }).sort({ createdAt: -1 }).lean(),
    Activity.find({ organizationId: req.organization.id, companyId }).sort({ createdAt: -1 }).lean()
  ]);

  return sendResponse(res, 200, "Company loaded successfully.", {
    company,
    contacts,
    deals,
    activities
  });
});

export const createCompany = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { name, website, industry, size, location, notes } = req.body as {
    name?: string;
    website?: string;
    industry?: string;
    size?: string;
    location?: string;
    notes?: string;
  };

  if (!name) {
    return sendResponse(res, 400, "Company name is required.", {});
  }

  const company = await Company.create({
    organizationId: req.organization.id,
    name,
    website: website?.trim() ?? "",
    industry: industry?.trim() ?? "",
    size: size?.trim() ?? "",
    location: location?.trim() ?? "",
    notes: notes ?? ""
  });

  return sendResponse(res, 201, "Company created successfully.", { company });
});

export const updateCompany = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { companyId } = req.params;

  if (!Types.ObjectId.isValid(companyId)) {
    return sendResponse(res, 400, "A valid company id is required.", {});
  }

  const company = await Company.findOne({ _id: companyId, organizationId: req.organization.id });

  if (!company) {
    return sendResponse(res, 404, "Company not found.", {});
  }

  const { name, website, industry, size, location, notes } = req.body as {
    name?: string;
    website?: string;
    industry?: string;
    size?: string;
    location?: string;
    notes?: string;
  };

  if (name !== undefined) company.name = name;
  if (website !== undefined) company.website = website;
  if (industry !== undefined) company.industry = industry;
  if (size !== undefined) company.size = size;
  if (location !== undefined) company.location = location;
  if (notes !== undefined) company.notes = notes;

  await company.save();

  await Contact.updateMany(
    { organizationId: req.organization.id, companyId },
    { $set: { companyName: company.name } }
  );

  return sendResponse(res, 200, "Company updated successfully.", { company });
});

export const deleteCompany = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { companyId } = req.params;

  if (!Types.ObjectId.isValid(companyId)) {
    return sendResponse(res, 400, "A valid company id is required.", {});
  }

  const company = await Company.findOneAndDelete({ _id: companyId, organizationId: req.organization.id });

  if (!company) {
    return sendResponse(res, 404, "Company not found.", {});
  }

  await Promise.all([
    Contact.updateMany(
      { organizationId: req.organization.id, companyId },
      { $set: { companyId: null, companyName: "" } }
    ),
    Deal.updateMany({ organizationId: req.organization.id, companyId }, { $set: { companyId: null } }),
    Activity.updateMany({ organizationId: req.organization.id, companyId }, { $set: { companyId: null } })
  ]);

  return sendResponse(res, 200, "Company deleted successfully.", {});
});
