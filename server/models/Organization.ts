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
    logoUrl: {
      type: String,
      default: ""
    },
    timezone: {
      type: String,
      default: "UTC"
    },
    currency: {
      type: String,
      default: "USD"
    },
    branding: {
      primaryColor: {
        type: String,
        default: "#0f172a"
      },
      secondaryColor: {
        type: String,
        default: "#64748b"
      },
      accentColor: {
        type: String,
        default: "#38bdf8"
      }
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
