import { Schema, model, type InferSchemaType, Types } from "mongoose";

const notificationSchema = new Schema(
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
    message: {
      type: String,
      required: true,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ organizationId: 1, userId: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
};

export const Notification = model("Notification", notificationSchema);
