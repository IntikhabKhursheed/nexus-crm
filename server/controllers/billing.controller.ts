import { Types } from "mongoose";
import Stripe from "stripe";
import { env } from "../config/env.js";
import { stripe } from "../config/stripe.js";
import { billingPlans, type BillingPlanKey } from "../constants/plans.js";
import { Organization } from "../models/Organization.js";
import { Subscription } from "../models/Subscription.js";
import { recordAuditLog } from "../services/audit.service.js";
import { createOrganizationNotifications } from "../services/notification.service.js";
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

    await createOrganizationNotifications({
      organizationId,
      type: "subscription_upgraded",
      title: "Subscription updated",
      message: "The organization has been moved to the free plan.",
      metadata: { plan: "free" }
    });

    if (req.auth?.userId) {
      await recordAuditLog({
        organizationId,
        userId: req.auth.userId,
        action: "subscription_changed",
        entityType: "subscription",
        entityId: organizationId,
        metadata: { plan: "free" }
      });
    }

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
      plan,
      userId: req.auth?.userId ?? ""
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

export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!signature || Array.isArray(signature)) {
    return sendResponse(res, 400, "Stripe signature is required.", {});
  }

  if (!env.stripeWebhookSecret) {
    return sendResponse(res, 500, "Stripe webhook secret is not configured.", {});
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (error) {
    return sendResponse(res, 400, error instanceof Error ? error.message : "Invalid Stripe webhook.", {});
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const organizationId = String(session.metadata?.organizationId ?? "");
    const plan = String(session.metadata?.plan ?? "");

    if (organizationId && Types.ObjectId.isValid(organizationId) && plan) {
      await Organization.findByIdAndUpdate(organizationId, {
        billingPlan: plan,
        billingStatus: "active",
        stripeCustomerId: typeof session.customer === "string" ? session.customer : "",
        stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : ""
      });

      await Subscription.findOneAndUpdate(
        { organizationId },
        {
          organizationId,
          plan,
          status: "active",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : "",
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : ""
        },
        { upsert: true, new: true }
      );

      await createOrganizationNotifications({
        organizationId,
        type: "subscription_upgraded",
        title: "Subscription upgraded",
        message: `The organization subscription has been upgraded to ${plan}.`,
        metadata: { plan }
      });

      const actorUserId = String(session.metadata?.userId ?? "");
      if (actorUserId) {
        await recordAuditLog({
          organizationId,
          userId: actorUserId,
          action: "subscription_upgraded",
          entityType: "subscription",
          entityId: String(session.subscription ?? ""),
          metadata: { plan }
        });
      }
    }
  }

  return res.status(200).json({
    success: true,
    message: "Webhook processed successfully.",
    data: {}
  });
});
