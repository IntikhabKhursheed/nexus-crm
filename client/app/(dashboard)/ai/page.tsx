"use client";

import type { FormEvent } from "react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { listCompanies, listContacts, listDeals, type Company, type Contact, type Deal } from "@/lib/crm";
import {
  enrichContactOrCompany,
  generateMeetingBrief,
  generateRevenueForecast,
  listAiInsights,
  scoreDealWithAi,
  sendWeeklyDigest,
  writeAiEmail,
  type AiEmailDraft,
  type AiMeetingBrief,
  type AiRevenueForecast,
  type AiInsightRecord,
  type AiWeeklyDigest
} from "@/lib/ai";
import { PageHeader, Panel } from "@/components/ui/chrome";

type AiForms = {
  enrichment: {
    companyId: string;
    contactId: string;
    companyName: string;
    website: string;
    emailDomain: string;
  };
  email: {
    contactId: string;
    companyId: string;
    dealId: string;
    goal: string;
  };
  digest: {
    toEmail: string;
  };
};

const initialForms: AiForms = {
  enrichment: {
    companyId: "",
    contactId: "",
    companyName: "",
    website: "",
    emailDomain: ""
  },
  email: {
    contactId: "",
    companyId: "",
    dealId: "",
    goal: ""
  },
  digest: {
    toEmail: ""
  }
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function SectionCard({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Panel title={title} description={description}>
      {children}
    </Panel>
  );
}

export default function AiPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [insights, setInsights] = useState<AiInsightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [forms, setForms] = useState<AiForms>(initialForms);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [enrichmentResult, setEnrichmentResult] = useState<Record<string, unknown> | null>(null);
  const [emailDraft, setEmailDraft] = useState<AiEmailDraft | null>(null);
  const [brief, setBrief] = useState<AiMeetingBrief | null>(null);
  const [forecast, setForecast] = useState<AiRevenueForecast | null>(null);
  const [digest, setDigest] = useState<AiWeeklyDigest | null>(null);
  const [scoreResult, setScoreResult] = useState<Record<string, unknown> | null>(null);

  const contactsById = useMemo(() => new Map(contacts.map((contact) => [contact._id, contact])), [contacts]);
  const companiesById = useMemo(() => new Map(companies.map((company) => [company._id, company])), [companies]);
  const dealsById = useMemo(() => new Map(deals.map((deal) => [deal._id, deal])), [deals]);

  async function loadBaseData() {
    setLoading(true);
    setPageError("");

    try {
      const [contactsResponse, companiesResponse, dealsResponse, insightsResponse] = await Promise.all([
        listContacts(),
        listCompanies(),
        listDeals(),
        listAiInsights()
      ]);

      setContacts(contactsResponse.contacts);
      setCompanies(companiesResponse.companies);
      setDeals(dealsResponse.deals);
      setInsights(insightsResponse.insights);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to load AI workspace data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBaseData();
  }, []);

  async function refreshInsights() {
    try {
      const response = await listAiInsights();
      setInsights(response.insights);
    } catch {
      // Keep the last known insights if refresh fails.
    }
  }

  async function handleEnrichmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving((current) => ({ ...current, enrichment: true }));
    setPageError("");

    try {
      const response = await enrichContactOrCompany(forms.enrichment);
      setEnrichmentResult(response);
      await refreshInsights();
      await loadBaseData();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to enrich profile.");
    } finally {
      setSaving((current) => ({ ...current, enrichment: false }));
    }
  }

  async function handleEmailDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving((current) => ({ ...current, email: true }));
    setPageError("");

    try {
      const response = await writeAiEmail(forms.email);
      setEmailDraft(response.draft);
      await refreshInsights();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to generate email draft.");
    } finally {
      setSaving((current) => ({ ...current, email: false }));
    }
  }

  async function handleScoreDeal() {
    if (!forms.email.dealId) {
      setPageError("Choose a deal before scoring it.");
      return;
    }

    setSaving((current) => ({ ...current, scoring: true }));
    setPageError("");

    try {
      const response = await scoreDealWithAi({ dealId: forms.email.dealId });
      setScoreResult(response);
      setDeals((current) => current.map((deal) => (deal._id === response.deal._id ? response.deal : deal)));
      await refreshInsights();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to score deal.");
    } finally {
      setSaving((current) => ({ ...current, scoring: false }));
    }
  }

  async function handleMeetingBrief() {
    setSaving((current) => ({ ...current, brief: true }));
    setPageError("");

    try {
      const response = await generateMeetingBrief({
        contactId: forms.email.contactId,
        companyId: forms.email.companyId,
        dealId: forms.email.dealId
      });
      setBrief(response.brief);
      await refreshInsights();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to generate meeting brief.");
    } finally {
      setSaving((current) => ({ ...current, brief: false }));
    }
  }

  async function handleForecast() {
    setSaving((current) => ({ ...current, forecast: true }));
    setPageError("");

    try {
      const response = await generateRevenueForecast();
      setForecast(response.forecast);
      await refreshInsights();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to generate forecast.");
    } finally {
      setSaving((current) => ({ ...current, forecast: false }));
    }
  }

  async function handleDigest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving((current) => ({ ...current, digest: true }));
    setPageError("");

    try {
      const response = await sendWeeklyDigest(forms.digest);
      setDigest(response.digest);
      await refreshInsights();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Unable to send weekly digest.");
    } finally {
      setSaving((current) => ({ ...current, digest: false }));
    }
  }

  const selectedContact = forms.email.contactId ? contactsById.get(forms.email.contactId) : null;
  const selectedCompany = forms.email.companyId ? companiesById.get(forms.email.companyId) : null;
  const selectedDeal = forms.email.dealId ? dealsById.get(forms.email.dealId) : null;

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="AI Hub"
          title="Groq-powered sales intelligence"
          description="Enrich contacts and companies, draft outreach, score deals, generate briefs, forecast revenue, and send weekly digests."
          actions={
            <button
              type="button"
              onClick={() => void loadBaseData()}
              className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:bg-muted"
            >
              Refresh data
            </button>
          }
        />

        {pageError && <p className="text-sm text-red-500">{pageError}</p>}
        {loading ? <p className="text-sm text-slate-500">Loading AI workspace...</p> : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="AI contact enrichment"
            description="Use a company name, website, or email domain to enrich the company and related contact profile."
          >
            <form onSubmit={handleEnrichmentSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                  value={forms.enrichment.companyId}
                  onChange={(event) =>
                    setForms({ ...forms, enrichment: { ...forms.enrichment, companyId: event.target.value } })
                  }
                >
                  <option value="">Choose company profile</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                  value={forms.enrichment.contactId}
                  onChange={(event) =>
                    setForms({ ...forms, enrichment: { ...forms.enrichment, contactId: event.target.value } })
                  }
                >
                  <option value="">Choose contact profile</option>
                  {contacts.map((contact) => (
                    <option key={contact._id} value={contact._id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                  placeholder="Company name"
                  value={forms.enrichment.companyName}
                  onChange={(event) =>
                    setForms({ ...forms, enrichment: { ...forms.enrichment, companyName: event.target.value } })
                  }
                />
                <input
                  className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                  placeholder="Website"
                  value={forms.enrichment.website}
                  onChange={(event) =>
                    setForms({ ...forms, enrichment: { ...forms.enrichment, website: event.target.value } })
                  }
                />
                <input
                  className="rounded-2xl border border-border bg-card px-4 py-3 outline-none md:col-span-2"
                  placeholder="Email domain"
                  value={forms.enrichment.emailDomain}
                  onChange={(event) =>
                    setForms({ ...forms, enrichment: { ...forms.enrichment, emailDomain: event.target.value } })
                  }
                />
              </div>
              <button
                type="submit"
                disabled={saving.enrichment}
                className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950"
              >
                {saving.enrichment ? "Enriching..." : "Run enrichment"}
              </button>
            </form>
            {enrichmentResult && (
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4 text-xs text-slate-500">
                {JSON.stringify(enrichmentResult, null, 2)}
              </pre>
            )}
          </SectionCard>

          <SectionCard
            title="AI email writer"
            description="Generate an outreach or follow-up email, then edit the draft before you send it."
          >
            <form onSubmit={handleEmailDraft} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                  value={forms.email.contactId}
                  onChange={(event) =>
                    setForms({ ...forms, email: { ...forms.email, contactId: event.target.value } })
                  }
                >
                  <option value="">Choose contact</option>
                  {contacts.map((contact) => (
                    <option key={contact._id} value={contact._id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                  value={forms.email.companyId}
                  onChange={(event) =>
                    setForms({ ...forms, email: { ...forms.email, companyId: event.target.value } })
                  }
                >
                  <option value="">Choose company</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-2xl border border-border bg-card px-4 py-3 outline-none md:col-span-2"
                  value={forms.email.dealId}
                  onChange={(event) => setForms({ ...forms, email: { ...forms.email, dealId: event.target.value } })}
                >
                  <option value="">Choose deal</option>
                  {deals.map((deal) => (
                    <option key={deal._id} value={deal._id}>
                      {deal.title} · {deal.stage}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                className="min-h-28 w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                placeholder="Goal"
                value={forms.email.goal}
                onChange={(event) => setForms({ ...forms, email: { ...forms.email, goal: event.target.value } })}
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving.email}
                  className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950"
                >
                  {saving.email ? "Writing..." : "Generate email"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleScoreDeal()}
                  disabled={saving.scoring}
                  className="rounded-2xl border border-border bg-card px-5 py-3 font-semibold transition hover:bg-muted disabled:opacity-60"
                >
                  {saving.scoring ? "Scoring..." : "Score selected deal"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleMeetingBrief()}
                  disabled={saving.brief}
                  className="rounded-2xl border border-border bg-card px-5 py-3 font-semibold transition hover:bg-muted disabled:opacity-60"
                >
                  {saving.brief ? "Building brief..." : "Generate meeting brief"}
                </button>
              </div>
            </form>

            {emailDraft && (
              <div className="mt-4 space-y-3 rounded-2xl border border-border bg-card p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-500">Subject</span>
                    <input
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none"
                      value={emailDraft.subject}
                      onChange={(event) => setEmailDraft({ ...emailDraft, subject: event.target.value })}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-slate-500">Tone</span>
                    <input
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none"
                      value={emailDraft.tone}
                      onChange={(event) => setEmailDraft({ ...emailDraft, tone: event.target.value })}
                    />
                  </label>
                </div>
                <label className="block space-y-2 text-sm">
                  <span className="text-slate-500">Body</span>
                  <textarea
                    className="min-h-44 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none"
                    value={emailDraft.body}
                    onChange={(event) => setEmailDraft({ ...emailDraft, body: event.target.value })}
                  />
                </label>
                <p className="text-sm text-slate-500">
                  {emailDraft.callToAction ? `Suggested CTA: ${emailDraft.callToAction}` : "Suggested CTA will appear here."}
                </p>
              </div>
            )}

            {scoreResult && (
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4 text-xs text-slate-500">
                {JSON.stringify(scoreResult, null, 2)}
              </pre>
            )}

            {brief && (
              <div className="mt-4 space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
                <p className="font-semibold">Meeting brief</p>
                <p className="text-slate-500">{brief.summary}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Talking points</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-500">
                      {brief.talkingPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Questions to ask</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-500">
                      {brief.questionsToAsk.map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Revenue forecasting"
            description="Ask Groq to predict current and next month revenue from the live pipeline."
          >
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => void handleForecast()}
                disabled={saving.forecast}
                className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950"
              >
                {saving.forecast ? "Forecasting..." : "Generate forecast"}
              </button>

              {forecast && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current month</p>
                    <p className="mt-2 text-2xl font-semibold">{formatMoney(forecast.currentMonthRevenue)}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Next month</p>
                    <p className="mt-2 text-2xl font-semibold">{formatMoney(forecast.nextMonthRevenue)}</p>
                  </div>
                </div>
              )}

              {forecast && (
                <div className="rounded-2xl border border-border bg-card p-4 text-sm text-slate-500">
                  <p className="font-semibold text-foreground">Confidence: {forecast.confidence}%</p>
                  <p className="mt-2">{forecast.reasoning}</p>
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.2em]">Assumptions</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5">
                      {forecast.assumptions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Weekly sales digest"
            description="Generate a professional summary and send it through Gmail/Nodemailer."
          >
            <form onSubmit={handleDigest} className="space-y-4">
              <input
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none"
                placeholder="Recipient email"
                value={forms.digest.toEmail}
                onChange={(event) => setForms({ ...forms, digest: { toEmail: event.target.value } })}
              />
              <button
                type="submit"
                disabled={saving.digest}
                className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950"
              >
                {saving.digest ? "Sending..." : "Send weekly digest"}
              </button>
            </form>

            {digest && (
              <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm text-slate-500">
                <p className="font-semibold text-foreground">{digest.subject}</p>
                <p className="mt-2">{digest.summary}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em]">Highlights</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5">
                      {digest.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em]">Next week focus</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5">
                      {digest.nextWeekFocus.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        <section className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Recent AI insights</h3>
              <p className="mt-2 text-sm text-slate-500">Every AI action is stored in MongoDB for auditability.</p>
            </div>
            <button
              type="button"
              onClick={() => void refreshInsights()}
              className="rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              Refresh insights
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {insights.map((insight) => (
              <article key={insight._id} className="rounded-2xl border border-border bg-card p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{insight.title}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{insight.type}</p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-slate-500">
                    {new Date(insight.createdAt).toLocaleString()}
                  </span>
                </div>
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-background p-4 text-xs text-slate-500">
                  {JSON.stringify(insight.output, null, 2)}
                </pre>
              </article>
            ))}
            {insights.length === 0 && !loading && (
              <p className="text-sm text-slate-500">No AI insights yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card/60 p-6 text-sm text-slate-500">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em]">Selected contact</p>
              <p className="mt-2 font-medium text-foreground">{selectedContact?.name ?? "None"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em]">Selected company</p>
              <p className="mt-2 font-medium text-foreground">{selectedCompany?.name ?? "None"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em]">Selected deal</p>
              <p className="mt-2 font-medium text-foreground">
                {selectedDeal ? `${selectedDeal.title} · ${selectedDeal.stage}` : "None"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
