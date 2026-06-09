"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { deleteCompany, listCompanies, type Company } from "@/lib/crm";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { pushToast } = useToast();

  async function loadCompanies() {
    setLoading(true);
    setError("");

    try {
      const response = await listCompanies();
      setCompanies(response.companies);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load companies.";
      setError(message);
      pushToast({ type: "error", title: "Companies failed to load", description: message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCompanies();
  }, []);

  async function handleDelete() {
    if (!companyToDelete) return;

    setDeleting(true);
    try {
      await deleteCompany(companyToDelete._id);
      pushToast({ type: "success", title: "Company deleted", description: companyToDelete.name });
      setCompanyToDelete(null);
      await loadCompanies();
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Unable to delete company.";
      setError(message);
      pushToast({ type: "error", title: "Delete failed", description: message });
    } finally {
      setDeleting(false);
    }
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

        {error && <ErrorState description={error} onRetry={() => void loadCompanies()} />}

        <Card className="overflow-hidden p-0">
          {loading ? (
            <LoadingState label="Loading companies..." />
          ) : companies.length === 0 ? (
            <EmptyState
              title="No companies yet"
              description="Create a company to anchor contacts, deals, and reporting."
              actionLabel="Add company"
              onAction={() => (window.location.href = "/companies/new")}
            />
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
                            onClick={() => setCompanyToDelete(company)}
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
        </Card>
        <Modal
          open={Boolean(companyToDelete)}
          title="Delete company?"
          description={`This will permanently remove ${companyToDelete?.name ?? "this company"} from the workspace.`}
          confirmLabel="Delete company"
          loading={deleting}
          onCancel={() => setCompanyToDelete(null)}
          onConfirm={() => void handleDelete()}
        />
      </div>
    </WorkspaceShell>
  );
}
