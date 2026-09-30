const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const pad = (n: number) => String(n).padStart(2, "0");

export function formatDate(d: string | Date | null | undefined, withTime = false) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const base = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  return withTime ? `${base}, ${pad(date.getHours())}:${pad(date.getMinutes())}` : base;
}

export function timeAgo(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "hozirgina";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} kun oldin`;
  return formatDate(date);
}

export function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

export function formatQty(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}
