import { Router } from "express";
import { getOrganizationSummary } from "../controllers/organization.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOrganizationMembership } from "../middleware/org.middleware.js";
import { crmRouter } from "./crm.routes.js";

export const organizationRouter = Router();

organizationRouter.use("/:orgId", requireAuth, requireOrganizationMembership);
organizationRouter.get("/:orgId/summary", getOrganizationSummary);
organizationRouter.use("/:orgId", crmRouter);
