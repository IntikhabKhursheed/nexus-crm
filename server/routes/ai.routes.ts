import { Router } from "express";
import {
  enrichContactOrCompany,
  generateMeetingBrief,
  generateRevenueForecast,
  listAiInsights,
  scoreDealWithAi,
  sendWeeklyDigest,
  writeAiEmail
} from "../controllers/ai.controller.js";
import { aiRateLimit } from "../middleware/security.middleware.js";

export const aiRouter = Router();

aiRouter.get("/insights", aiRateLimit, listAiInsights);
aiRouter.post("/contact-enrichment", aiRateLimit, enrichContactOrCompany);
aiRouter.post("/email-writer", aiRateLimit, writeAiEmail);
aiRouter.post("/deal-scoring", aiRateLimit, scoreDealWithAi);
aiRouter.post("/meeting-brief", aiRateLimit, generateMeetingBrief);
aiRouter.post("/revenue-forecast", aiRateLimit, generateRevenueForecast);
aiRouter.post("/weekly-digest", aiRateLimit, sendWeeklyDigest);
