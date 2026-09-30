import type { Metadata } from "next";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import { Product } from "@/lib/models/Product";
import "@/lib/models/User";
import { requireUser, isAdmin } from "@/lib/auth";
import { toSiteView, toProductLite } from "@/lib/serialize";
import { ObjectDetail } from "./ObjectDetail";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return { title: "Obyekt" };
  await connectDB();
  const s = await Site.findById(id, "name").lean();
  return { title: s?.name ?? "Obyekt" };
}

export default async function ObjectPage({ params }: Params) {
  const { id } = await params;
  const user = await requireUser();
  if (!mongoose.isValidObjectId(id)) notFound();
  await connectDB();
  const [site, products] = await Promise.all([
    Site.findById(id)
      .populate("createdBy", "firstName lastName")
      .populate("items.product", "name unit image")
      .populate("items.addedBy", "firstName lastName")
      .lean(),
    Product.find({}, "name unit image").sort({ name: 1 }).lean(),
  ]);
  if (!site) notFound();
  const view = toSiteView(site);
  view.items.sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1));
  const canDelete = isAdmin(user) || view.createdBy?.id === user.id;

  return (
    <ObjectDetail
      site={view}
      products={products.map(toProductLite).filter(Boolean) as NonNullable<ReturnType<typeof toProductLite>>[]}
      isAdmin={isAdmin(user)}
      canDelete={canDelete}
      currentUserId={user.id}
    />
  );
}
