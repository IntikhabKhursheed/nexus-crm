import { Schema, model, type InferSchemaType, Types } from "mongoose";

const dealSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    value: {
      type: Number,
      default: 0
    },
    stage: {
      type: String,
      enum: ["Lead", "Contacted", "Meeting", "Proposal", "Negotiation", "Won", "Lost"],
      default: "Lead",
      index: true
    },
    probability: {
      type: Number,
      default: 0
    },
    expectedCloseDate: {
      type: Date,
      default: null
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
    notes: {
      type: String,
      default: ""
    },
    aiScore: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

dealSchema.index({ organizationId: 1, stage: 1 });

export type DealDocument = InferSchemaType<typeof dealSchema> & {
  organizationId: Types.ObjectId;
  contactId?: Types.ObjectId | null;
  companyId?: Types.ObjectId | null;
};

export const Deal = model("Deal", dealSchema);
