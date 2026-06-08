import { Schema, model, type InferSchemaType, Types } from "mongoose";

const activitySchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["email", "call", "meeting", "note", "WhatsApp"],
      required: true,
      index: true
    },
    title: {
      type: String,
      trim: true,
      default: ""
    },
    notes: {
      type: String,
      required: true
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      default: null,
      index: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true
    },
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

activitySchema.index({ organizationId: 1, createdAt: -1 });

export type ActivityDocument = InferSchemaType<typeof activitySchema> & {
  organizationId: Types.ObjectId;
};

export const Activity = model("Activity", activitySchema);
