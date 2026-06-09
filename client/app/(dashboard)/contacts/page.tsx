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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Contacts</p>
            <h2 className="mt-2 text-3xl font-semibold">Contact management</h2>
          </div>
          <Link
            href="/contacts/new"
            className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:opacity-90 dark:bg-slate-100 dark:text-slate-950"
          >
            Add contact
          </Link>
        </div>

        <Card className="p-4">
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
          <div className="mt-4 flex gap-3">
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
          </div>
        </Card>

        {error && <ErrorState description={error} onRetry={() => void loadContacts()} />}

        <Card className="overflow-hidden p-0">
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
                <thead className="border-b border-border text-xs uppercase tracking-[0.2em] text-slate-500">
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
                    <tr key={contact._id} className="border-b border-border/70">
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
                            <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-slate-500">
                              {tag}
                            </span>
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
        </Card>
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
