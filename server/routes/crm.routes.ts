import { Router } from "express";
import {
  createActivity,
  listActivities
} from "../controllers/activity.controller.js";
import {
  createCompany,
  deleteCompany,
  getCompany,
  listCompanies,
  updateCompany
} from "../controllers/company.controller.js";
import {
  createContact,
  createContactActivity,
  deleteContact,
  getContact,
  listContactActivities,
  listContacts,
  updateContact
} from "../controllers/contact.controller.js";
import { createDeal, deleteDeal, listDeals, updateDeal, updateDealStage } from "../controllers/deal.controller.js";

export const crmRouter = Router();

crmRouter.get("/contacts", listContacts);
crmRouter.post("/contacts", createContact);
crmRouter.get("/contacts/:contactId", getContact);
crmRouter.put("/contacts/:contactId", updateContact);
crmRouter.delete("/contacts/:contactId", deleteContact);
crmRouter.get("/contacts/:contactId/activities", listContactActivities);
crmRouter.post("/contacts/:contactId/activities", createContactActivity);

crmRouter.get("/companies", listCompanies);
crmRouter.post("/companies", createCompany);
crmRouter.get("/companies/:companyId", getCompany);
crmRouter.put("/companies/:companyId", updateCompany);
crmRouter.delete("/companies/:companyId", deleteCompany);

crmRouter.get("/deals", listDeals);
crmRouter.post("/deals", createDeal);
crmRouter.put("/deals/:dealId", updateDeal);
crmRouter.patch("/deals/:dealId/stage", updateDealStage);
crmRouter.delete("/deals/:dealId", deleteDeal);

crmRouter.get("/activities", listActivities);
crmRouter.post("/activities", createActivity);
