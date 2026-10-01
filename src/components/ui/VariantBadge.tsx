/**
 * Qatorda mahsulot nomi yonida razmer belgisi: "Razmer: 32".
 * "Razmer" so'zi aniq yoziladi — sotuvchi raqamni miqdor yoki boshqa narsa bilan adashtirmasin.
 */
export function VariantBadge({ value, className = "" }: { value: string; className?: string }) {
  if (!value) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-accent/10 text-accent border border-accent/30 px-2 py-0.5 text-xs leading-tight align-middle whitespace-nowrap ${className}`}
      title={`Razmer: ${value}`}
    >
      <span className="font-semibold opacity-80">Razmer:</span>
      <span className="font-extrabold">{value}</span>
    </span>
  );
}
