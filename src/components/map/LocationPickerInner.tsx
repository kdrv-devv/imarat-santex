"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import { LocateFixed, Loader2, X } from "lucide-react";
import type { GeoPoint } from "@/lib/types";
import { pinIcon, DEFAULT_CENTER, DEFAULT_ZOOM, PICKED_ZOOM, TILE_URL, TILE_ATTRIBUTION } from "./leaflet-setup";

type Props = { value: GeoPoint | null; onChange: (v: GeoPoint | null) => void; height?: number };

function ClickHandler({ onPick }: { onPick: (p: GeoPoint) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/** Modal ochilganda konteyner o'lchami kech aniqlanadi, shuning uchun xaritani qayta hisoblaymiz */
function FixSize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function LocationPickerInner({ value, onChange, height = 260 }: Props) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  // Geolokatsiya so'rovi raqami: kechikkan yoki takroriy javoblarni e'tiborsiz qoldirish uchun.
  // Foydalanuvchi qo'lda nuqta tanlasa yoki olib tashlasa, so'rov bekor qilinadi.
  const geoReq = useRef(0);

  function pick(p: GeoPoint | null) {
    geoReq.current += 1; // faol geolokatsiya so'rovini bekor qiladi
    setLocating(false);
    onChange(p);
  }

  function locateMe() {
    if (!navigator.geolocation) return setGeoError("Brauzer joylashuvni qo'llab-quvvatlamaydi");
    const id = ++geoReq.current;
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (id !== geoReq.current) return; // eskirgan javob
        geoReq.current += 1; // shu so'rovdan boshqa javob kelsa ham qabul qilinmasin
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChange(p);
        mapRef.current?.flyTo([p.lat, p.lng], Math.max(mapRef.current.getZoom(), PICKED_ZOOM), { duration: 0.6 });
        setLocating(false);
      },
      () => {
        if (id !== geoReq.current) return;
        setGeoError("Joylashuvni aniqlab bo'lmadi. Ruxsat berilganini tekshiring.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-border" style={{ height }}>
        <MapContainer
          ref={mapRef}
          center={value ? [value.lat, value.lng] : DEFAULT_CENTER}
          zoom={value ? PICKED_ZOOM : DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          attributionControl
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <ClickHandler onPick={pick} />
          <FixSize />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={pinIcon}
              draggable
              eventHandlers={{ dragend: (e) => { const ll = e.target.getLatLng(); pick({ lat: ll.lat, lng: ll.lng }); } }}
            />
          )}
        </MapContainer>
        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          className="absolute top-2 right-2 z-[1000] btn-ghost !py-1.5 !px-2.5 text-xs shadow-md bg-surface"
          title="Mening joylashuvim"
        >
          {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />} Mening joyim
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span className="truncate">
          {value ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : "Xaritaga bosib nuqtani belgilang yoki “Mening joyim” ni bosing"}
        </span>
        {value && (
          <button type="button" onClick={() => pick(null)} className="inline-flex items-center gap-1 text-danger font-semibold shrink-0">
            <X size={12} /> Olib tashlash
          </button>
        )}
      </div>
      {geoError && <p className="text-xs text-danger">{geoError}</p>}
    </div>
  );
}
