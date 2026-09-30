"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { GeoPoint } from "@/lib/types";

/** Leaflet faqat brauzerda ishlaydi, shuning uchun SSR'siz yuklaymiz */
const Inner = dynamic(() => import("./LocationPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-border bg-surface-2 flex items-center justify-center text-muted" style={{ height: 260 }}>
      <Loader2 size={20} className="animate-spin" />
    </div>
  ),
});

export function LocationPicker(props: { value: GeoPoint | null; onChange: (v: GeoPoint | null) => void; height?: number }) {
  return <Inner {...props} />;
}
