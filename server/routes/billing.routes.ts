import { Router } from "express";
import {
  createBillingPortalSession,
  createCheckoutSession,
  listBillingPlans
} from "../controllers/billing.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOrganizationMembership } from "../middleware/org.middleware.js";

export const billingRouter = Router();

billingRouter.get("/plans", listBillingPlans);
billingRouter.post("/checkout", requireAuth, requireOrganizationMembership, createCheckoutSession);
billingRouter.post("/portal", requireAuth, requireOrganizationMembership, createBillingPortalSession);
