import mongoose, { type Model, type Schema } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI muhit o'zgaruvchisi topilmadi (.env.local)");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis.__mongooseCache ?? { conn: null, promise: null };
globalThis.__mongooseCache = cache;

export async function connectDB() {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI!, { bufferCommands: false });
  }
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }
  return cache.conn;
}

/**
 * Modelni ro'yxatdan o'tkazadi.
 * Production'da keshlangan model qayta ishlatiladi (OverwriteModelError bo'lmasin).
 * Development'da esa fayl HMR orqali qayta yuklanganda eski model o'chirilib, YANGI sxema bilan
 * qayta yaratiladi — aks holda sxemaga qo'shilgan yangi maydon (masalan, `avatar`) dev server
 * qayta ishga tushirilmaguncha saqlanmaydi (strict mode uni jimgina tashlab yuboradi).
 */
export function defineModel<T>(name: string, schema: Schema): Model<T> {
  const existing = mongoose.models[name] as Model<T> | undefined;
  if (existing) {
    if (process.env.NODE_ENV === "production") return existing;
    mongoose.deleteModel(name);
  }
  // Oddiy cast: generic `mongoose.model<T>(name, schema)` TypeScript'ni juda og'ir tip hisoblashga majburlaydi
  return mongoose.model(name, schema) as unknown as Model<T>;
}
