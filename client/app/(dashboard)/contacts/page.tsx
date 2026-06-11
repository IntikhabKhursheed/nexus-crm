"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Badge, PageHeader, Panel } from "@/components/ui/chrome";
import { deleteContact, listContacts, type Contact } from "@/lib/crm";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({
    q: "",
    name: "",
    email: "",
    company: "",
    tags: ""
  });
  const [error, setError] = useState("");
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { pushToast } = useToast();

  async function loadContacts(filters = query) {
    setLoading(true);
    setError("");

    try {
      const response = await listContacts(filters);
      setContacts(response.contacts);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load contacts.";
      setError(message);
      pushToast({ type: "error", title: "Contacts failed to load", description: message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete() {
    if (!contactToDelete) return;

    setDeleting(true);
    try {
      await deleteContact(contactToDelete._id);
      pushToast({ type: "success", title: "Contact deleted", description: contactToDelete.name });
      setContactToDelete(null);
      await loadContacts();
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Unable to delete contact.";
      setError(message);
      pushToast({ type: "error", title: "Delete failed", description: message });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Contacts"
          title="Contact management"
          description="Filter, edit, and enrich contacts with a cleaner workspace experience."
          actions={
            <Link
              href="/contacts/new"
              className="rounded-[8px] bg-[var(--nx-brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(99,102,241,0.18)] hover:bg-[var(--nx-brand-dark)]"
            >
              Add contact
            </Link>
          }
        />

        <Panel
          title="Search and filter"
          description="Use the filters below to narrow the list by keyword, company, or tags."
          actions={
            <>
              <Button variant="secondary" onClick={() => void loadContacts()}>
                Search
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const reset = { q: "", name: "", email: "", company: "", tags: "" };
                  setQuery(reset);
                  void loadContacts(reset);
                }}
              >
                Reset
              </Button>
            </>
          }
        >
          <div className="grid gap-3 md:grid-cols-5">
            {Object.entries(query).map(([key, value]) => (
              <Input
                key={key}
                placeholder={key.toUpperCase()}
                value={value}
                onChange={(event) => setQuery({ ...query, [key]: event.target.value })}
              />
            ))}
          </div>
        </Panel>

        {error && <ErrorState description={error} onRetry={() => void loadContacts()} />}

        <Panel className="overflow-hidden p-0">
          {loading ? (
            <LoadingState label="Loading contacts..." />
          ) : contacts.length === 0 ? (
            <EmptyState
              title="No contacts yet"
              description="Add your first contact to start tracking conversations, deals, and AI insights."
              actionLabel="Add contact"
              onAction={() => (window.location.href = "/contacts/new")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-muted/50 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Tags</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact._id} className="border-b border-border/60 odd:bg-card even:bg-muted/30 hover:bg-[rgb(var(--secondary)/0.06)]">
                      <td className="px-6 py-4">
                        <Link href={`/contacts/${contact._id}`} className="font-semibold hover:underline">
                          {contact.name}
                        </Link>
                        <p className="text-sm text-slate-500">{contact.role || "No role set"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{contact.email || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{contact.companyName || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {contact.tags.map((tag) => (
                            <Badge key={tag} tone="cyan">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/contacts/${contact._id}/edit`} className="text-sm font-semibold underline">
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setContactToDelete(contact)}
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
        </Panel>
        <Modal
          open={Boolean(contactToDelete)}
          title="Delete contact?"
          description={`This will permanently remove ${contactToDelete?.name ?? "this contact"} from the workspace.`}
          confirmLabel="Delete contact"
          loading={deleting}
          onCancel={() => setContactToDelete(null)}
          onConfirm={() => void handleDelete()}
        />
      </div>
    </WorkspaceShell>
  );
}
