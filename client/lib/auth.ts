const accessTokenKey = "nexuscrm_access_token";
const refreshTokenKey = "nexuscrm_refresh_token";
const themeKey = "nexuscrm_theme";
const membershipsKey = "nexuscrm_memberships";
const activeOrganizationKey = "nexuscrm_active_organization";
const userKey = "nexuscrm_user";

export type StoredMembership = {
  id: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
};

export type StoredUser = {
  id: string;
  name: string;
  email: string;
};

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(accessTokenKey, accessToken);
  localStorage.setItem(refreshTokenKey, refreshToken);
}

export function setWorkspaceSession(memberships: StoredMembership[]) {
  localStorage.setItem(membershipsKey, JSON.stringify(memberships));
  if (memberships.length > 0) {
    localStorage.setItem(activeOrganizationKey, memberships[0].organization.id);
  }
}

export function setStoredUser(user: StoredUser) {
  localStorage.setItem(userKey, JSON.stringify(user));
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(accessTokenKey);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(refreshTokenKey);
}

export function clearTokens() {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
}

export function clearWorkspaceSession() {
  clearTokens();
  localStorage.removeItem(membershipsKey);
  localStorage.removeItem(activeOrganizationKey);
  localStorage.removeItem(userKey);
}

export function getStoredMemberships() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(membershipsKey);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as StoredMembership[];
  } catch {
    return [];
  }
}

export function getActiveOrganizationId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(activeOrganizationKey);
}

export function getActiveOrganization() {
  const memberships = getStoredMemberships();
  const activeOrganizationId = getActiveOrganizationId();
  return memberships.find((membership) => membership.organization.id === activeOrganizationId) ?? memberships[0] ?? null;
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(userKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setActiveOrganizationId(organizationId: string) {
  localStorage.setItem(activeOrganizationKey, organizationId);
}

export function getSavedTheme() {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(themeKey) ?? "dark";
}

export function setSavedTheme(theme: "dark" | "light") {
  localStorage.setItem(themeKey, theme);
}
