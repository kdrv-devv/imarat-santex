import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const ROLES = ["SUPERADMIN", "EMPLOYEE"] as const;
export type Role = (typeof ROLES)[number];

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "EMPLOYEE", required: true },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User: Model<UserDoc> = mongoose.models.User ?? mongoose.model<UserDoc>("User", UserSchema);
