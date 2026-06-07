import { Schema, model, type InferSchemaType, Types } from "mongoose";

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    billingPlan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free"
    },
    billingStatus: {
      type: String,
      enum: ["active", "past_due", "canceled", "trialing", "inactive"],
      default: "active"
    },
    stripeCustomerId: {
      type: String,
      default: ""
    },
    stripeSubscriptionId: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

organizationSchema.index({ ownerId: 1, slug: 1 });

export type OrganizationDocument = InferSchemaType<typeof organizationSchema> & {
  ownerId: Types.ObjectId;
};

export const Organization = model("Organization", organizationSchema);
