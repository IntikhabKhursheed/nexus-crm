import { AuditLog } from "../models/AuditLog.js";

export async function recordAuditLog(params: {
  organizationId: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: unknown;
}) {
  return AuditLog.create({
    organizationId: params.organizationId,
    userId: params.userId,
    action: params.action,
    entityType: params.entityType ?? "",
    entityId: params.entityId ?? "",
    metadata: params.metadata ?? null
  });
}

