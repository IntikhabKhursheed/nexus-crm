import { api } from "./api";
import { orgPath } from "./org";

export async function listAuditLogs() {
  const response = await api.get(orgPath("/audit-logs"));
  return response.data.data as {
    auditLogs: Array<{
      _id: string;
      action: string;
      entityType: string;
      entityId: string;
      metadata?: unknown;
      createdAt: string;
    }>;
  };
}

