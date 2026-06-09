import { api } from "./api";
import { orgPath } from "./org";

export type ReportConfiguration = {
  entity: "contacts" | "companies" | "deals" | "activities";
  columns: string[];
  filters?: Record<string, unknown>;
  dateRange?: {
    from?: string;
    to?: string;
  };
};

export async function previewReport(configuration: ReportConfiguration) {
  const response = await api.post(orgPath("/reports/preview"), configuration);
  return response.data.data as { rows: Record<string, unknown>[]; count: number };
}

export async function exportReportCsv(configuration: ReportConfiguration) {
  const response = await api.post(orgPath("/reports/export/csv"), configuration, { responseType: "blob" });
  return response.data as Blob;
}

export async function exportReportExcel(configuration: ReportConfiguration) {
  const response = await api.post(orgPath("/reports/export/excel"), configuration, { responseType: "blob" });
  return response.data as Blob;
}

export async function listSavedReports() {
  const response = await api.get(orgPath("/reports/saved"));
  return response.data.data as { savedReports: Array<{ _id: string; name: string; configuration: ReportConfiguration }> };
}

export async function createSavedReport(payload: { name: string; configuration: ReportConfiguration }) {
  const response = await api.post(orgPath("/reports/saved"), payload);
  return response.data.data as { savedReport: { _id: string } };
}

export async function deleteSavedReport(reportId: string) {
  const response = await api.delete(orgPath(`/reports/saved/${reportId}`));
  return response.data.data as Record<string, never>;
}

