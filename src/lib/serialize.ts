import type { ItemView, ProductLite, ProductView, SiteView, UserLite } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export function toUserLite(u: Any): UserLite | null {
  if (!u || typeof u !== "object" || !("firstName" in u)) return null;
  return { id: String(u._id), firstName: u.firstName, lastName: u.lastName };
}

export function toProductLite(p: Any): ProductLite | null {
  if (!p || typeof p !== "object" || !("name" in p)) return null;
  return { id: String(p._id), name: p.name, unit: p.unit, image: p.image ?? null, note: p.note ?? "" };
}

export function toProductView(p: Any): ProductView {
  return {
    id: String(p._id),
    name: p.name,
    unit: p.unit,
    image: p.image ?? null,
    note: p.note ?? "",
    createdAt: p.createdAt?.toISOString?.() ?? "",
    updatedAt: p.updatedAt?.toISOString?.() ?? "",
    createdBy: toUserLite(p.createdBy),
    updatedBy: toUserLite(p.updatedBy),
  };
}

export function toSiteView(s: Any): SiteView {
  const items: ItemView[] = (s.items ?? []).map((it: Any) => ({
    id: String(it._id),
    product: toProductLite(it.product),
    qty: it.qty,
    note: it.note ?? "",
    addedBy: toUserLite(it.addedBy),
    addedAt: it.addedAt?.toISOString?.() ?? "",
  }));
  return {
    id: String(s._id),
    name: s.name,
    address: s.address ?? "",
    location: s.location && typeof s.location.lat === "number" && typeof s.location.lng === "number" ? { lat: s.location.lat, lng: s.location.lng } : null,
    note: s.note ?? "",
    shareToken: s.shareToken,
    createdAt: s.createdAt?.toISOString?.() ?? "",
    updatedAt: s.updatedAt?.toISOString?.() ?? "",
    createdBy: toUserLite(s.createdBy),
    items,
  };
}
