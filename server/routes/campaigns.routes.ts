import { Router } from "express";
import {
  createCampaign,
  getCampaignStats,
  listCampaigns,
  previewCampaign,
  sendCampaign
} from "../controllers/campaigns.controller.js";

export const campaignsRouter = Router();

campaignsRouter.get("/", listCampaigns);
campaignsRouter.post("/", createCampaign);
campaignsRouter.post("/preview", previewCampaign);
campaignsRouter.post("/:campaignId/send", sendCampaign);
campaignsRouter.get("/:campaignId/stats", getCampaignStats);

