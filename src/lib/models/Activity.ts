import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { defineModel } from "@/lib/db";

export const ACTIVITY_TYPES = [
  "OBJECT_CREATED",
  "OBJECT_UPDATED",
  "OBJECT_DELETED",
  "ITEM_ADDED",
  "ITEM_UPDATED",
  "ITEM_REMOVED",
  "PRODUCT_CREATED",
  "PRODUCT_UPDATED",
  "PRODUCT_DELETED",
  "USER_CREATED",
  "USER_UPDATED",
  "CREDENTIALS_CHANGED",
  "LOGIN",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

const ActivitySchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    site: { type: Schema.Types.ObjectId, ref: "Site", default: null },
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    targetUser: { type: Schema.Types.ObjectId, ref: "User", default: null },
    // Snapshot — nomlar keyin o'zgarsa/o'chirilsa ham tarix saqlanadi
    meta: {
      siteName: { type: String, default: "" },
      productName: { type: String, default: "" },
      userName: { type: String, default: "" },
      qty: { type: Number, default: null },
      unit: { type: String, default: "" },
      extra: { type: String, default: "" },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ActivitySchema.index({ createdAt: -1 });

export type ActivityDoc = InferSchemaType<typeof ActivitySchema> & { _id: mongoose.Types.ObjectId };

export const Activity: Model<ActivityDoc> =
  defineModel<ActivityDoc>("Activity", ActivitySchema);
