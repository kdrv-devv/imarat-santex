"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { signSession, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Bazada hech kim bo'lmasa .env dagi ma'lumotlardan SUPERADMIN yaratadi */
async function ensureSuperadmin() {
  const count = await User.estimatedDocumentCount();
  if (count > 0) return;
  const username = (process.env.SEED_ADMIN_USERNAME ?? "admin").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  await User.create({
    firstName: "Super",
    lastName: "Admin",
    phone: "+998",
    username,
    passwordHash: await bcrypt.hash(password, 10),
    role: "SUPERADMIN",
  });
}

export async function loginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  if (!username || !password) return { ok: false, error: "Login va parolni kiriting" };

  await connectDB();
  await ensureSuperadmin();

  const user = await User.findOne({ username });
  if (!user || !user.active) return { ok: false, error: "Login yoki parol noto'g'ri" };
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { ok: false, error: "Login yoki parol noto'g'ri" };

  const token = await signSession({ sub: String(user._id), role: user.role, username: user.username });
  await setSessionCookie(token);
  await logActivity({ actor: String(user._id), type: "LOGIN" });

  redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/objects");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
