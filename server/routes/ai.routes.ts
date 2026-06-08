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

export const aiRouter = Router();

aiRouter.get("/insights", listAiInsights);
aiRouter.post("/contact-enrichment", enrichContactOrCompany);
aiRouter.post("/email-writer", writeAiEmail);
aiRouter.post("/deal-scoring", scoreDealWithAi);
aiRouter.post("/meeting-brief", generateMeetingBrief);
aiRouter.post("/revenue-forecast", generateRevenueForecast);
aiRouter.post("/weekly-digest", sendWeeklyDigest);
