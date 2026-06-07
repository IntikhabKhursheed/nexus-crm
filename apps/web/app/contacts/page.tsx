"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
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

  async function loadContacts(filters = query) {
    setLoading(true);
    setError("");

    try {
      const response = await listContacts(filters);
      setContacts(response.contacts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load contacts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(contactId: string) {
    if (!window.confirm("Delete this contact?")) return;
    await deleteContact(contactId);
    await loadContacts();
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

        <div className="glass-card rounded-3xl p-4">
          <div className="grid gap-3 md:grid-cols-5">
            {Object.entries(query).map(([key, value]) => (
              <input
                key={key}
                placeholder={key.toUpperCase()}
                value={value}
                onChange={(event) => setQuery({ ...query, [key]: event.target.value })}
                className="rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none"
              />
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => void loadContacts()}
              className="rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                const reset = { q: "", name: "", email: "", company: "", tags: "" };
                setQuery(reset);
                void loadContacts(reset);
              }}
              className="rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="glass-card overflow-hidden rounded-3xl">
          {loading ? (
            <div className="p-8 text-sm text-slate-500">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">No contacts yet.</div>
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
                            onClick={() => void handleDelete(contact._id)}
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
