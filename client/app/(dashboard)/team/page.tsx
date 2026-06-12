"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel } from "@/components/ui/chrome";
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
  const { pushToast } = useToast();

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const response = await listTeamMembers();
      setMembers(response.members);
      setInvitations(response.invitations);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load team members.";
      setError(message);
      pushToast({ type: "error", title: "Team failed to load", description: message });
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
      pushToast({ type: "success", title: "Invite sent", description: form.email });
      await loadData();
    } catch (inviteError) {
      const message = inviteError instanceof Error ? inviteError.message : "Unable to invite team member.";
      setError(message);
      pushToast({ type: "error", title: "Invite failed", description: message });
    }
  }

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Team"
          title="Team management"
          description="Invite teammates, change roles, and keep pending invitations clearly visible."
        />

        {error && <ErrorState description={error} onRetry={() => void loadData()} />}

        <Panel title="Invite member" description="Send an invitation and choose the appropriate role.">
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px_auto]">
            <Input placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as TeamRole })}>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="sales_manager">Sales Manager</option>
              <option value="sales_representative">Sales Representative</option>
            </Select>
            <Button onClick={() => void handleInvite()}>Send invite</Button>
          </div>
        </Panel>

        <Panel title="Members" description="Manage roles, status, and access across the workspace.">
          <div className="mt-4 space-y-3">
            {loading ? (
              <LoadingState label="Loading team members..." />
            ) : members.length === 0 ? (
              <EmptyState title="No team members yet" description="Invite people to collaborate inside the same organization." />
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 rounded-[10px] border border-[#e8ecf0] bg-white p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-[rgb(var(--nx-text-primary))]">{member.user.name}</p>
                    <p className="text-sm text-[rgb(var(--nx-text-muted))]">{member.user.email}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--nx-text-muted))]">
                      {member.role} · {member.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      className="min-w-48"
                      value={member.role}
                      onChange={(event) =>
                        void updateTeamMemberRole(member.id, event.target.value as TeamRole)
                          .then(loadData)
                          .then(() =>
                            pushToast({
                              type: "success",
                              title: "Role updated",
                              description: member.user.email
                            })
                          )
                          .catch((updateError) => {
                            const message = updateError instanceof Error ? updateError.message : "Unable to update role.";
                            setError(message);
                            pushToast({ type: "error", title: "Role update failed", description: message });
                          })
                      }
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="sales_manager">Sales Manager</option>
                      <option value="sales_representative">Sales Representative</option>
                    </Select>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        void suspendTeamMember(member.id)
                          .then(loadData)
                          .then(() =>
                            pushToast({
                              type: "success",
                              title: "Member suspended",
                              description: member.user.email
                            })
                          )
                          .catch((suspendError) => {
                            const message =
                              suspendError instanceof Error ? suspendError.message : "Unable to suspend member.";
                            setError(message);
                            pushToast({ type: "error", title: "Suspend failed", description: message });
                          })
                      }
                    >
                      Suspend
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        void removeTeamMember(member.id)
                          .then(loadData)
                          .then(() =>
                            pushToast({
                              type: "success",
                              title: "Member removed",
                              description: member.user.email
                            })
                          )
                          .catch((removeError) => {
                            const message = removeError instanceof Error ? removeError.message : "Unable to remove member.";
                            setError(message);
                            pushToast({ type: "error", title: "Remove failed", description: message });
                          })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Pending invitations" description="Invitations will appear here until they are accepted or expire.">
          <div className="mt-4 space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation._id} className="rounded-[10px] border border-[#e8ecf0] bg-white p-4 text-sm">
                <p className="font-semibold text-[rgb(var(--nx-text-primary))]">{invitation.email}</p>
                <p className="text-[rgb(var(--nx-text-muted))]">{invitation.role}</p>
              </div>
            ))}
            {!loading && invitations.length === 0 && (
              <EmptyState title="No pending invitations" description="Invitations will appear here until they are accepted or expire." />
            )}
          </div>
        </Panel>
      </div>
    </WorkspaceShell>
  );
}
