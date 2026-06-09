import { Schema, model, type InferSchemaType, Types } from "mongoose";

const teamInvitationSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    role: {
      type: String,
      enum: ["owner", "admin", "sales_manager", "sales_representative"],
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    invitedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked"],
      default: "pending",
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    acceptedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

teamInvitationSchema.index({ organizationId: 1, email: 1, status: 1 });

export type TeamInvitationDocument = InferSchemaType<typeof teamInvitationSchema> & {
  organizationId: Types.ObjectId;
  invitedByUserId: Types.ObjectId;
};

export const TeamInvitation = model("TeamInvitation", teamInvitationSchema);
