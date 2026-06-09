import * as XLSX from "xlsx";
import { Types } from "mongoose";
import { SavedReport } from "../models/SavedReport.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { loadReportRows, pickColumns, type ReportConfiguration } from "../services/report.service.js";
import { recordAuditLog } from "../services/audit.service.js";

function serializeCsv(rows: Record<string, unknown>[]) {
  const fields = rows.length > 0 ? Object.keys(rows[0]) : [];
  const escapeCsv = (value: unknown) => {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  return [
    fields.join(","),
    ...rows.map((row) => fields.map((field) => escapeCsv(row[field])).join(","))
  ].join("\n");
}

export const previewReport = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const configuration = req.body as ReportConfiguration;
  if (!configuration.entity) {
    return sendResponse(res, 400, "A report entity is required.", {});
  }

  const rows = await loadReportRows(req.organization.id, configuration);
  const selectedRows = pickColumns(rows, configuration.columns ?? []);

  return sendResponse(res, 200, "Report preview generated successfully.", {
    rows: selectedRows,
    count: selectedRows.length
  });
});

export const exportReportCsv = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const configuration = req.body as ReportConfiguration;
  const rows = pickColumns(await loadReportRows(req.organization.id, configuration), configuration.columns ?? []);
  const csv = serializeCsv(rows);

  return res
    .status(200)
    .set({
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=report.csv`
    })
    .send(csv);
});

export const exportReportExcel = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const configuration = req.body as ReportConfiguration;
  const rows = pickColumns(await loadReportRows(req.organization.id, configuration), configuration.columns ?? []);
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, "Report");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return res
    .status(200)
    .set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=report.xlsx`
    })
    .send(buffer);
});

export const listSavedReports = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const savedReports = await SavedReport.find({ organizationId: req.organization.id }).sort({ createdAt: -1 }).lean();
  return sendResponse(res, 200, "Saved reports loaded successfully.", { savedReports });
});

export const createSavedReport = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { name, configuration } = req.body as {
    name?: string;
    configuration?: ReportConfiguration;
  };

  if (!name || !configuration?.entity) {
    return sendResponse(res, 400, "Report name and configuration are required.", {});
  }

  const savedReport = await SavedReport.create({
    organizationId: req.organization.id,
    userId: req.auth.userId,
    name,
    configuration
  });

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth.userId,
    action: "saved_report_created",
    entityType: "saved_report",
    entityId: String(savedReport._id)
  });

  return sendResponse(res, 201, "Saved report created successfully.", { savedReport });
});

export const getSavedReport = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const reportId = String(req.params.reportId);
  if (!Types.ObjectId.isValid(reportId)) {
    return sendResponse(res, 400, "A valid report id is required.", {});
  }

  const savedReport = await SavedReport.findOne({ _id: reportId, organizationId: req.organization.id }).lean();
  if (!savedReport) {
    return sendResponse(res, 404, "Saved report not found.", {});
  }

  return sendResponse(res, 200, "Saved report loaded successfully.", { savedReport });
});

export const deleteSavedReport = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const reportId = String(req.params.reportId);
  if (!Types.ObjectId.isValid(reportId)) {
    return sendResponse(res, 400, "A valid report id is required.", {});
  }

  const savedReport = await SavedReport.findOneAndDelete({ _id: reportId, organizationId: req.organization.id });
  if (!savedReport) {
    return sendResponse(res, 404, "Saved report not found.", {});
  }

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth.userId,
    action: "saved_report_deleted",
    entityType: "saved_report",
    entityId: String(savedReport._id)
  });

  return sendResponse(res, 200, "Saved report deleted successfully.", {});
});
