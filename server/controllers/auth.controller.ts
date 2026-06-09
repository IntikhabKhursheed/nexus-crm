import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { Membership } from "../models/Membership.js";
import { Organization } from "../models/Organization.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { User } from "../models/User.js";
import { recordAuditLog } from "../services/audit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";

function slugifyOrganizationName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || `org-${Date.now()}`;
}

async function uniqueOrganizationSlug(baseName: string) {
  const baseSlug = slugifyOrganizationName(baseName);
  let candidate = baseSlug;
  let suffix = 1;

  while (await Organization.exists({ slug: candidate })) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function storeRefreshToken(userId: string, refreshToken: string) {
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await RefreshToken.create({
    userId,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
}

async function buildAuthPayload(userId: string, email: string) {
  const memberships = await Membership.find({ userId, status: "active" })
    .populate<{
      organizationId: {
        _id: Types.ObjectId;
        name: string;
        slug: string;
      };
    }>("organizationId")
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

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, organizationName } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    organizationName?: string;
  };

  if (!name || !email || !password || !organizationName) {
    return sendResponse(res, 400, "Name, email, password, and organization name are required.", {});
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return sendResponse(res, 409, "An account with this email already exists.", {});
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: "owner"
  });

  const slug = await uniqueOrganizationSlug(organizationName);
  const organization = await Organization.create({
    name: organizationName,
    slug,
    ownerId: user._id,
    billingPlan: "free",
    billingStatus: "active"
  });

  await Membership.create({
    userId: user._id,
    organizationId: organization._id,
    role: "owner",
    status: "active"
  });

  const accessToken = signAccessToken({ userId: String(user._id), email: user.email });
  const refreshToken = signRefreshToken({ userId: String(user._id), email: user.email });

  await storeRefreshToken(String(user._id), refreshToken);
  const authData = await buildAuthPayload(String(user._id), user.email);

  await recordAuditLog({
    organizationId: String(organization._id),
    userId: String(user._id),
    action: "user_registered",
    entityType: "user",
    entityId: String(user._id)
  });

  const data = {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email
    },
    organization: {
      id: String(organization._id),
      name: organization.name,
      slug: organization.slug,
      billingPlan: organization.billingPlan
    },
    ...authData,
    accessToken,
    refreshToken
  };

  return sendResponse(res, 201, "Account created successfully.", data);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return sendResponse(res, 400, "Email and password are required.", {});
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user || !user.isActive) {
    return sendResponse(res, 401, "Invalid email or password.", {});
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return sendResponse(res, 401, "Invalid email or password.", {});
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccessToken({ userId: String(user._id), email: user.email });
  const refreshToken = signRefreshToken({ userId: String(user._id), email: user.email });

  await storeRefreshToken(String(user._id), refreshToken);

  const authData = await buildAuthPayload(String(user._id), user.email);

  const activeOrganizationId = authData.memberships[0]?.organization.id;
  if (activeOrganizationId) {
    await recordAuditLog({
      organizationId: activeOrganizationId,
      userId: String(user._id),
      action: "user_login",
      entityType: "user",
      entityId: String(user._id)
    });
  }

  return sendResponse(res, 200, "Logged in successfully.", {
    ...authData,
    accessToken,
    refreshToken
  });
});

export const refresh = asyncHandler(async (req, res) => {
  if (!req.auth || !req.user) {
    return sendResponse(res, 401, "Refresh token is required.", {});
  }

  const user = await User.findById(req.auth.userId);

  if (!user || !user.isActive) {
    return sendResponse(res, 401, "User is inactive or missing.", {});
  }

  const accessToken = signAccessToken({ userId: String(user._id), email: user.email });
  const refreshToken = signRefreshToken({ userId: String(user._id), email: user.email });

  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );

  await storeRefreshToken(String(user._id), refreshToken);

  return sendResponse(res, 200, "Token refreshed successfully.", {
    accessToken,
    refreshToken
  });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) {
    return sendResponse(res, 401, "Unauthorized.", {});
  }

  const user = await User.findById(req.auth.userId).lean();

  if (!user) {
    return sendResponse(res, 404, "User not found.", {});
  }

  const authData = await buildAuthPayload(String(user._id), user.email);

  return sendResponse(res, 200, "Profile loaded successfully.", {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role
    },
    ...authData
  });
});
