import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { defineModel } from "@/lib/db";

const SiteItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true, min: 0, default: 1 },
    /** Tanlangan razmer/variant (mahsulot variantlaridan biri yoki qo'lda kiritilgan). Bo'sh = razmersiz */
    variant: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

/** Xaritadagi joylashuv (ixtiyoriy) */
const LocationSchema = new Schema(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false },
);

const SiteSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: "", trim: true },
    location: { type: LocationSchema, default: null },
    note: { type: String, default: "", trim: true },
    shareToken: { type: String, required: true, unique: true },
    items: { type: [SiteItemSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export type SiteItemDoc = InferSchemaType<typeof SiteItemSchema> & { _id: mongoose.Types.ObjectId };
export type SiteDoc = InferSchemaType<typeof SiteSchema> & { _id: mongoose.Types.ObjectId };

export const Site: Model<SiteDoc> = defineModel<SiteDoc>("Site", SiteSchema);
