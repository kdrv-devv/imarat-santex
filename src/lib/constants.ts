export const UNITS = ["dona", "metr", "komplekt", "kg", "litr", "m²", "to'plam", "rulon"] as const;
export type Unit = (typeof UNITS)[number];
