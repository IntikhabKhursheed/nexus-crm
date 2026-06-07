"use client";

import { useRouter } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace-shell";
import { CompanyForm } from "@/components/company-form";
import { createCompany } from "@/lib/crm";

export default function NewCompanyPage() {
  const router = useRouter();

  return (
    <WorkspaceShell>
      <div className="glass-card mx-auto max-w-4xl rounded-3xl p-6">
        <h2 className="text-2xl font-semibold">Add company</h2>
        <p className="mt-2 text-sm text-slate-500">Create a new company inside the active organization.</p>
        <div className="mt-6">
          <CompanyForm
            submitLabel="Create company"
            onSubmit={async (payload) => {
              await createCompany(payload);
              router.push("/companies");
            }}
          />
        </div>
      </div>
    </WorkspaceShell>
  );
}
