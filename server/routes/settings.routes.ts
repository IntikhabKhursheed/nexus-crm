import { Router } from "express";
import { getOrganizationSettings, updateOrganizationSettings } from "../controllers/settings.controller.js";
import { upload } from "../middleware/upload.middleware.js";

export const settingsRouter = Router();

settingsRouter.get("/", getOrganizationSettings);
settingsRouter.patch("/", upload.single("logo"), updateOrganizationSettings);

