"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace-shell";
import { CompanyForm } from "@/components/company-form";
import { getCompany, updateCompany, type CompanyPayload } from "@/lib/crm";

export default function EditCompanyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<CompanyPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const companyId = params.id;

  useEffect(() => {
    async function load() {
      const response = await getCompany(companyId);
      const company = response.company;
      setInitialValues({
        name: company.name,
        website: company.website,
        industry: company.industry,
        size: company.size,
        location: company.location,
        notes: company.notes
      });
      setLoading(false);
    }

    void load();
  }, [companyId]);

  return (
    <WorkspaceShell>
      <div className="glass-card mx-auto max-w-4xl rounded-3xl p-6">
        <h2 className="text-2xl font-semibold">Edit company</h2>
        <p className="mt-2 text-sm text-slate-500">Update company details for the active organization.</p>
        <div className="mt-6">
          {loading || !initialValues ? (
            <p className="text-sm text-slate-500">Loading company...</p>
          ) : (
            <CompanyForm
              initialValues={initialValues}
              submitLabel="Save changes"
              onSubmit={async (payload) => {
                await updateCompany(companyId, payload);
                router.push(`/companies/${companyId}`);
              }}
            />
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
