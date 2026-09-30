type FieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: string;
  /**
   * true bo'lsa <label> o'rniga <div> ishlatiladi. Ichida input emas, xarita kabi
   * murakkab element bo'lsa shart: <label> ichiga bosilganda brauzer birinchi tugmani
   * avtomatik "bosib" yuboradi.
   */
  plain?: boolean;
};

export function Field({ label, children, hint, plain = false }: FieldProps) {
  const Tag = plain ? "div" : "label";
  return (
    <Tag className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted mt-1">{hint}</span>}
    </Tag>
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null;
  return <p className="text-sm text-danger bg-danger-bg border border-danger/25 rounded-xl px-3 py-2">{children}</p>;
}
