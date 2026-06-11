"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { CompanyPayload } from "@/lib/crm";
import { Button } from "./ui/button";
import { Input, Textarea } from "./ui/input";

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
        <Input
          placeholder="Company name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <Input
          placeholder="Website"
          value={form.website}
          onChange={(event) => setForm({ ...form, website: event.target.value })}
        />
        <Input
          placeholder="Industry"
          value={form.industry}
          onChange={(event) => setForm({ ...form, industry: event.target.value })}
        />
        <Input
          placeholder="Size"
          value={form.size}
          onChange={(event) => setForm({ ...form, size: event.target.value })}
        />
      </div>
      <Input
        placeholder="Location"
        value={form.location}
        onChange={(event) => setForm({ ...form, location: event.target.value })}
      />
      <Textarea
        placeholder="Notes"
        value={form.notes}
        onChange={(event) => setForm({ ...form, notes: event.target.value })}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
