import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { UNITS } from "@/lib/constants";
export { UNITS, type Unit } from "@/lib/constants";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    unit: { type: String, enum: UNITS, default: "dona", required: true },
    image: { type: String, default: null }, // Cloudinary https URL
    imagePublicId: { type: String, default: null }, // Cloudinary public_id (o'chirish uchun)
    note: { type: String, default: "", trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

ProductSchema.index({ name: "text" });

export type ProductDoc = InferSchemaType<typeof ProductSchema> & { _id: mongoose.Types.ObjectId };

export const Product: Model<ProductDoc> =
  mongoose.models.Product ?? mongoose.model<ProductDoc>("Product", ProductSchema);
