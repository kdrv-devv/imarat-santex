"use client";

import { useState, useSyncExternalStore } from "react";
import { Download, Share, PlusSquare, MoreVertical } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

/** Chrome/Edge/Samsung Internet beradigan o'rnatish hodisasi (standart tipda yo'q) */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    /** layout.tsx dagi inline skript saqlab qo'yadi */
    __pwaInstallEvent?: BeforeInstallPromptEvent | null;
    __pwaInstalled?: boolean;
  }
}

type ClientEnv = { standalone: boolean; ios: boolean };
let cachedEnv: ClientEnv | null = null;

/** Brauzer muhitini bir marta aniqlaydi (SSR'da null, hydration mos kelishi uchun) */
function getClientEnv(): ClientEnv | null {
  if (typeof window === "undefined") return null;
  if (!cachedEnv) {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    cachedEnv = { standalone, ios };
  }
  return cachedEnv;
}
const noopSubscribe = () => () => {};

/** Inline skript saqlagan hodisa va "o'rnatildi" holatiga obuna */
function subscribeInstall(cb: () => void) {
  window.addEventListener("pwa-install-change", cb);
  return () => window.removeEventListener("pwa-install-change", cb);
}
const getInstallEvent = () => window.__pwaInstallEvent ?? null;
const getInstalled = () => window.__pwaInstalled === true;

/**
 * "Ilovani o'rnatish" tugmasi.
 * - Android/Chrome: brauzerning o'z o'rnatish oynasini chiqaradi.
 * - iOS/Safari: dasturiy o'rnatish yo'q, shuning uchun ko'rsatma ko'rsatadi.
 * - Ilova allaqachon o'rnatilgan (standalone) bo'lsa, tugma umuman chiqmaydi.
 */
export function InstallAppButton({ className = "btn-ghost", full = false }: { className?: string; full?: boolean }) {
  const env = useSyncExternalStore(noopSubscribe, getClientEnv, () => null);
  const deferred = useSyncExternalStore(subscribeInstall, getInstallEvent, () => null);
  const installed = useSyncExternalStore(subscribeInstall, getInstalled, () => false);
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);

  const visible = !!env && !env.standalone && !installed;
  const isIOS = env?.ios ?? false;
  if (!visible) return null;

  async function install() {
    if (deferred) {
      setBusy(true);
      try {
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        // Hodisa bir martalik: ishlatilgandan keyin tozalaymiz
        window.__pwaInstallEvent = null;
        if (outcome === "accepted") window.__pwaInstalled = true;
        window.dispatchEvent(new Event("pwa-install-change"));
      } finally {
        setBusy(false);
      }
      return;
    }
    setHelp(true);
  }

  return (
    <>
      <button type="button" onClick={install} disabled={busy} className={`${className} ${full ? "w-full" : ""}`}>
        <Download size={18} /> Ilovani o'rnatish
      </button>
      <Modal open={help} onClose={() => setHelp(false)} title="Telefonga o'rnatish" size="sm">
        {isIOS ? (
          <ol className="space-y-3 text-sm text-text-2">
            <li className="flex gap-3"><span className="badge-primary shrink-0">1</span><span>Safari'da pastdagi <b className="inline-flex items-center gap-1 text-text"><Share size={14} /> Ulashish</b> tugmasini bosing.</span></li>
            <li className="flex gap-3"><span className="badge-primary shrink-0">2</span><span>Ro'yxatdan <b className="inline-flex items-center gap-1 text-text"><PlusSquare size={14} /> Uy ekraniga qo'shish</b> (Add to Home Screen) ni tanlang.</span></li>
            <li className="flex gap-3"><span className="badge-primary shrink-0">3</span><span>Yuqori o'ng burchakdagi <b className="text-text">Qo'shish</b> ni bosing. Ilova uy ekranida paydo bo'ladi.</span></li>
          </ol>
        ) : (
          <div className="space-y-3 text-sm text-text-2">
            <p>Ilova allaqachon o'rnatilgan bo'lsa, uni uy ekranidan oching. Aks holda qo'lda o'rnating:</p>
            <ol className="space-y-3">
              <li className="flex gap-3"><span className="badge-primary shrink-0">1</span><span>Brauzer menyusini oching: yuqori o'ng burchakdagi <b className="inline-flex items-center gap-1 text-text"><MoreVertical size={14} /> uch nuqta</b>.</span></li>
              <li className="flex gap-3"><span className="badge-primary shrink-0">2</span><span><b className="text-text">Ilovani o'rnatish</b> yoki <b className="text-text">Uy ekraniga qo'shish</b> bandini tanlang.</span></li>
            </ol>
          </div>
        )}
        <p className="text-xs text-muted mt-4">Ilova internet orqali ishlaydi, lekin oddiy ilova kabi o'z belgisi bilan ochiladi.</p>
      </Modal>
    </>
  );
}
