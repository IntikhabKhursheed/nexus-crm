import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(process.cwd(), "..", "..", ".env") });
}

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required("MONGODB_URI", process.env.MONGODB_URL),
  clientOrigin: required("CLIENT_ORIGIN", "http://localhost:3000"),
  grokApiKey: process.env.GROK_API_KEY ?? process.env.XAI_API_KEY ?? "",
  grokBaseUrl: process.env.GROK_BASE_URL ?? "https://api.x.ai/v1",
  grokModel: process.env.GROK_MODEL ?? "llama-3.3-70b-versatile",
  aiRequestTimeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 60000),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "nexuscrm-dev-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "nexuscrm-dev-refresh-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "sk_test_nexuscrm_dev",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripeFreePriceId: process.env.STRIPE_FREE_PRICE_ID ?? "",
  stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
  stripeEnterprisePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
  gmailUser: process.env.GMAIL_USER ?? "",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD ?? "",
  weeklyDigestFrom: process.env.WEEKLY_DIGEST_FROM ?? process.env.GMAIL_USER ?? ""
};
