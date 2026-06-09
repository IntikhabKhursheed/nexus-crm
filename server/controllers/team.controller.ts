import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { Types } from "mongoose";
import { Membership } from "../models/Membership.js";
import { Organization } from "../models/Organization.js";
import { TeamInvitation } from "../models/TeamInvitation.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { env } from "../config/env.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { Notification } from "../models/Notification.js";
import { recordAuditLog } from "../services/audit.service.js";
import { createOrganizationNotifications } from "../services/notification.service.js";
import { isEmailConfigured, sendEmailMessage } from "../services/email.service.js";

const validRoles = ["owner", "admin", "sales_manager", "sales_representative"] as const;

function buildInviteLink(organizationId: string, token: string) {
  return `${env.clientOrigin}/invite/${organizationId}/${token}`;
}

async function buildAuthPayload(userId: string, email: string) {
  const memberships = await Membership.find({ userId, status: "active" })
    .populate<{ organizationId: { _id: Types.ObjectId; name: string; slug: string } }>("organizationId")
    .lean();

  return {
    userId,
    email,
    memberships: memberships.map((membership) => ({
      id: String(membership._id),
      role: membership.role,
      organization: {
        id: String((membership.organizationId as { _id: Types.ObjectId })._id),
        name: (membership.organizationId as { name: string }).name,
        slug: (membership.organizationId as { slug: string }).slug
      }
    }))
  };
}

export const listTeamMembers = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const [memberships, invitations] = await Promise.all([
    Membership.find({ organizationId: req.organization.id })
      .populate<{ userId: { _id: Types.ObjectId; name: string; email: string; isActive: boolean } }>("userId")
      .sort({ createdAt: -1 })
      .lean(),
    TeamInvitation.find({ organizationId: req.organization.id, status: "pending" }).sort({ createdAt: -1 }).lean()
  ]);

  return sendResponse(res, 200, "Team members loaded successfully.", {
    members: memberships.map((membership) => ({
      id: String(membership._id),
      role: membership.role,
      status: membership.status,
      user: {
        id: String((membership.userId as { _id: Types.ObjectId })._id),
        name: (membership.userId as { name: string }).name,
        email: (membership.userId as { email: string }).email,
        isActive: (membership.userId as { isActive: boolean }).isActive
      }
    })),
    invitations
  });
});

export const inviteTeamMember = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const { email, role } = req.body as { email?: string; role?: (typeof validRoles)[number] };

  if (!email) {
    return sendResponse(res, 400, "An email address is required.", {});
  }

  if (!role || !validRoles.includes(role)) {
    return sendResponse(res, 400, "A valid team role is required.", {});
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail }).lean();
  const existingMembership = existingUser
    ? await Membership.findOne({ organizationId: req.organization.id, userId: existingUser._id }).lean()
    : null;

  if (existingMembership?.status === "active") {
    return sendResponse(res, 409, "This user is already part of the organization.", {});
  }

  const token = crypto.randomUUID();
  const invitation = await TeamInvitation.create({
    organizationId: req.organization.id,
    email: normalizedEmail,
    role,
    token,
    invitedByUserId: req.auth.userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  });

  const organization = await Organization.findById(req.organization.id).lean();
  const inviteLink = buildInviteLink(req.organization.id, token);

  if (isEmailConfigured()) {
    await sendEmailMessage({
      to: normalizedEmail,
      subject: `You're invited to join ${organization?.name ?? "NexusCRM"}`,
      text: `You have been invited to join ${organization?.name ?? "NexusCRM"} as ${role}. Accept here: ${inviteLink}`,
      html: `<p>You have been invited to join <strong>${organization?.name ?? "NexusCRM"}</strong> as <strong>${role}</strong>.</p><p><a href="${inviteLink}">Accept invitation</a></p>`
    });
  }

  await createOrganizationNotifications({
    organizationId: req.organization.id,
    type: "team_member_invited",
    title: "Team member invited",
    message: `${normalizedEmail} was invited to join the organization.`,
    metadata: { invitationId: String(invitation._id), email: normalizedEmail, role },
    excludeUserId: req.auth.userId
  });

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth.userId,
    action: "team_member_invited",
    entityType: "team_invitation",
    entityId: String(invitation._id),
    metadata: { email: normalizedEmail, role }
  });

  return sendResponse(res, 201, "Team member invitation created successfully.", {
    invitation,
    inviteLink
  });
});

export const acceptTeamInvitation = asyncHandler(async (req, res) => {
  const { orgId, token } = req.params as { orgId?: string; token?: string };
  const { name, password } = req.body as { name?: string; password?: string };

  if (!orgId || !Types.ObjectId.isValid(orgId)) {
    return sendResponse(res, 400, "A valid organization id is required.", {});
  }

  if (!token) {
    return sendResponse(res, 400, "An invitation token is required.", {});
  }

  if (!name || !password) {
    return sendResponse(res, 400, "Name and password are required to accept the invitation.", {});
  }

  const invitation = await TeamInvitation.findOne({
    organizationId: orgId,
    token,
    status: "pending"
  });

  if (!invitation) {
    return sendResponse(res, 404, "Invitation not found.", {});
  }

  if (invitation.expiresAt.getTime() < Date.now()) {
    invitation.status = "expired";
    await invitation.save();
    return sendResponse(res, 410, "Invitation has expired.", {});
  }

  const normalizedEmail = invitation.email.toLowerCase();
  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      role: invitation.role
    });
  }

  await Membership.findOneAndUpdate(
    { organizationId: orgId, userId: user._id },
    {
      organizationId: orgId,
      userId: user._id,
      role: invitation.role,
      status: "active"
    },
    { upsert: true, new: true }
  );

  invitation.status = "accepted";
  invitation.acceptedAt = new Date();
  await invitation.save();

  const accessToken = signAccessToken({ userId: String(user._id), email: user.email });
  const refreshToken = signRefreshToken({ userId: String(user._id), email: user.email });
  const authData = await buildAuthPayload(String(user._id), user.email);

  await recordAuditLog({
    organizationId: orgId,
    userId: String(user._id),
    action: "team_invitation_accepted",
    entityType: "team_invitation",
    entityId: String(invitation._id),
    metadata: { email: normalizedEmail, role: invitation.role }
  });

  return sendResponse(res, 200, "Invitation accepted successfully.", {
    ...authData,
    accessToken,
    refreshToken
  });
});

export const updateTeamMemberRole = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const memberId = String(req.params.memberId);
  const { role } = req.body as { role?: (typeof validRoles)[number] };

  if (!Types.ObjectId.isValid(memberId)) {
    return sendResponse(res, 400, "A valid member id is required.", {});
  }

  if (!role || !validRoles.includes(role)) {
    return sendResponse(res, 400, "A valid team role is required.", {});
  }

  const membership = await Membership.findOneAndUpdate(
    { _id: memberId, organizationId: req.organization.id },
    { $set: { role } },
    { new: true }
  );

  if (!membership) {
    return sendResponse(res, 404, "Team member not found.", {});
  }

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth.userId,
    action: "team_member_role_updated",
    entityType: "membership",
    entityId: String(membership._id),
    metadata: { role }
  });

  return sendResponse(res, 200, "Team member role updated successfully.", { membership });
});

export const suspendTeamMember = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const memberId = String(req.params.memberId);
  if (!Types.ObjectId.isValid(memberId)) {
    return sendResponse(res, 400, "A valid member id is required.", {});
  }

  const membership = await Membership.findOneAndUpdate(
    { _id: memberId, organizationId: req.organization.id },
    { $set: { status: "disabled" } },
    { new: true }
  );

  if (!membership) {
    return sendResponse(res, 404, "Team member not found.", {});
  }

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth.userId,
    action: "team_member_suspended",
    entityType: "membership",
    entityId: String(membership._id)
  });

  return sendResponse(res, 200, "Team member suspended successfully.", { membership });
});

export const removeTeamMember = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const memberId = String(req.params.memberId);
  if (!Types.ObjectId.isValid(memberId)) {
    return sendResponse(res, 400, "A valid member id is required.", {});
  }

  const membership = await Membership.findOneAndDelete({ _id: memberId, organizationId: req.organization.id });

  if (!membership) {
    return sendResponse(res, 404, "Team member not found.", {});
  }

  await recordAuditLog({
    organizationId: req.organization.id,
    userId: req.auth.userId,
    action: "team_member_removed",
    entityType: "membership",
    entityId: String(membership._id)
  });

  return sendResponse(res, 200, "Team member removed successfully.", {});
});

