import { Router } from "express";
import {
  inviteTeamMember,
  listTeamMembers,
  removeTeamMember,
  suspendTeamMember,
  updateTeamMemberRole
} from "../controllers/team.controller.js";

export const teamRouter = Router();

teamRouter.get("/", listTeamMembers);
teamRouter.post("/invite", inviteTeamMember);
teamRouter.patch("/members/:memberId/role", updateTeamMemberRole);
teamRouter.patch("/members/:memberId/suspend", suspendTeamMember);
teamRouter.delete("/members/:memberId", removeTeamMember);

