import type { GeoPoint } from "@/lib/types";

/**
 * Yandex Go (taksi) deep-link.
 * Telefonda ilova o'rnatilgan bo'lsa — ilova "Buyurtma" ekrani bilan ochiladi,
 * aks holda App Store / Play Market ga yo'naltiradi. Kompyuterda veb-versiya ochiladi.
 *
 * Rasmiy format:
 *   https://3.redirect.appmetrica.yandex.com/route?start-lat&start-lon&end-lat&end-lon&ref&appmetrica_tracking_id
 * `start-*` berilmasa Yandex Go jo'nash nuqtasi sifatida telefonning GPS joylashuvini o'zi oladi.
 */
const BASE = "https://3.redirect.appmetrica.yandex.com/route";
const TRACKING_ID = "1178268795219780156"; // Yandex'ning umumiy (public) tracking ID'si
const REF = "imaratlog";

export function yandexTaxiUrl(to: GeoPoint, from?: GeoPoint | null): string {
  const q = new URLSearchParams();
  if (from) {
    q.set("start-lat", from.lat.toFixed(6));
    q.set("start-lon", from.lng.toFixed(6));
  }
  q.set("end-lat", to.lat.toFixed(6));
  q.set("end-lon", to.lng.toFixed(6));
  q.set("ref", REF);
  q.set("appmetrica_tracking_id", TRACKING_ID);
  return `${BASE}?${q.toString()}`;
}
