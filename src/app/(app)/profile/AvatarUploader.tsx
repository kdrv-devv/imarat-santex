"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { compressImage } from "@/lib/image-client";
import { updateOwnAvatarAction } from "@/lib/actions/users";
import type { CurrentUser } from "@/lib/auth";

/**
 * Profil rasmi: bosilganda fayl tanlanadi, brauzerda siqiladi (max 512px) va darhol serverga yuboriladi.
 * Yuklanayotganda lokal preview ko'rsatiladi.
 */
export function AvatarUploader({ user }: { user: CurrentUser }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const working = busy || pending;
  const src = preview ?? user.avatar;

  function clearPreview() {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    let blob: Blob;
    try {
      blob = await compressImage(f, 512, 0.85);
    } catch (err) {
      setBusy(false);
      return toast((err as Error).message, "error");
    }
    clearPreview();
    setPreview(URL.createObjectURL(blob));
    setBusy(false);
    start(async () => {
      const fd = new FormData();
      fd.set("imageAction", "replace");
      fd.set("image", blob, "avatar.jpg");
      const r = await updateOwnAvatarAction(fd);
      if (!r.ok) { clearPreview(); return toast(r.error, "error"); }
      toast("Profil rasmi yangilandi");
    });
  }

  function remove() {
    start(async () => {
      const fd = new FormData();
      fd.set("imageAction", "remove");
      const r = await updateOwnAvatarAction(fd);
      if (!r.ok) return toast(r.error, "error");
      clearPreview();
      toast("Profil rasmi olib tashlandi");
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={working}
          className="relative block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] group"
          title="Profil rasmini o'zgartirish"
          aria-label="Profil rasmini o'zgartirish"
        >
          <Avatar firstName={user.firstName} lastName={user.lastName} size={96} src={src} className={working ? "opacity-60" : ""} />
          {working && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full">
              <Loader2 size={26} className="animate-spin text-primary" />
            </span>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full bg-primary-2 text-primary-ink border-[3px] border-surface flex items-center justify-center shadow-md group-hover:bg-primary transition-colors">
            <Camera size={16} />
          </span>
        </button>
      </div>
      {src && !working && (
        <button type="button" onClick={remove} className="inline-flex items-center gap-1 text-xs text-danger font-semibold">
          <Trash2 size={12} /> Rasmni olib tashlash
        </button>
      )}
    </div>
  );
}
