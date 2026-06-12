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
      <div className="mx-auto max-w-4xl rounded-[10px] border border-[#e8ecf0] bg-white p-6">
        <h2 className="text-2xl font-semibold text-[rgb(var(--nx-text-primary))]">Edit contact</h2>
        <p className="mt-2 text-sm text-[rgb(var(--nx-text-muted))]">Update contact details for the active organization.</p>
        <div className="mt-6">
          {loading || !initialValues ? (
            <p className="text-sm text-[rgb(var(--nx-text-muted))]">Loading contact...</p>
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
