"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/ui/chrome";
import {
  createSavedReport,
  deleteSavedReport,
  exportReportCsv,
  exportReportExcel,
  listSavedReports,
  previewReport,
  type ReportConfiguration
} from "@/lib/reports";

const defaultConfig: ReportConfiguration = {
  entity: "contacts",
  columns: ["name", "email", "companyName"],
  filters: {}
};

export default function ReportsPage() {
  const [configuration, setConfiguration] = useState<ReportConfiguration>(defaultConfig);
  const [savedReports, setSavedReports] = useState<Array<{ _id: string; name: string }>>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [reportName, setReportName] = useState("My report");
  const [error, setError] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [filtersText, setFiltersText] = useState(JSON.stringify(defaultConfig.filters ?? {}));

  function buildConfiguration(): ReportConfiguration {
    return {
      ...configuration,
      filters: JSON.parse(filtersText || "{}")
    };
  }

  async function loadSavedReports() {
    const response = await listSavedReports();
    setSavedReports(response.savedReports);
  }

  useEffect(() => {
    void loadSavedReports();
  }, []);

  async function handlePreview() {
    try {
      setPreviewError("");
      const response = await previewReport(buildConfiguration());
      setRows(response.rows);
    } catch (previewFailure) {
      setPreviewError(previewFailure instanceof Error ? previewFailure.message : "Unable to preview report.");
    }
  }

  async function handleSave() {
    try {
      await createSavedReport({ name: reportName, configuration: buildConfiguration() });
      await loadSavedReports();
    } catch (saveFailure) {
      setPreviewError(saveFailure instanceof Error ? saveFailure.message : "Unable to save report.");
    }
  }

  async function handleExportCsv() {
    try {
      const blob = await exportReportCsv(buildConfiguration());
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (exportFailure) {
      setPreviewError(exportFailure instanceof Error ? exportFailure.message : "Unable to export CSV.");
    }
  }

  async function handleExportExcel() {
    try {
      const blob = await exportReportExcel(buildConfiguration());
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (exportFailure) {
      setPreviewError(exportFailure instanceof Error ? exportFailure.message : "Unable to export Excel.");
    }
  }

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Reports"
          title="Custom report builder"
          description="Preview, save, and export custom report configurations with a more polished workspace."
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {previewError && <p className="text-sm text-red-500">{previewError}</p>}

        <Panel title="Builder" description="Configure the report, preview rows, and export the output you need.">
          <div className="grid gap-4 md:grid-cols-2">
            <select className="rounded-lg border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 outline-none" value={configuration.entity} onChange={(event) => setConfiguration({ ...configuration, entity: event.target.value as ReportConfiguration["entity"] })}>
              <option value="contacts">Contacts</option>
              <option value="companies">Companies</option>
              <option value="deals">Deals</option>
              <option value="activities">Activities</option>
            </select>
            <input className="rounded-lg border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 outline-none" placeholder="Columns, comma separated" value={configuration.columns.join(",")} onChange={(event) => setConfiguration({ ...configuration, columns: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
            <textarea className="min-h-24 rounded-lg border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 font-mono text-sm outline-none md:col-span-2" placeholder='Filters JSON, e.g. {"stage":"Won"}' value={filtersText} onChange={(event) => setFiltersText(event.target.value)} />
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Button onClick={() => void handlePreview()}>Preview</Button>
              <Button variant="secondary" onClick={() => void handleExportCsv()}>Export CSV</Button>
              <Button variant="secondary" onClick={() => void handleExportExcel()}>Export Excel</Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <input className="rounded-lg border border-[#e2e8f0] bg-[#fafafa] px-4 py-3 outline-none" placeholder="Saved report name" value={reportName} onChange={(event) => setReportName(event.target.value)} />
            <Button variant="secondary" onClick={() => void handleSave()}>Save report</Button>
          </div>
        </Panel>

        <Panel title="Preview" description="Rows returned by the current configuration.">
          <pre className="mt-4 overflow-x-auto rounded-[10px] border border-[#e8ecf0] bg-white p-4 text-xs text-[rgb(var(--nx-text-muted))]">{JSON.stringify(rows, null, 2)}</pre>
        </Panel>

        <Panel title="Saved reports" description="Re-use report configurations without rebuilding them.">
          <div className="mt-4 space-y-3">
            {savedReports.map((report) => (
              <div key={report._id} className="flex items-center justify-between rounded-[10px] border border-[#e8ecf0] bg-white p-4">
                <p className="font-semibold text-[rgb(var(--nx-text-primary))]">{report.name}</p>
                <button onClick={() => void deleteSavedReport(report._id).then(loadSavedReports)} className="text-sm font-semibold text-red-500 underline">
                  Delete
                </button>
              </div>
            ))}
            {savedReports.length === 0 && <p className="text-sm text-[rgb(var(--nx-text-muted))]">No saved reports yet.</p>}
          </div>
        </Panel>
      </div>
    </WorkspaceShell>
  );
}
