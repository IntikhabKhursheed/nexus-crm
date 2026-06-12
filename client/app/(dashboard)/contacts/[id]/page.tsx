"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace-shell";
import { ActivityForm } from "@/components/activity-form";
import { createContactActivity, getContact, type Activity, type Contact, type Deal } from "@/lib/crm";

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const contactId = params.id;
  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadContact() {
    setLoading(true);
    setError("");

    try {
      const response = await getContact(contactId);
      setContact(response.contact);
      setActivities(response.activities);
      setDeals(response.deals);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load contact.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadContact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  if (loading) {
    return (
      <WorkspaceShell>
        <div className="rounded-[10px] border border-[#e8ecf0] bg-white p-8 text-sm text-[rgb(var(--nx-text-muted))]">Loading contact details...</div>
      </WorkspaceShell>
    );
  }

  if (error || !contact) {
    return (
      <WorkspaceShell>
        <div className="rounded-[10px] border border-[#e8ecf0] bg-white p-8 text-sm text-red-500">{error || "Contact not found."}</div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[10px] border border-[#e8ecf0] bg-white p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[rgb(var(--nx-text-muted))]">Contact detail</p>
                <h2 className="mt-2 text-3xl font-semibold text-[rgb(var(--nx-text-primary))]">{contact.name}</h2>
                <p className="mt-2 text-[rgb(var(--nx-text-muted))]">
                  {contact.role || "No role"} {contact.companyName ? `at ${contact.companyName}` : ""}
                </p>
              </div>
              <Link
                href={`/contacts/${contactId}/edit`}
                className="rounded-[8px] border border-[#e8ecf0] bg-white px-5 py-3 text-sm font-semibold"
              >
                Edit contact
              </Link>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-[10px] bg-[#f8fafc] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--nx-text-muted))]">Email</p>
                <p className="mt-2 font-medium">{contact.email || "-"}</p>
              </div>
              <div className="rounded-[10px] bg-[#f8fafc] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--nx-text-muted))]">Phone</p>
                <p className="mt-2 font-medium">{contact.phone || "-"}</p>
              </div>
              <div className="rounded-[10px] bg-[#f8fafc] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--nx-text-muted))]">LinkedIn</p>
                <p className="mt-2 font-medium break-all">{contact.linkedin || "-"}</p>
              </div>
              <div className="rounded-[10px] bg-[#f8fafc] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--nx-text-muted))]">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {contact.tags.length === 0 ? (
                    <span className="text-sm text-[rgb(var(--nx-text-muted))]">No tags</span>
                  ) : (
                    contact.tags.map((tag) => (
                      <span key={tag} className="rounded-[8px] bg-white px-3 py-1 text-xs text-[rgb(var(--nx-text-muted))]">
                        {tag}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {contact.notes && <p className="mt-6 whitespace-pre-wrap text-sm text-[rgb(var(--nx-text-muted))]">{contact.notes}</p>}

            {contact.aiEnrichment && (
              <div className="mt-6 rounded-[10px] border border-[#e8ecf0] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">AI enrichment</h3>
                  <span className="text-xs text-[rgb(var(--nx-text-muted))]">{contact.aiEnrichment.confidence}% confidence</span>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--nx-text-muted))]">Industry</p>
                    <p className="mt-1 text-sm">{contact.aiEnrichment.industry || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--nx-text-muted))]">Size</p>
                    <p className="mt-1 text-sm">{contact.aiEnrichment.companySize || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--nx-text-muted))]">Location</p>
                    <p className="mt-1 text-sm">{contact.aiEnrichment.location || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--nx-text-muted))]">Insights</p>
                    <p className="mt-1 text-sm">{contact.aiEnrichment.keyInsights?.[0] || "-"}</p>
                  </div>
                </div>
                {contact.aiEnrichment.description && (
                  <p className="mt-4 text-sm text-[rgb(var(--nx-text-muted))]">{contact.aiEnrichment.description}</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-[10px] border border-[#e8ecf0] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[rgb(var(--nx-text-primary))]">Activity timeline</h3>
              <span className="text-sm text-[rgb(var(--nx-text-muted))]">{activities.length} entries</span>
            </div>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-[rgb(var(--nx-text-muted))]">No activity logged yet.</p>
              ) : (
                activities.map((activity) => (
                  <article key={activity._id} className="rounded-[10px] border border-[#e8ecf0] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold capitalize">{activity.type}</h4>
                      <span className="text-xs text-[rgb(var(--nx-text-muted))]">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[rgb(var(--nx-text-muted))]">{activity.title || "Untitled activity"}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[rgb(var(--nx-text-muted))]">{activity.notes}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[10px] border border-[#e8ecf0] bg-white p-6">
            <h3 className="text-xl font-semibold text-[rgb(var(--nx-text-primary))]">Log activity</h3>
            <p className="mt-2 text-sm text-[rgb(var(--nx-text-muted))]">Add notes, calls, meetings, email follow-ups, or WhatsApp messages.</p>
            <div className="mt-6">
              <ActivityForm
                defaultContactId={contactId}
                hideContactId
                onSubmit={async (payload) => {
                  await createContactActivity(contactId, payload);
                  await loadContact();
                }}
              />
            </div>
          </div>

          <div className="rounded-[10px] border border-[#e8ecf0] bg-white p-6">
            <h3 className="text-xl font-semibold text-[rgb(var(--nx-text-primary))]">Linked deals</h3>
            <div className="mt-4 space-y-3">
              {deals.length === 0 ? (
                <p className="text-sm text-[rgb(var(--nx-text-muted))]">No deals linked to this contact.</p>
              ) : (
                deals.map((deal) => (
                  <div key={deal._id} className="rounded-[10px] bg-[#f8fafc] p-4">
                    <p className="font-medium">{deal.title}</p>
                    <p className="text-sm text-[rgb(var(--nx-text-muted))]">
                      {deal.stage} - ${deal.value.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </WorkspaceShell>
  );
}
