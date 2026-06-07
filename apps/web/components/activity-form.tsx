"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { ActivityPayload } from "@/lib/crm";

type ActivityFormProps = {
  onSubmit: (payload: ActivityPayload) => Promise<void>;
  defaultContactId?: string;
  hideContactId?: boolean;
};

const emptyValues: ActivityPayload = {
  type: "note",
  title: "",
  notes: "",
  contactId: "",
  companyId: "",
  dealId: ""
};

export function ActivityForm({ onSubmit, defaultContactId = "", hideContactId = false }: ActivityFormProps) {
  const [form, setForm] = useState<ActivityPayload>({
    ...emptyValues,
    contactId: defaultContactId
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSubmit(form);
      setForm({
        ...emptyValues,
        contactId: defaultContactId
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <select
          value={form.type}
          onChange={(event) => setForm({ ...form, type: event.target.value as ActivityPayload["type"] })}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none"
        >
          <option value="note">Note</option>
          <option value="email">Email</option>
          <option value="call">Call</option>
          <option value="meeting">Meeting</option>
          <option value="WhatsApp">WhatsApp</option>
        </select>
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Title"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
      </div>
      <textarea
        className="min-h-28 w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
        placeholder="Activity notes"
        value={form.notes}
        onChange={(event) => setForm({ ...form, notes: event.target.value })}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Company ID"
          value={form.companyId}
          onChange={(event) => setForm({ ...form, companyId: event.target.value })}
        />
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Deal ID"
          value={form.dealId}
          onChange={(event) => setForm({ ...form, dealId: event.target.value })}
        />
        {hideContactId ? (
          <input type="hidden" value={form.contactId} readOnly />
        ) : (
          <input
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
            placeholder="Contact ID"
            value={form.contactId}
            onChange={(event) => setForm({ ...form, contactId: event.target.value })}
          />
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950"
      >
        {loading ? "Logging..." : "Log activity"}
      </button>
    </form>
  );
}
