import { Schema, model, type InferSchemaType, Types } from "mongoose";

const subscriptionSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free"
    },
    status: {
      type: String,
      enum: ["active", "past_due", "canceled", "trialing", "unpaid"],
      default: "active"
    },
    stripeCustomerId: {
      type: String,
      default: ""
    },
    stripeSubscriptionId: {
      type: String,
      default: ""
    },
    currentPeriodEnd: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema> & {
  organizationId: Types.ObjectId;
};

export const Subscription = model("Subscription", subscriptionSchema);
