"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { ExportSheet } from "@/components/ExportSheet";
import type { SiteView } from "@/lib/types";

export function DownloadImageButton({ site, className = "btn-ghost" }: { site: SiteView; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function download() {
    if (!ref.current || busy) return;
    setBusy(true);
    try {
      await document.fonts?.ready;
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true, backgroundColor: "#ffffff" });
      const a = document.createElement("a");
      const safe = site.name.replace(/[^\p{L}\p{N}\-_ ]/gu, "").trim().replace(/\s+/g, "_") || "royxat";
      a.href = dataUrl;
      a.download = `${safe}_imarat-log.png`;
      a.click();
    } catch (e) {
      console.error(e);
      alert("Rasm yaratishda xatolik yuz berdi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={download} disabled={busy} className={className}>
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        <span className="hidden sm:inline">Rasm yuklab olish</span><span className="sm:hidden">Rasm (PNG)</span>
      </button>
      {/* Ekrandan tashqarida render qilinadi */}
      <div style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }} aria-hidden>
        <div ref={ref}>
          <ExportSheet site={site} />
        </div>
      </div>
    </>
  );
}
