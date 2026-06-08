"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace-shell";
import { ContactForm } from "@/components/contact-form";
import { getContact, updateContact, type ContactPayload } from "@/lib/crm";

export default function EditContactPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<ContactPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const contactId = params.id;

  useEffect(() => {
    async function load() {
      const response = await getContact(contactId);
      const contact = response.contact;
      setInitialValues({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        linkedin: contact.linkedin,
        role: contact.role,
        tags: contact.tags.join(", "),
        companyId: contact.companyId ?? "",
        notes: contact.notes
      });
      setLoading(false);
    }

    void load();
  }, [contactId]);

  return (
    <WorkspaceShell>
      <div className="glass-card mx-auto max-w-4xl rounded-3xl p-6">
        <h2 className="text-2xl font-semibold">Edit contact</h2>
        <p className="mt-2 text-sm text-slate-500">Update contact details for the active organization.</p>
        <div className="mt-6">
          {loading || !initialValues ? (
            <p className="text-sm text-slate-500">Loading contact...</p>
          ) : (
            <ContactForm
              initialValues={initialValues}
              submitLabel="Save changes"
              onSubmit={async (payload) => {
                await updateContact(contactId, payload);
                router.push(`/contacts/${contactId}`);
              }}
            />
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
