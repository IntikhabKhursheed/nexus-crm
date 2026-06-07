import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { Membership } from "../models/Membership.js";
import { Organization } from "../models/Organization.js";
import { sendResponse } from "../utils/apiResponse.js";

declare global {
  namespace Express {
    interface Request {
      organization?: {
        id: string;
        name: string;
        slug: string;
        plan: string;
        role: string;
      };
    }
  }
}

function resolveOrganizationId(req: Request) {
  return (
    req.params.orgId ||
    req.params.organizationId ||
    (req.body as { organizationId?: string } | undefined)?.organizationId ||
    req.headers["x-organization-id"]?.toString() ||
    req.query.organizationId?.toString() ||
    ""
  );
}

export async function requireOrganizationMembership(req: Request, res: Response, next: NextFunction) {
  if (!req.auth?.userId) {
    return sendResponse(res, 401, "Authentication is required.", {});
  }

  const organizationId = resolveOrganizationId(req);

  if (!Types.ObjectId.isValid(organizationId)) {
    return sendResponse(res, 400, "A valid organization id is required.", {});
  }

  const membership = await Membership.findOne({
    userId: req.auth.userId,
    organizationId,
    status: "active"
  }).lean();

  if (!membership) {
    return sendResponse(res, 403, "You do not belong to this organization.", {});
  }

  const organization = await Organization.findById(organizationId).lean();

  if (!organization) {
    return sendResponse(res, 404, "Organization not found.", {});
  }

  req.organization = {
    id: String(organization._id),
    name: organization.name,
    slug: organization.slug,
    plan: organization.billingPlan,
    role: membership.role
  };

  return next();
}
