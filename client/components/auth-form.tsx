"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import { setStoredUser, setTokens, setWorkspaceSession } from "@/lib/auth";

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
      const { accessToken, refreshToken, memberships = [], user } = response.data.data;
      setTokens(accessToken, refreshToken);
      setWorkspaceSession(memberships);
      if (user) {
        setStoredUser(user);
      }
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
          className="w-full rounded-2xl border border-border bg-card/95 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[rgb(var(--secondary))] focus:ring-4 focus:ring-[rgb(var(--secondary)/0.14)]"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      )}
      <input
        className="w-full rounded-2xl border border-border bg-card/95 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[rgb(var(--secondary))] focus:ring-4 focus:ring-[rgb(var(--secondary)/0.14)]"
        placeholder="Email address"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="w-full rounded-2xl border border-border bg-card/95 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[rgb(var(--secondary))] focus:ring-4 focus:ring-[rgb(var(--secondary)/0.14)]"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {isRegister && (
        <input
          className="w-full rounded-2xl border border-border bg-card/95 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[rgb(var(--secondary))] focus:ring-4 focus:ring-[rgb(var(--secondary)/0.14)]"
          placeholder="Organization name"
          value={form.organizationName}
          onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full border border-transparent bg-[rgb(var(--primary))] px-4 py-3 font-semibold text-[rgb(var(--background))] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
