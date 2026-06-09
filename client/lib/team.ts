import { api } from "./api";
import { orgPath } from "./org";

export type TeamRole = "owner" | "admin" | "sales_manager" | "sales_representative";

export type TeamMember = {
  id: string;
  role: TeamRole;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
};

export type TeamInvitation = {
  _id: string;
  email: string;
  role: TeamRole;
  token: string;
  status: string;
  expiresAt: string;
};

export async function listTeamMembers() {
  const response = await api.get(orgPath("/team"));
  return response.data.data as { members: TeamMember[]; invitations: TeamInvitation[] };
}

export async function inviteTeamMember(payload: { email: string; role: TeamRole }) {
  const response = await api.post(orgPath("/team/invite"), payload);
  return response.data.data as { invitation: TeamInvitation; inviteLink: string };
}

export async function updateTeamMemberRole(memberId: string, role: TeamRole) {
  const response = await api.patch(orgPath(`/team/members/${memberId}/role`), { role });
  return response.data.data as { membership: unknown };
}

export async function suspendTeamMember(memberId: string) {
  const response = await api.patch(orgPath(`/team/members/${memberId}/suspend`));
  return response.data.data as { membership: unknown };
}

export async function removeTeamMember(memberId: string) {
  const response = await api.delete(orgPath(`/team/members/${memberId}`));
  return response.data.data as Record<string, never>;
}

