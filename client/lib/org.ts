import { getActiveOrganizationId } from "./auth";

export function orgIdOrThrow() {
  const orgId = getActiveOrganizationId();
  if (!orgId) {
    throw new Error("No active organization found. Please sign in again.");
  }
  return orgId;
}

export function orgPath(path: string) {
  return `/organizations/${orgIdOrThrow()}${path}`;
}

