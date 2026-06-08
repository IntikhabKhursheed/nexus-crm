"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { deleteCompany, listCompanies, type Company } from "@/lib/crm";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCompanies() {
    setLoading(true);
    setError("");

    try {
      const response = await listCompanies();
      setCompanies(response.companies);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load companies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCompanies();
  }, []);

  async function handleDelete(companyId: string) {
    if (!window.confirm("Delete this company?")) return;
    await deleteCompany(companyId);
    await loadCompanies();
  }

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Companies</p>
            <h2 className="mt-2 text-3xl font-semibold">Company management</h2>
          </div>
          <Link
            href="/companies/new"
            className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-slate-100 dark:text-slate-950"
          >
            Add company
          </Link>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="glass-card overflow-hidden rounded-3xl">
          {loading ? (
            <div className="p-8 text-sm text-slate-500">Loading companies...</div>
          ) : companies.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">No companies yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-border text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Industry</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Contacts</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company._id} className="border-b border-border/70">
                      <td className="px-6 py-4">
                        <Link href={`/companies/${company._id}`} className="font-semibold hover:underline">
                          {company.name}
                        </Link>
                        <p className="text-sm text-slate-500">{company.website || "-"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{company.industry || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{company.location || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{company.contactCount ?? 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/companies/${company._id}/edit`} className="text-sm font-semibold underline">
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleDelete(company._id)}
                            className="text-sm font-semibold text-red-500 underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
