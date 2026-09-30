import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { Site } from "@/lib/models/Site";
import "@/lib/models/User";
import { requireUser, isAdmin } from "@/lib/auth";
import { toProductView } from "@/lib/serialize";
import { ProductsClient } from "./ProductsClient";

export const metadata: Metadata = { title: "Mahsulotlar" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const user = await requireUser();
  await connectDB();
  const [products, usage] = await Promise.all([
    Product.find().sort({ name: 1 }).populate("createdBy", "firstName lastName").populate("updatedBy", "firstName lastName").lean(),
    Site.aggregate<{ _id: unknown; count: number }>([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", count: { $sum: 1 } } },
    ]),
  ]);
  const usageMap: Record<string, number> = {};
  for (const u of usage) usageMap[String(u._id)] = u.count;

  return <ProductsClient products={products.map(toProductView)} usage={usageMap} isAdmin={isAdmin(user)} currentUserId={user.id} />;
}
