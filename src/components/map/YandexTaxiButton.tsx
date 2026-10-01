"use client";

import { useRef, useState } from "react";
import { CarTaxiFront, Loader2 } from "lucide-react";
import type { GeoPoint } from "@/lib/types";
import { yandexTaxiUrl } from "./yandex-taxi";

type Props = { to: GeoPoint; className?: string; label?: string };

/**
 * "Yandex Go" tugmasi: bosilganda foydalanuvchining HOZIRGI joyi (do'kon, ofis...) dan
 * obyektgacha marshrut kiritilgan holda Yandex Go ochiladi.
 *
 * Oqim:
 *  1. Bosish paytida (user gesture ichida) bo'sh tab ochib qo'yamiz — keyin async ravishda
 *     URL berilsa ham brauzer popup-blocker uni to'smaydi.
 *  2. Geolokatsiya so'raymiz. Muvaffaqiyatli bo'lsa start+end, bo'lmasa faqat end bilan
 *     ochamiz — bu holda Yandex Go jo'nash nuqtasini o'zi GPS'dan oladi.
 */
export function YandexTaxiButton({ to, className = "", label = "Yandex Go taksi" }: Props) {
  const [locating, setLocating] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const req = useRef(0);

  function go(win: Window | null, url: string) {
    if (win && !win.closed) win.location.href = url;
    else window.location.href = url;
  }

  function order() {
    if (locating) return;
    setHint(null);
    const id = ++req.current;

    // Geolokatsiya yo'q (eski brauzer / http) — manzilni berib yuboramiz, jo'nash nuqtasini Yandex o'zi aniqlaydi
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      window.open(yandexTaxiUrl(to), "_blank", "noopener");
      return;
    }

    const win = window.open("about:blank", "_blank");
    setLocating(true);

    const finish = (from: GeoPoint | null, msg: string | null) => {
      if (id !== req.current) return;
      setLocating(false);
      setHint(msg);
      go(win, yandexTaxiUrl(to, from));
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => finish({ lat: pos.coords.latitude, lng: pos.coords.longitude }, null),
      () => finish(null, "Joylashuvingiz aniqlanmadi — Yandex Go'da jo'nash nuqtasini o'zingiz tanlang."),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  }

  return (
    <div className={className}>
      <button type="button" onClick={order} disabled={locating} className="btn-accent w-full !py-2.5 text-sm">
        {locating ? <Loader2 size={16} className="animate-spin" /> : <CarTaxiFront size={16} />}
        {locating ? "Joylashuv aniqlanmoqda..." : label}
      </button>
      {hint && <p className="text-[11px] text-muted mt-1.5 text-center leading-snug">{hint}</p>}
    </div>
  );
}
