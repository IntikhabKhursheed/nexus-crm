"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import {
  inviteTeamMember,
  listTeamMembers,
  removeTeamMember,
  suspendTeamMember,
  updateTeamMemberRole,
  type TeamInvitation,
  type TeamMember,
  type TeamRole
} from "@/lib/team";

const defaultForm = { email: "", role: "sales_representative" as TeamRole };

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(defaultForm);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const response = await listTeamMembers();
      setMembers(response.members);
      setInvitations(response.invitations);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load team members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleInvite() {
    try {
      await inviteTeamMember(form);
      setForm(defaultForm);
      await loadData();
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Unable to invite team member.");
    }
  }

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Team</p>
          <h2 className="mt-2 text-3xl font-semibold">Team management</h2>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <section className="glass-card rounded-3xl p-6">
          <h3 className="text-xl font-semibold">Invite member</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px_auto]">
            <input
              className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
              placeholder="Email address"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <select
              className="rounded-2xl border border-border bg-card px-4 py-3 outline-none"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as TeamRole })}
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="sales_manager">Sales Manager</option>
              <option value="sales_representative">Sales Representative</option>
            </select>
            <button onClick={() => void handleInvite()} className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white">
              Send invite
            </button>
          </div>
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h3 className="text-xl font-semibold">Members</h3>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading team members...</p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{member.user.name}</p>
                    <p className="text-sm text-slate-500">{member.user.email}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {member.role} · {member.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      className="rounded-2xl border border-border bg-background px-3 py-2 text-sm"
                      value={member.role}
                      onChange={(event) =>
                        void updateTeamMemberRole(member.id, event.target.value as TeamRole)
                          .then(loadData)
                          .catch((updateError) =>
                            setError(updateError instanceof Error ? updateError.message : "Unable to update role.")
                          )
                      }
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="sales_manager">Sales Manager</option>
                      <option value="sales_representative">Sales Representative</option>
                    </select>
                    <button
                      onClick={() =>
                        void suspendTeamMember(member.id)
                          .then(loadData)
                          .catch((suspendError) =>
                            setError(suspendError instanceof Error ? suspendError.message : "Unable to suspend member.")
                          )
                      }
                      className="rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() =>
                        void removeTeamMember(member.id)
                          .then(loadData)
                          .catch((removeError) =>
                            setError(removeError instanceof Error ? removeError.message : "Unable to remove member.")
                          )
                      }
                      className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h3 className="text-xl font-semibold">Pending invitations</h3>
          <div className="mt-4 space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation._id} className="rounded-2xl border border-border bg-card p-4 text-sm">
                <p className="font-semibold">{invitation.email}</p>
                <p className="text-slate-500">{invitation.role}</p>
              </div>
            ))}
            {invitations.length === 0 && <p className="text-sm text-slate-500">No pending invitations.</p>}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
