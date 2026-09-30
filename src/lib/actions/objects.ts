"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import { Product } from "@/lib/models/Product";
import { requireUser, isAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import type { ActionResult } from "./auth";
import type { GeoPoint } from "@/lib/types";

const oid = (v: string) => mongoose.isValidObjectId(v);

type ObjectInput = { name: string; address?: string; note?: string; location?: GeoPoint | null };

/** Joylashuvni tekshiradi: null/undefined = yo'q, aks holda lat/lng chegarada bo'lishi shart */
function parseLocation(loc: unknown): GeoPoint | null {
  if (loc === null || loc === undefined) return null;
  if (typeof loc !== "object") throw new Error("Joylashuv noto'g'ri");
  const { lat, lng } = loc as Record<string, unknown>;
  if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("Joylashuv noto'g'ri");
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) throw new Error("Joylashuv chegaradan tashqarida");
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

export async function createObjectAction(input: ObjectInput): Promise<ActionResult & { id?: string }> {
  const user = await requireUser();
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Obyekt nomini kiriting" };
  let location: GeoPoint | null;
  try { location = parseLocation(input.location); } catch (e) { return { ok: false, error: (e as Error).message }; }
  await connectDB();
  const site = await Site.create({
    name,
    address: input.address?.trim() ?? "",
    location,
    note: input.note?.trim() ?? "",
    shareToken: nanoid(12),
    createdBy: user.id,
  });
  await logActivity({ actor: user.id, type: "OBJECT_CREATED", site: String(site._id), meta: { siteName: name } });
  revalidatePath("/objects");
  return { ok: true, id: String(site._id) };
}

export async function updateObjectAction(id: string, input: ObjectInput): Promise<ActionResult> {
  const user = await requireUser();
  if (!oid(id)) return { ok: false, error: "Noto'g'ri ID" };
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Obyekt nomini kiriting" };
  let location: GeoPoint | null;
  try { location = parseLocation(input.location); } catch (e) { return { ok: false, error: (e as Error).message }; }
  await connectDB();
  const site = await Site.findById(id);
  if (!site) return { ok: false, error: "Obyekt topilmadi" };
  site.name = name;
  site.address = input.address?.trim() ?? "";
  site.location = location;
  site.note = input.note?.trim() ?? "";
  await site.save();
  await logActivity({ actor: user.id, type: "OBJECT_UPDATED", site: id, meta: { siteName: name } });
  revalidatePath("/objects");
  revalidatePath(`/objects/${id}`);
  return { ok: true };
}

export async function deleteObjectAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!oid(id)) return { ok: false, error: "Noto'g'ri ID" };
  await connectDB();
  const site = await Site.findById(id);
  if (!site) return { ok: false, error: "Obyekt topilmadi" };
  if (!isAdmin(user) && String(site.createdBy) !== user.id) {
    return { ok: false, error: "Faqat yaratuvchi yoki superadmin o'chira oladi" };
  }
  await site.deleteOne();
  await logActivity({ actor: user.id, type: "OBJECT_DELETED", site: id, meta: { siteName: site.name } });
  revalidatePath("/objects");
  return { ok: true };
}

export async function addItemAction(siteId: string, input: { productId: string; qty: number; note?: string }): Promise<ActionResult> {
  const user = await requireUser();
  if (!oid(siteId) || !oid(input.productId)) return { ok: false, error: "Noto'g'ri ID" };
  const qty = Number(input.qty);
  if (!Number.isFinite(qty) || qty <= 0) return { ok: false, error: "Miqdor 0 dan katta bo'lsin" };
  await connectDB();
  const [site, product] = await Promise.all([Site.findById(siteId), Product.findById(input.productId).lean()]);
  if (!site) return { ok: false, error: "Obyekt topilmadi" };
  if (!product) return { ok: false, error: "Mahsulot topilmadi" };

  const existing = site.items.find((i) => String(i.product) === input.productId);
  if (existing) {
    existing.qty += qty;
    if (input.note?.trim()) existing.note = input.note.trim();
    await site.save();
    await logActivity({
      actor: user.id, type: "ITEM_UPDATED", site: siteId, product: input.productId,
      meta: { siteName: site.name, productName: product.name, qty: existing.qty, unit: product.unit, extra: `+${qty}` },
    });
  } else {
    site.items.push({ product: product._id, qty, note: input.note?.trim() ?? "", addedBy: new mongoose.Types.ObjectId(user.id), addedAt: new Date() } as never);
    await site.save();
    await logActivity({
      actor: user.id, type: "ITEM_ADDED", site: siteId, product: input.productId,
      meta: { siteName: site.name, productName: product.name, qty, unit: product.unit },
    });
  }
  revalidatePath(`/objects/${siteId}`);
  revalidatePath("/objects");
  return { ok: true };
}

export async function updateItemAction(siteId: string, itemId: string, input: { qty: number; note?: string }): Promise<ActionResult> {
  const user = await requireUser();
  if (!oid(siteId) || !oid(itemId)) return { ok: false, error: "Noto'g'ri ID" };
  const qty = Number(input.qty);
  if (!Number.isFinite(qty) || qty < 0) return { ok: false, error: "Miqdor noto'g'ri" };
  await connectDB();
  const site = await Site.findById(siteId);
  if (!site) return { ok: false, error: "Obyekt topilmadi" };
  const item = site.items.find((i) => String(i._id) === itemId);
  if (!item) return { ok: false, error: "Element topilmadi" };
  const product = await Product.findById(item.product).lean();
  if (qty === 0) {
    site.items.pull({ _id: item._id });
    await site.save();
    await logActivity({ actor: user.id, type: "ITEM_REMOVED", site: siteId, product: String(item.product), meta: { siteName: site.name, productName: product?.name ?? "" } });
  } else {
    item.qty = qty;
    if (input.note !== undefined) item.note = input.note.trim();
    await site.save();
    await logActivity({ actor: user.id, type: "ITEM_UPDATED", site: siteId, product: String(item.product), meta: { siteName: site.name, productName: product?.name ?? "", qty, unit: product?.unit ?? "" } });
  }
  revalidatePath(`/objects/${siteId}`);
  return { ok: true };
}

export async function removeItemAction(siteId: string, itemId: string): Promise<ActionResult> {
  return updateItemAction(siteId, itemId, { qty: 0 });
}

export async function regenerateShareTokenAction(siteId: string): Promise<ActionResult & { token?: string }> {
  await requireUser();
  if (!oid(siteId)) return { ok: false, error: "Noto'g'ri ID" };
  await connectDB();
  const token = nanoid(12);
  await Site.updateOne({ _id: siteId }, { shareToken: token });
  revalidatePath(`/objects/${siteId}`);
  return { ok: true, token };
}
