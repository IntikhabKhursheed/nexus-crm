import { Router } from "express";
import { getOrganizationSummary } from "../controllers/organization.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOrganizationMembership } from "../middleware/org.middleware.js";

export const organizationRouter = Router();

organizationRouter.get(
  "/:orgId/summary",
  requireAuth,
  requireOrganizationMembership,
  getOrganizationSummary
);
