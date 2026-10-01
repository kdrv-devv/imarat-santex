export const UNITS = ["dona", "metr", "komplekt", "kg", "litr", "m²", "to'plam", "rulon"] as const;
export type Unit = (typeof UNITS)[number];

export const MAX_VARIANTS = 40;
export const MAX_VARIANT_LEN = 24;

/** Razmerlar ro'yxatini tozalaydi: trim, bo'shlarni va takrorlarni olib tashlash, uzunlik cheklovi */
export function normalizeVariants(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of list) {
    const v = String(raw ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_VARIANT_LEN);
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
    if (out.length >= MAX_VARIANTS) break;
  }
  return out;
}
