"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import type { GeoPoint } from "@/lib/types";
import { pinIcon, PICKED_ZOOM, TILE_URL, TILE_ATTRIBUTION } from "./leaflet-setup";

/** Faqat ko'rish uchun kichik xarita: surish/zoom o'chirilgan */
export default function SiteMapInner({ point, height }: { point: GeoPoint; height: number }) {
  return (
    <MapContainer
      center={[point.lat, point.lng]}
      zoom={PICKED_ZOOM}
      style={{ height, width: "100%" }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      attributionControl
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <Marker position={[point.lat, point.lng]} icon={pinIcon} interactive={false} />
    </MapContainer>
  );
}
