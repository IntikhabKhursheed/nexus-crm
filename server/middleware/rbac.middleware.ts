import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/apiResponse.js";

export type OrganizationRole = "owner" | "admin" | "sales_manager" | "sales_representative";

export function requireOrganizationRole(allowedRoles: OrganizationRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.organization) {
      return sendResponse(res, 400, "Organization context is missing.", {});
    }

    if (!allowedRoles.includes(req.organization.role as OrganizationRole)) {
      return sendResponse(res, 403, "You do not have permission to access this resource.", {});
    }

    return next();
  };
}

export function requireOrganizationAdmin(req: Request, res: Response, next: NextFunction) {
  return requireOrganizationRole(["owner", "admin"])(req, res, next);
}

