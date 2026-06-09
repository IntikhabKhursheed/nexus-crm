"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/lib/api";
import { setTokens, setWorkspaceSession } from "@/lib/auth";

export default function AcceptInvitePage() {
  const params = useParams<{ orgId: string; token: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    setError("");
    try {
      const response = await api.post(`/public/organizations/${params.orgId}/team/invitations/${params.token}/accept`, {
        name,
        password
      });
      const { accessToken, refreshToken, memberships = [] } = response.data.data;
      setTokens(accessToken, refreshToken);
      setWorkspaceSession(memberships);
      router.push("/contacts");
    } catch (submitError) {
      const message = axios.isAxiosError<{ message?: string }>(submitError)
        ? submitError.response?.data?.message ?? "Unable to accept invitation."
        : "Unable to accept invitation.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="glass-card w-full max-w-lg rounded-3xl p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Invite</p>
        <h1 className="mt-2 text-3xl font-semibold">Accept your invitation</h1>
        <div className="mt-6 space-y-4">
          <input className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} />
          <input className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none" type="password" placeholder="Create password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={() => void handleAccept()} disabled={loading} className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-60">
            {loading ? "Joining..." : "Join workspace"}
          </button>
        </div>
      </div>
    </main>
  );
}

