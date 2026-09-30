import { Wrench } from "lucide-react";

export function ProductThumb({ src, name, size = 44, rounded = "rounded-xl" }: { src: string | null; name: string; size?: number; rounded?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={size} height={size} className={`${rounded} object-cover bg-white border border-border shrink-0`} style={{ width: size, height: size }} />;
  }
  return (
    <div className={`${rounded} bg-surface-2 border border-border text-muted flex items-center justify-center shrink-0`} style={{ width: size, height: size }}>
      <Wrench size={size * 0.42} />
    </div>
  );
}
