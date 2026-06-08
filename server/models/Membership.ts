import { Schema, model, type InferSchemaType, Types } from "mongoose";

const membershipSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member"
    },
    status: {
      type: String,
      enum: ["active", "invited", "disabled"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

membershipSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

export type MembershipDocument = InferSchemaType<typeof membershipSchema> & {
  userId: Types.ObjectId;
  organizationId: Types.ObjectId;
};

export const Membership = model("Membership", membershipSchema);
