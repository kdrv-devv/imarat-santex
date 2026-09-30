import Image from "next/image";

/** Header va sidebar uchun rasmli belgi (public/imarat-icon-removebg-preview.png) */
export function LogoImage({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/imarat-icon-removebg-preview.png"
      alt="Imarat"
      width={size}
      height={size}
      priority
      className="shrink-0 object-contain"
      style={{ width: size, height: size }}
    />
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoImage size={compact ? 34 : 42} />
      {!compact && (
        <div className="leading-tight">
          <div className="text-lg font-extrabold tracking-tight">
            Imarat<span className="text-primary">-log</span>
          </div>
          <div className="text-[11px] font-medium text-muted -mt-0.5">Santexnika hisob-kitobi</div>
        </div>
      )}
    </div>
  );
}
