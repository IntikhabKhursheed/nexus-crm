import { Router } from "express";
import { acceptTeamInvitation, trackCampaignOpen } from "../controllers/public.controller.js";

export const publicRouter = Router();

publicRouter.post("/organizations/:orgId/team/invitations/:token/accept", acceptTeamInvitation);
publicRouter.get("/organizations/:orgId/campaigns/:campaignId/track/:token.gif", trackCampaignOpen);

