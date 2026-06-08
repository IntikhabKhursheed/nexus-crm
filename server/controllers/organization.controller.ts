import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { Membership } from "../models/Membership.js";
import { Organization } from "../models/Organization.js";

export const getOrganizationSummary = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const [memberships, organization] = await Promise.all([
    Membership.countDocuments({ organizationId: req.organization.id, status: "active" }),
    Organization.findById(req.organization.id).lean()
  ]);

  if (!organization) {
    return sendResponse(res, 404, "Organization not found.", {});
  }

  return sendResponse(res, 200, "Organization summary loaded successfully.", {
    organization: {
      id: String(organization._id),
      name: organization.name,
      slug: organization.slug,
      billingPlan: organization.billingPlan,
      billingStatus: organization.billingStatus
    },
    members: memberships
  });
});
