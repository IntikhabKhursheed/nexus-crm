import { Router } from "express";
import { getOrganizationSummary } from "../controllers/organization.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOrganizationMembership } from "../middleware/org.middleware.js";
import { aiRouter } from "./ai.routes.js";
import { crmRouter } from "./crm.routes.js";
import { notificationsRouter } from "./notifications.routes.js";
import { teamRouter } from "./team.routes.js";
import { campaignsRouter } from "./campaigns.routes.js";
import { reportsRouter } from "./reports.routes.js";
import { analyticsRouter } from "./analytics.routes.js";
import { settingsRouter } from "./settings.routes.js";
import { auditRouter } from "./audit.routes.js";
import { requireOrganizationAdmin, requireOrganizationRole } from "../middleware/rbac.middleware.js";

export const organizationRouter = Router();

organizationRouter.use("/:orgId", requireAuth, requireOrganizationMembership);
organizationRouter.get("/:orgId/summary", getOrganizationSummary);
organizationRouter.use("/:orgId/ai", aiRouter);
organizationRouter.use("/:orgId", crmRouter);
organizationRouter.use("/:orgId/notifications", notificationsRouter);
organizationRouter.use("/:orgId/reports", reportsRouter);
organizationRouter.use("/:orgId/analytics", analyticsRouter);
organizationRouter.use("/:orgId/campaigns", requireOrganizationRole(["owner", "admin", "sales_manager"]), campaignsRouter);
organizationRouter.use("/:orgId/team", requireOrganizationAdmin, teamRouter);
organizationRouter.use("/:orgId/settings", requireOrganizationAdmin, settingsRouter);
organizationRouter.use("/:orgId/audit-logs", requireOrganizationAdmin, auditRouter);
