import { Types } from "mongoose";
import { Organization } from "../models/Organization.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { recordAuditLog } from "../services/audit.service.js";

export const getOrganizationSettings = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const organization = await Organization.findById(req.organization.id).lean();
  if (!organization) {
    return sendResponse(res, 404, "Organization not found.", {});
  }

  return sendResponse(res, 200, "Organization settings loaded successfully.", { organization });
});

export const updateOrganizationSettings = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const organizationId = String(req.organization.id);
  if (!Types.ObjectId.isValid(organizationId)) {
    return sendResponse(res, 400, "A valid organization id is required.", {});
  }

  const { name, timezone, currency, branding } = req.body as {
    name?: string;
    timezone?: string;
    currency?: string;
    branding?: string | {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
    };
  };

  const parsedBranding =
    typeof branding === "string"
      ? (() => {
          try {
            return JSON.parse(branding) as {
              primaryColor?: string;
              secondaryColor?: string;
              accentColor?: string;
            };
          } catch {
            return null;
          }
        })()
      : branding ?? null;

  const logoUrl = (req as typeof req & { file?: Express.Multer.File }).file
    ? `/uploads/${(req as typeof req & { file?: Express.Multer.File }).file?.filename ?? ""}`
    : undefined;

  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    {
      ...(name !== undefined ? { name } : {}),
      ...(timezone !== undefined ? { timezone } : {}),
      ...(currency !== undefined ? { currency } : {}),
      ...(parsedBranding
        ? {
            branding: {
              primaryColor: parsedBranding.primaryColor ?? "#0f172a",
              secondaryColor: parsedBranding.secondaryColor ?? "#64748b",
              accentColor: parsedBranding.accentColor ?? "#38bdf8"
            }
          }
        : {}),
      ...(logoUrl ? { logoUrl } : {})
    },
    { new: true }
  ).lean();

  if (!organization) {
    return sendResponse(res, 404, "Organization not found.", {});
  }

  await recordAuditLog({
    organizationId,
    userId: req.auth.userId,
    action: "organization_settings_updated",
    entityType: "organization",
    entityId: organizationId
  });

  return sendResponse(res, 200, "Organization settings updated successfully.", { organization });
});
