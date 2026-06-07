import { Schema, model, type InferSchemaType, Types } from "mongoose";

const contactSchema = new Schema(
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    linkedin: {
      type: String,
      trim: true,
      default: ""
    },
    role: {
      type: String,
      trim: true,
      default: ""
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true
    },
    companyName: {
      type: String,
      trim: true,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

contactSchema.index({ organizationId: 1, name: 1 });
contactSchema.index({ organizationId: 1, email: 1 });
contactSchema.index({ organizationId: 1, companyName: 1 });

export type ContactDocument = InferSchemaType<typeof contactSchema> & {
  organizationId: Types.ObjectId;
  companyId?: Types.ObjectId | null;
};

export const Contact = model("Contact", contactSchema);
