export type UserLite = { id: string; firstName: string; lastName: string; avatar?: string | null };
export type ProductLite = { id: string; name: string; unit: string; image: string | null; note?: string; variants: string[] };
export type ProductView = ProductLite & {
  note: string;
  createdAt: string;
  updatedAt: string;
  createdBy: UserLite | null;
  updatedBy: UserLite | null;
};
export type ItemView = {
  id: string;
  product: ProductLite | null;
  qty: number;
  variant: string;
  note: string;
  addedBy: UserLite | null;
  addedAt: string;
};
export type GeoPoint = { lat: number; lng: number };
export type SiteView = {
  id: string;
  name: string;
  address: string;
  location: GeoPoint | null;
  note: string;
  shareToken: string;
  createdAt: string;
  updatedAt: string;
  createdBy: UserLite | null;
  items: ItemView[];
};
