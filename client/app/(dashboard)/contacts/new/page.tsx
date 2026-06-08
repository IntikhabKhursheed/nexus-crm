"use client";

import { useRouter } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace-shell";
import { ContactForm } from "@/components/contact-form";
import { createContact } from "@/lib/crm";

export default function NewContactPage() {
  const router = useRouter();

  return (
    <WorkspaceShell>
      <div className="glass-card mx-auto max-w-4xl rounded-3xl p-6">
        <h2 className="text-2xl font-semibold">Add contact</h2>
        <p className="mt-2 text-sm text-slate-500">Create a new contact inside the active organization.</p>
        <div className="mt-6">
          <ContactForm
            submitLabel="Create contact"
            onSubmit={async (payload) => {
              await createContact(payload);
              router.push("/contacts");
            }}
          />
        </div>
      </div>
    </WorkspaceShell>
  );
}
