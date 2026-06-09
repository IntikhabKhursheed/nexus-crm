import { Schema, model, type InferSchemaType, Types } from "mongoose";

const auditLogSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    entityType: {
      type: String,
      default: ""
    },
    entityId: {
      type: String,
      default: ""
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ organizationId: 1, createdAt: -1 });

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema> & {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
};

export const AuditLog = model("AuditLog", auditLogSchema);
