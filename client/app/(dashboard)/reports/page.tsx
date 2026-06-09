"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
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
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Reports</p>
          <h2 className="mt-2 text-3xl font-semibold">Custom report builder</h2>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {previewError && <p className="text-sm text-red-500">{previewError}</p>}

        <section className="glass-card rounded-3xl p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <select className="rounded-2xl border border-border bg-card px-4 py-3 outline-none" value={configuration.entity} onChange={(event) => setConfiguration({ ...configuration, entity: event.target.value as ReportConfiguration["entity"] })}>
              <option value="contacts">Contacts</option>
              <option value="companies">Companies</option>
              <option value="deals">Deals</option>
              <option value="activities">Activities</option>
            </select>
            <input className="rounded-2xl border border-border bg-card px-4 py-3 outline-none" placeholder="Columns, comma separated" value={configuration.columns.join(",")} onChange={(event) => setConfiguration({ ...configuration, columns: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
            <textarea className="min-h-24 rounded-2xl border border-border bg-card px-4 py-3 font-mono text-sm outline-none md:col-span-2" placeholder='Filters JSON, e.g. {"stage":"Won"}' value={filtersText} onChange={(event) => setFiltersText(event.target.value)} />
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button onClick={() => void handlePreview()} className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white">Preview</button>
              <button onClick={() => void handleExportCsv()} className="rounded-2xl border border-border bg-card px-5 py-3 font-semibold">Export CSV</button>
              <button onClick={() => void handleExportExcel()} className="rounded-2xl border border-border bg-card px-5 py-3 font-semibold">Export Excel</button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <input className="rounded-2xl border border-border bg-card px-4 py-3 outline-none" placeholder="Saved report name" value={reportName} onChange={(event) => setReportName(event.target.value)} />
            <button onClick={() => void handleSave()} className="rounded-2xl border border-border bg-card px-5 py-3 font-semibold">Save report</button>
          </div>
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h3 className="text-xl font-semibold">Preview</h3>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4 text-xs text-slate-500">{JSON.stringify(rows, null, 2)}</pre>
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h3 className="text-xl font-semibold">Saved reports</h3>
          <div className="mt-4 space-y-3">
            {savedReports.map((report) => (
              <div key={report._id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                <p className="font-semibold">{report.name}</p>
                <button onClick={() => void deleteSavedReport(report._id).then(loadSavedReports)} className="text-sm font-semibold text-red-500 underline">
                  Delete
                </button>
              </div>
            ))}
            {savedReports.length === 0 && <p className="text-sm text-slate-500">No saved reports yet.</p>}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
