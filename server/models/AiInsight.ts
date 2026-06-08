import { Schema, model, type InferSchemaType, Types } from "mongoose";

const aiInsightSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    input: {
      type: Schema.Types.Mixed,
      default: null
    },
    output: {
      type: Schema.Types.Mixed,
      default: null
    },
    relatedContactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      default: null,
      index: true
    },
    relatedCompanyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true
    },
    relatedDealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      default: null,
      index: true
    },
    sentToEmail: {
      type: String,
      default: ""
    },
    emailStatus: {
      type: String,
      enum: ["not_sent", "sent", "failed"],
      default: "not_sent"
    },
    model: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

aiInsightSchema.index({ organizationId: 1, createdAt: -1 });

export type AiInsightDocument = InferSchemaType<typeof aiInsightSchema> & {
  organizationId: Types.ObjectId;
};

export const AiInsight = model("AiInsight", aiInsightSchema);
