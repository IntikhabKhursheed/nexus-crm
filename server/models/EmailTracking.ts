import { Schema, model, type InferSchemaType, Types } from "mongoose";

const emailTrackingSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
      index: true
    },
    recipientToken: {
      type: String,
      required: true,
      index: true
    },
    openedAt: {
      type: Date,
      default: null
    },
    lastOpenedAt: {
      type: Date,
      default: null
    },
    ipAddress: {
      type: String,
      default: ""
    },
    userAgent: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

emailTrackingSchema.index({ campaignId: 1, contactId: 1, recipientToken: 1 }, { unique: true });

export type EmailTrackingDocument = InferSchemaType<typeof emailTrackingSchema> & {
  organizationId: Types.ObjectId;
  campaignId: Types.ObjectId;
  contactId: Types.ObjectId;
};

export const EmailTracking = model("EmailTracking", emailTrackingSchema);
