import { Types } from "mongoose";
import { env } from "../config/env.js";
import { stripe } from "../config/stripe.js";
import { billingPlans, type BillingPlanKey } from "../constants/plans.js";
import { Organization } from "../models/Organization.js";
import { Subscription } from "../models/Subscription.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

function resolvePriceId(plan: BillingPlanKey) {
  if (plan === "free") return "";
  const planConfig = billingPlans[plan];
  return process.env[planConfig.priceIdEnv] ?? "";
}

export const listBillingPlans = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, "Billing plans loaded successfully.", {
    plans: Object.values(billingPlans).map((plan) => ({
      key: plan.key,
      name: plan.name,
      description: plan.description,
      priceId: plan.key === "free" ? "" : resolvePriceId(plan.key as BillingPlanKey)
    }))
  });
});

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { organizationId, plan } = req.body as {
    organizationId?: string;
    plan?: BillingPlanKey;
  };

  if (!organizationId || !Types.ObjectId.isValid(organizationId)) {
    return sendResponse(res, 400, "A valid organization id is required.", {});
  }

  if (!plan || !["free", "pro", "enterprise"].includes(plan)) {
    return sendResponse(res, 400, "A valid billing plan is required.", {});
  }

  if (plan === "free") {
    await Organization.findByIdAndUpdate(organizationId, {
      billingPlan: "free",
      billingStatus: "active"
    });

    await Subscription.findOneAndUpdate(
      { organizationId },
      {
        organizationId,
        plan: "free",
        status: "active"
      },
      { upsert: true, new: true }
    );

    return sendResponse(res, 200, "Free plan activated.", {
      redirectUrl: null
    });
  }

  const priceId = resolvePriceId(plan);

  if (!priceId) {
    return sendResponse(res, 500, `Stripe price id is missing for ${plan}.`, {});
  }

  const organization = await Organization.findById(organizationId).lean();

  if (!organization) {
    return sendResponse(res, 404, "Organization not found.", {});
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.clientOrigin}/billing?success=1`,
    cancel_url: `${env.clientOrigin}/billing?canceled=1`,
    metadata: {
      organizationId: String(organization._id),
      plan
    }
  });

  return sendResponse(res, 200, "Checkout session created successfully.", {
    redirectUrl: session.url
  });
});

export const createBillingPortalSession = asyncHandler(async (req, res) => {
  const { organizationId } = req.body as { organizationId?: string };

  if (!organizationId || !Types.ObjectId.isValid(organizationId)) {
    return sendResponse(res, 400, "A valid organization id is required.", {});
  }

  const organization = await Organization.findById(organizationId).lean();

  if (!organization?.stripeCustomerId) {
    return sendResponse(res, 400, "Billing portal requires an active Stripe customer.", {});
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: organization.stripeCustomerId,
    return_url: `${env.clientOrigin}/billing`
  });

  return sendResponse(res, 200, "Billing portal created successfully.", {
    redirectUrl: portalSession.url
  });
});
