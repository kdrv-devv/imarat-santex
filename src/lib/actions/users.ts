"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { requireAdmin, requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import type { ActionResult } from "./auth";

const USERNAME_RE = /^[a-z0-9_.]{3,30}$/;

export async function createEmployeeAction(input: {
  firstName: string; lastName: string; phone: string; username: string; password: string;
}): Promise<ActionResult> {
  const admin = await requireAdmin();
  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim();
  const phone = input.phone?.trim();
  const username = input.username?.trim().toLowerCase();
  const password = input.password ?? "";
  if (!firstName || !lastName) return { ok: false, error: "Ism va familiyani kiriting" };
  if (!phone) return { ok: false, error: "Telefon raqamini kiriting" };
  if (!USERNAME_RE.test(username)) return { ok: false, error: "Login 3-30 belgi: kichik harf, raqam, _ yoki ." };
  if (password.length < 4) return { ok: false, error: "Parol kamida 4 belgi" };
  await connectDB();
  if (await User.exists({ username })) return { ok: false, error: "Bu login band" };
  const u = await User.create({
    firstName, lastName, phone, username,
    passwordHash: await bcrypt.hash(password, 10),
    role: "EMPLOYEE",
    createdBy: admin.id,
  });
  await logActivity({ actor: admin.id, type: "USER_CREATED", targetUser: String(u._id), meta: { userName: `${firstName} ${lastName}` } });
  revalidatePath("/admin/employees");
  return { ok: true };
}

export async function updateEmployeeAction(id: string, input: {
  firstName: string; lastName: string; phone: string; active?: boolean;
}): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!mongoose.isValidObjectId(id)) return { ok: false, error: "Noto'g'ri ID" };
  await connectDB();
  const u = await User.findById(id);
  if (!u) return { ok: false, error: "Hodim topilmadi" };
  u.firstName = input.firstName?.trim() || u.firstName;
  u.lastName = input.lastName?.trim() || u.lastName;
  u.phone = input.phone?.trim() || u.phone;
  if (typeof input.active === "boolean" && String(u._id) !== admin.id) u.active = input.active;
  await u.save();
  await logActivity({ actor: admin.id, type: "USER_UPDATED", targetUser: id, meta: { userName: `${u.firstName} ${u.lastName}` } });
  revalidatePath("/admin/employees");
  revalidatePath("/profile");
  return { ok: true };
}

/** Login/parolni faqat SUPERADMIN o'zgartira oladi (o'ziniki ham, hodimlarniki ham) */
export async function changeCredentialsAction(id: string, input: { username?: string; password?: string }): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!mongoose.isValidObjectId(id)) return { ok: false, error: "Noto'g'ri ID" };
  await connectDB();
  const u = await User.findById(id);
  if (!u) return { ok: false, error: "Foydalanuvchi topilmadi" };
  const changed: string[] = [];
  if (input.username !== undefined && input.username.trim()) {
    const username = input.username.trim().toLowerCase();
    if (!USERNAME_RE.test(username)) return { ok: false, error: "Login 3-30 belgi: kichik harf, raqam, _ yoki ." };
    if (username !== u.username && (await User.exists({ username }))) return { ok: false, error: "Bu login band" };
    u.username = username;
    changed.push("login");
  }
  if (input.password) {
    if (input.password.length < 4) return { ok: false, error: "Parol kamida 4 belgi" };
    u.passwordHash = await bcrypt.hash(input.password, 10);
    changed.push("parol");
  }
  if (!changed.length) return { ok: false, error: "O'zgarish kiritilmadi" };
  await u.save();
  await logActivity({ actor: admin.id, type: "CREDENTIALS_CHANGED", targetUser: id, meta: { userName: `${u.firstName} ${u.lastName}`, extra: changed.join(", ") } });
  revalidatePath("/admin/employees");
  revalidatePath("/profile");
  return { ok: true };
}

export async function deleteEmployeeAction(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!mongoose.isValidObjectId(id)) return { ok: false, error: "Noto'g'ri ID" };
  if (id === admin.id) return { ok: false, error: "O'zingizni o'chira olmaysiz" };
  await connectDB();
  const u = await User.findById(id);
  if (!u) return { ok: false, error: "Hodim topilmadi" };
  if (u.role === "SUPERADMIN") return { ok: false, error: "Superadminni o'chirish mumkin emas" };
  // Tarix saqlanishi uchun o'chirmaymiz — faolsizlantiramiz
  u.active = false;
  await u.save();
  await logActivity({ actor: admin.id, type: "USER_UPDATED", targetUser: id, meta: { userName: `${u.firstName} ${u.lastName}`, extra: "faolsizlantirildi" } });
  revalidatePath("/admin/employees");
  return { ok: true };
}

/** Hodim o'z profilidagi ism/telefonini o'zgartira oladi (login/parol — yo'q) */
export async function updateOwnProfileAction(input: { firstName: string; lastName: string; phone: string }): Promise<ActionResult> {
  const me = await requireUser();
  await connectDB();
  const u = await User.findById(me.id);
  if (!u) return { ok: false, error: "Topilmadi" };
  if (!input.firstName?.trim() || !input.lastName?.trim()) return { ok: false, error: "Ism va familiya bo'sh bo'lmasin" };
  u.firstName = input.firstName.trim();
  u.lastName = input.lastName.trim();
  u.phone = input.phone?.trim() || u.phone;
  await u.save();
  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { ok: true };
}
