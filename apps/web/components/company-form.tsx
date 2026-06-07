"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { CompanyPayload } from "@/lib/crm";

type CompanyFormProps = {
  initialValues?: CompanyPayload;
  submitLabel: string;
  onSubmit: (payload: CompanyPayload) => Promise<void>;
};

const emptyValues: CompanyPayload = {
  name: "",
  website: "",
  industry: "",
  size: "",
  location: "",
  notes: ""
};

export function CompanyForm({ initialValues, submitLabel, onSubmit }: CompanyFormProps) {
  const [form, setForm] = useState<CompanyPayload>(initialValues ?? emptyValues);
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
          placeholder="Company name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Website"
          value={form.website}
          onChange={(event) => setForm({ ...form, website: event.target.value })}
        />
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Industry"
          value={form.industry}
          onChange={(event) => setForm({ ...form, industry: event.target.value })}
        />
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Size"
          value={form.size}
          onChange={(event) => setForm({ ...form, size: event.target.value })}
        />
      </div>
      <input
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
        placeholder="Location"
        value={form.location}
        onChange={(event) => setForm({ ...form, location: event.target.value })}
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
