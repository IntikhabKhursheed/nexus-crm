import { Schema, model, type InferSchemaType, Types } from "mongoose";

const companySchema = new Schema(
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
      trim: true,
      index: true
    },
    website: {
      type: String,
      trim: true,
      default: ""
    },
    industry: {
      type: String,
      trim: true,
      default: ""
    },
    size: {
      type: String,
      trim: true,
      default: ""
    },
    location: {
      type: String,
      trim: true,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    },
    aiEnrichment: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

companySchema.index({ organizationId: 1, name: 1 });

export type CompanyDocument = InferSchemaType<typeof companySchema> & {
  organizationId: Types.ObjectId;
};

export const Company = model("Company", companySchema);
