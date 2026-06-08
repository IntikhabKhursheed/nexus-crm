export const billingPlans = {
  free: {
    key: "free",
    name: "Free",
    description: "Start for free with core CRM tools.",
    priceIdEnv: ""
  },
  pro: {
    key: "pro",
    name: "Pro",
    description: "Advanced automation for growing sales teams.",
    priceIdEnv: "STRIPE_PRO_PRICE_ID"
  },
  enterprise: {
    key: "enterprise",
    name: "Enterprise",
    description: "Custom security, governance, and support.",
    priceIdEnv: "STRIPE_ENTERPRISE_PRICE_ID"
  }
} as const;

export type BillingPlanKey = keyof typeof billingPlans;
