import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { connectDB } from "@/lib/db";
import { User, type Role } from "@/lib/models/User";

export const COOKIE_NAME = "imarat_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 kun

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET topilmadi");
  return new TextEncoder().encode(s);
}

export type SessionPayload = { sub: string; role: Role; username: string };

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub !== "string") return null;
    return { sub: payload.sub, role: payload.role as Role, username: String(payload.username ?? "") };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  username: string;
  role: Role;
  avatar: string | null;
  createdAt: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session) return null;
  await connectDB();
  const u = await User.findById(session.sub).lean();
  if (!u || !u.active) return null;
  return {
    id: String(u._id),
    firstName: u.firstName,
    lastName: u.lastName,
    fullName: `${u.firstName} ${u.lastName}`.trim(),
    phone: u.phone,
    username: u.username,
    role: u.role,
    avatar: u.avatar ?? null,
    createdAt: u.createdAt?.toISOString() ?? "",
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "SUPERADMIN") redirect("/objects");
  return user;
}

export function isAdmin(user: { role: Role } | null | undefined) {
  return user?.role === "SUPERADMIN";
}
