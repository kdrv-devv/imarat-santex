import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Site } from "@/lib/models/Site";
import { Product } from "@/lib/models/Product";
import { requireAdmin } from "@/lib/auth";
import { EmployeesClient, type EmployeeView } from "./EmployeesClient";

export const metadata: Metadata = { title: "Hodimlar" };
export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const admin = await requireAdmin();
  await connectDB();
  const [users, siteCounts, productCounts] = await Promise.all([
    User.find().sort({ role: 1, createdAt: 1 }).lean(),
    Site.aggregate<{ _id: unknown; n: number }>([{ $group: { _id: "$createdBy", n: { $sum: 1 } } }]),
    Product.aggregate<{ _id: unknown; n: number }>([{ $group: { _id: "$createdBy", n: { $sum: 1 } } }]),
  ]);
  const sc = Object.fromEntries(siteCounts.map((x) => [String(x._id), x.n]));
  const pc = Object.fromEntries(productCounts.map((x) => [String(x._id), x.n]));
  const list: EmployeeView[] = users.map((u) => ({
    id: String(u._id),
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    username: u.username,
    avatar: u.avatar ?? null,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt?.toISOString() ?? "",
    sites: sc[String(u._id)] ?? 0,
    products: pc[String(u._id)] ?? 0,
  }));
  return <EmployeesClient users={list} meId={admin.id} />;
}
