"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace-shell";
import { getCompany, type Activity, type Company, type Contact, type Deal } from "@/lib/crm";

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const companyId = params.id;
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getCompany(companyId);
        setCompany(response.company);
        setContacts(response.contacts);
        setDeals(response.deals);
        setActivities(response.activities);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load company.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [companyId]);

  return (
    <WorkspaceShell>
      {loading ? (
        <div className="glass-card rounded-3xl p-8 text-sm text-slate-500">Loading company details...</div>
      ) : error || !company ? (
        <div className="glass-card rounded-3xl p-8 text-sm text-red-500">{error || "Company not found."}</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Company detail</p>
                  <h2 className="mt-2 text-3xl font-semibold">{company.name}</h2>
                  <p className="mt-2 text-slate-500">{company.industry || "No industry set"}</p>
                </div>
                <Link
                  href={`/companies/${companyId}/edit`}
                  className="rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold"
                >
                  Edit company
                </Link>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Website</p>
                  <p className="mt-2 font-medium break-all">{company.website || "-"}</p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Size</p>
                  <p className="mt-2 font-medium">{company.size || "-"}</p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</p>
                  <p className="mt-2 font-medium">{company.location || "-"}</p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contacts</p>
                  <p className="mt-2 font-medium">{contacts.length}</p>
                </div>
              </div>

              {company.notes && <p className="mt-6 whitespace-pre-wrap text-sm text-slate-500">{company.notes}</p>}

              {company.aiEnrichment && (
                <div className="mt-6 rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">AI enrichment</h3>
                    <span className="text-xs text-slate-500">{company.aiEnrichment.confidence}% confidence</span>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Industry</p>
                      <p className="mt-1 text-sm">{company.aiEnrichment.industry || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Size</p>
                      <p className="mt-1 text-sm">{company.aiEnrichment.companySize || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</p>
                      <p className="mt-1 text-sm">{company.aiEnrichment.location || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Insight</p>
                      <p className="mt-1 text-sm">{company.aiEnrichment.keyInsights?.[0] || "-"}</p>
                    </div>
                  </div>
                  {company.aiEnrichment.description && (
                    <p className="mt-4 text-sm text-slate-500">{company.aiEnrichment.description}</p>
                  )}
                </div>
              )}
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-xl font-semibold">Linked contacts</h3>
              <div className="mt-4 space-y-3">
                {contacts.length === 0 ? (
                  <p className="text-sm text-slate-500">No contacts linked to this company.</p>
                ) : (
                  contacts.map((contact) => (
                    <Link key={contact._id} href={`/contacts/${contact._id}`} className="block rounded-2xl bg-card p-4">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-slate-500">{contact.role || contact.email || "-"}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-xl font-semibold">Linked deals</h3>
              <div className="mt-4 space-y-3">
                {deals.length === 0 ? (
                  <p className="text-sm text-slate-500">No deals linked to this company.</p>
                ) : (
                  deals.map((deal) => (
                    <div key={deal._id} className="rounded-2xl bg-muted p-4">
                      <p className="font-medium">{deal.title}</p>
                      <p className="text-sm text-slate-500">{deal.stage}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-xl font-semibold">Activity log</h3>
              <div className="mt-4 space-y-3">
                {activities.length === 0 ? (
                  <p className="text-sm text-slate-500">No activity logged for this company.</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity._id} className="rounded-2xl bg-muted p-4">
                      <p className="font-medium capitalize">{activity.type}</p>
                      <p className="text-sm text-slate-500">{activity.notes}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </WorkspaceShell>
  );
}
