"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product, UNITS, type Unit } from "@/lib/models/Product";
import { Site } from "@/lib/models/Site";
import { requireUser, isAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { uploadProductImage, deleteProductImage, type UploadedImage } from "@/lib/cloudinary";
import type { ActionResult } from "./auth";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB (brauzerda siqilgandan keyin odatda <200KB)

/** Formadan rasm amalini o'qiydi: keep = o'zgarmasin, remove = o'chirilsin, replace = yangi fayl */
type ImageIntent = { kind: "keep" } | { kind: "remove" } | { kind: "replace"; file: Blob };

function readImageIntent(fd: FormData): ImageIntent {
  const action = fd.get("imageAction");
  if (action === "remove") return { kind: "remove" };
  if (action === "replace") {
    const file = fd.get("image");
    if (!(file instanceof Blob) || file.size === 0) throw new Error("Rasm fayli topilmadi");
    if (!file.type.startsWith("image/")) throw new Error("Faqat rasm fayli yuklash mumkin");
    if (file.size > MAX_IMAGE_BYTES) throw new Error("Rasm juda katta (max 5MB)");
    return { kind: "replace", file };
  }
  return { kind: "keep" };
}

function readFields(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const unit = String(fd.get("unit") ?? "");
  const note = String(fd.get("note") ?? "").trim();
  return { name, unit, note };
}

async function uploadOrError(file: Blob): Promise<UploadedImage | { error: string }> {
  try {
    return await uploadProductImage(file);
  } catch (e) {
    console.error("Cloudinary upload xatosi:", e);
    return { error: "Rasmni yuklab bo'lmadi. Qayta urinib ko'ring." };
  }
}

export async function createProductAction(fd: FormData): Promise<ActionResult & { id?: string }> {
  const user = await requireUser();
  const { name, unit, note } = readFields(fd);
  if (!name) return { ok: false, error: "Mahsulot nomini kiriting" };
  if (!UNITS.includes(unit as Unit)) return { ok: false, error: "O'lchov birligi noto'g'ri" };
  let intent: ImageIntent;
  try { intent = readImageIntent(fd); } catch (e) { return { ok: false, error: (e as Error).message }; }

  await connectDB();
  const dup = await Product.findOne({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }).lean();
  if (dup) return { ok: false, error: "Bunday nomli mahsulot allaqachon mavjud" };

  let uploaded: UploadedImage | null = null;
  if (intent.kind === "replace") {
    const r = await uploadOrError(intent.file);
    if ("error" in r) return { ok: false, error: r.error };
    uploaded = r;
  }

  const p = await Product.create({
    name, unit: unit as Unit, note,
    image: uploaded?.url ?? null,
    imagePublicId: uploaded?.publicId ?? null,
    createdBy: user.id,
  });
  await logActivity({ actor: user.id, type: "PRODUCT_CREATED", product: String(p._id), meta: { productName: name, unit } });
  revalidatePath("/products");
  revalidatePath("/objects", "layout");
  return { ok: true, id: String(p._id) };
}

export async function updateProductAction(id: string, fd: FormData): Promise<ActionResult> {
  const user = await requireUser();
  if (!mongoose.isValidObjectId(id)) return { ok: false, error: "Noto'g'ri ID" };
  const { name, unit, note } = readFields(fd);
  if (!name) return { ok: false, error: "Mahsulot nomini kiriting" };
  if (!UNITS.includes(unit as Unit)) return { ok: false, error: "O'lchov birligi noto'g'ri" };
  let intent: ImageIntent;
  try { intent = readImageIntent(fd); } catch (e) { return { ok: false, error: (e as Error).message }; }

  await connectDB();
  const p = await Product.findById(id);
  if (!p) return { ok: false, error: "Mahsulot topilmadi" };

  const oldPublicId = p.imagePublicId;
  let uploaded: UploadedImage | null = null;
  if (intent.kind === "replace") {
    const r = await uploadOrError(intent.file);
    if ("error" in r) return { ok: false, error: r.error };
    uploaded = r;
  }

  p.name = name;
  p.unit = unit as Unit;
  p.note = note;
  if (intent.kind === "replace") {
    p.image = uploaded!.url;
    p.imagePublicId = uploaded!.publicId;
  } else if (intent.kind === "remove") {
    p.image = null;
    p.imagePublicId = null;
  }
  p.updatedBy = new mongoose.Types.ObjectId(user.id);
  await p.save();

  // Yangi rasm saqlangandan keyingina eskisini Cloudinary'dan o'chiramiz
  if (intent.kind !== "keep" && oldPublicId) await deleteProductImage(oldPublicId);

  await logActivity({ actor: user.id, type: "PRODUCT_UPDATED", product: id, meta: { productName: name, unit } });
  revalidatePath("/products");
  revalidatePath("/objects", "layout");
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!isAdmin(user)) return { ok: false, error: "Faqat superadmin o'chira oladi" };
  if (!mongoose.isValidObjectId(id)) return { ok: false, error: "Noto'g'ri ID" };
  await connectDB();
  const p = await Product.findById(id);
  if (!p) return { ok: false, error: "Mahsulot topilmadi" };
  const usedIn = await Site.countDocuments({ "items.product": p._id });
  if (usedIn > 0) return { ok: false, error: `Bu mahsulot ${usedIn} ta obyektda ishlatilgan. Avval ulardan olib tashlang.` };
  await p.deleteOne();
  await deleteProductImage(p.imagePublicId);
  await logActivity({ actor: user.id, type: "PRODUCT_DELETED", product: id, meta: { productName: p.name } });
  revalidatePath("/products");
  return { ok: true };
}
