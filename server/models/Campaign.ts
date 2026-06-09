import { Schema, model, type InferSchemaType, Types } from "mongoose";

const campaignRecipientSchema = new Schema(
  {
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      default: null
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      default: ""
    },
    token: {
      type: String,
      required: true
    },
    sentAt: {
      type: Date,
      default: null
    },
    openedAt: {
      type: Date,
      default: null
    },
    lastOpenedAt: {
      type: Date,
      default: null
    },
    isOpened: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const campaignSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    segment: {
      type: Schema.Types.Mixed,
      default: null
    },
    recipients: {
      type: [campaignRecipientSchema],
      default: []
    },
    sentCount: {
      type: Number,
      default: 0
    },
    openedCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["draft", "sent"],
      default: "draft"
    }
  },
  {
    timestamps: true
  }
);

campaignSchema.index({ organizationId: 1, createdAt: -1 });

export type CampaignDocument = InferSchemaType<typeof campaignSchema> & {
  organizationId: Types.ObjectId;
  createdBy: Types.ObjectId;
};

export const Campaign = model("Campaign", campaignSchema);
