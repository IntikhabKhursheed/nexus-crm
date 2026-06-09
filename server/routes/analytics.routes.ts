import { Router } from "express";
import { getAnalyticsDashboard } from "../controllers/analytics.controller.js";

export const analyticsRouter = Router();

analyticsRouter.get("/", getAnalyticsDashboard);

