import dotenv from "dotenv";

dotenv.config({ path: ".env" });

function required(name: string, devFallback?: string) {
  const value = process.env[name] ?? devFallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required("MONGODB_URI"),
  clientOrigin: required("CLIENT_ORIGIN", "http://localhost:3000"),
  clientOrigins: (process.env.CLIENT_ORIGINS ?? process.env.CLIENT_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  groqApiKey: process.env.GROQ_API_KEY ?? process.env.GROK_API ?? process.env.GROK_API_KEY ?? process.env.XAI_API_KEY ?? "",
  groqBaseUrl: process.env.GROQ_BASE_URL ?? process.env.GROK_BASE_URL ?? "https://api.groq.com/openai/v1",
  groqModel: process.env.GROQ_MODEL ?? process.env.GROK_MODEL ?? "llama-3.3-70b-versatile",
  aiRequestTimeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 60000),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  stripeSecretKey: required("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripeFreePriceId: process.env.STRIPE_FREE_PRICE_ID ?? "",
  stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
  stripeEnterprisePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
  gmailUser: process.env.GMAIL_USER ?? "",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD ?? "",
  weeklyDigestFrom: process.env.WEEKLY_DIGEST_FROM ?? process.env.GMAIL_USER ?? ""
};
