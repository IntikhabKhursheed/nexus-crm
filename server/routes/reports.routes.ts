import { Router } from "express";
import {
  createSavedReport,
  deleteSavedReport,
  exportReportCsv,
  exportReportExcel,
  getSavedReport,
  listSavedReports,
  previewReport
} from "../controllers/reports.controller.js";

export const reportsRouter = Router();

reportsRouter.post("/preview", previewReport);
reportsRouter.post("/export/csv", exportReportCsv);
reportsRouter.post("/export/excel", exportReportExcel);
reportsRouter.get("/saved", listSavedReports);
reportsRouter.post("/saved", createSavedReport);
reportsRouter.get("/saved/:reportId", getSavedReport);
reportsRouter.delete("/saved/:reportId", deleteSavedReport);

