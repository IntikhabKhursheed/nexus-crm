"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { ContactPayload } from "@/lib/crm";

type ContactFormProps = {
  initialValues?: ContactPayload;
  submitLabel: string;
  onSubmit: (payload: ContactPayload) => Promise<void>;
};

const emptyValues: ContactPayload = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  role: "",
  tags: "",
  companyId: "",
  notes: ""
};

export function ContactForm({ initialValues, submitLabel, onSubmit }: ContactFormProps) {
  const [form, setForm] = useState<ContactPayload>(initialValues ?? emptyValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialValues) {
      setForm(initialValues);
    }
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSubmit(form);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Phone"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="LinkedIn URL"
          value={form.linkedin}
          onChange={(event) => setForm({ ...form, linkedin: event.target.value })}
        />
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Role"
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value })}
        />
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Company ID"
          value={form.companyId}
          onChange={(event) => setForm({ ...form, companyId: event.target.value })}
        />
      </div>
      <input
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
        placeholder="Tags, separated by commas"
        value={form.tags}
        onChange={(event) => setForm({ ...form, tags: event.target.value })}
      />
      <textarea
        className="min-h-32 w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
        placeholder="Notes"
        value={form.notes}
        onChange={(event) => setForm({ ...form, notes: event.target.value })}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
