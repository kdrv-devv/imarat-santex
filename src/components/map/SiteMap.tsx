"use client";

import dynamic from "next/dynamic";
import { Navigation } from "lucide-react";
import type { GeoPoint } from "@/lib/types";

const Inner = dynamic(() => import("./SiteMapInner"), {
  ssr: false,
  loading: () => <div className="w-full bg-surface-2 animate-pulse" style={{ height: 160 }} />,
});

/** Navigatsiya havolalari: telefonda tegishli ilova ochiladi */
export function navLinks(p: GeoPoint) {
  const ll = `${p.lat},${p.lng}`;
  return {
    yandex: `https://yandex.uz/maps/?rtext=~${ll}&rtt=auto`,
    google: `https://www.google.com/maps/dir/?api=1&destination=${ll}`,
  };
}

/**
 * Obyekt joylashuvi: kichik xarita + "Yo'l ko'rsat" tugmalari.
 * Xaritaning o'zi bosilganda ham Google Maps ochiladi.
 */
export function SiteMap({ point, height = 160, className = "" }: { point: GeoPoint; height?: number; className?: string }) {
  const links = navLinks(point);
  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <a href={links.google} target="_blank" rel="noopener noreferrer" className="block relative" aria-label="Xaritada ochish">
        <Inner point={point} height={height} />
      </a>
      <div className="flex gap-2 p-2 bg-surface border-t border-border">
        <a href={links.yandex} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 !py-2 text-sm">
          <Navigation size={15} /> Yandex
        </a>
        <a href={links.google} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1 !py-2 text-sm">
          <Navigation size={15} /> Google Maps
        </a>
      </div>
    </div>
  );
}
