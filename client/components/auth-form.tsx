"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import { setTokens, setWorkspaceSession } from "@/lib/auth";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? form
        : {
            email: form.email,
            password: form.password
          };

      const response = await api.post(endpoint, payload);
      const { accessToken, refreshToken, memberships = [] } = response.data.data;
      setTokens(accessToken, refreshToken);
      setWorkspaceSession(memberships);
      window.location.href = "/contacts";
    } catch (submitError) {
      const message = axios.isAxiosError<{ message?: string }>(submitError)
        ? submitError.response?.data?.message ?? "Something went wrong."
        : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isRegister && (
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      )}
      <input
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
        placeholder="Email address"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {isRegister && (
        <input
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-slate-400"
          placeholder="Organization name"
          value={form.organizationName}
          onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950"
      >
        {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
