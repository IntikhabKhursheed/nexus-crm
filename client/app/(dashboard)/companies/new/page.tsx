"use client";

import { useRouter } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace-shell";
import { CompanyForm } from "@/components/company-form";
import { createCompany } from "@/lib/crm";

export default function NewCompanyPage() {
  const router = useRouter();

  return (
    <WorkspaceShell>
      <div className="mx-auto max-w-4xl rounded-[10px] border border-[#e8ecf0] bg-white p-6">
        <h2 className="text-2xl font-semibold text-[rgb(var(--nx-text-primary))]">Add company</h2>
        <p className="mt-2 text-sm text-[rgb(var(--nx-text-muted))]">Create a new company inside the active organization.</p>
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
