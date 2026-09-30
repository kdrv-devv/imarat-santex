import L from "leaflet";
import "leaflet/dist/leaflet.css";

/** Bundler'da Leaflet'ning standart marker rasmlari yo'qoladi, shuning uchun o'zimizning SVG pin */
export const pinIcon = L.divIcon({
  className: "imarat-pin",
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 43c-1 0-15-16-15-26a15 15 0 0 1 30 0c0 10-14 26-15 26z" fill="#c2410c" stroke="#ffffff" stroke-width="2.5"/>
    <circle cx="17" cy="17" r="6" fill="#ffffff"/>
  </svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
});

/** Toshkent markazi: joylashuv tanlanmagan bo'lsa shu yerdan boshlanadi */
export const DEFAULT_CENTER: [number, number] = [41.3111, 69.2797];
export const DEFAULT_ZOOM = 12;
export const PICKED_ZOOM = 16;

export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
