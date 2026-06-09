import { Schema, model, type InferSchemaType, Types } from "mongoose";

const savedReportSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    configuration: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

savedReportSchema.index({ organizationId: 1, createdAt: -1 });

export type SavedReportDocument = InferSchemaType<typeof savedReportSchema> & {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
};

export const SavedReport = model("SavedReport", savedReportSchema);
