"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, ErrorText } from "@/components/ui/Field";
import { createObjectAction } from "@/lib/actions/objects";
import { useToast } from "@/components/ui/Toast";
import { LocationPicker } from "@/components/map/LocationPicker";
import type { GeoPoint } from "@/lib/types";

export function NewObjectButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const res = await createObjectAction({
        name: String(fd.get("name")),
        address: String(fd.get("address") ?? ""),
        note: String(fd.get("note") ?? ""),
        location,
      });
      if (!res.ok) return setError(res.error);
      toast("Obyekt yaratildi");
      setOpen(false);
      setLocation(null);
      router.push(`/objects/${res.id}`);
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={18} /> <span className="hidden sm:inline">Yangi obyekt</span><span className="sm:hidden">Yangi</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Yangi obyekt">
        <form onSubmit={submit} className="space-y-4" id="new-object-form">
          <Field label="Obyekt nomi">
            <input name="name" className="input" placeholder="masalan: Yunusobod, 4-uy" autoFocus required />
          </Field>
          <Field label="Manzil (ixtiyoriy)">
            <input name="address" className="input" placeholder="Ko'cha, uy, xonadon" />
          </Field>
          <Field label="Xaritadagi joylashuv (ixtiyoriy)" plain>
            <LocationPicker value={location} onChange={setLocation} height={220} />
          </Field>
          <Field label="Izoh (ixtiyoriy)">
            <textarea name="note" className="input min-h-20 resize-none" placeholder="Qo'shimcha ma'lumot" />
          </Field>
          <ErrorText>{error}</ErrorText>
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Bekor</button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending && <Loader2 size={16} className="animate-spin" />} Yaratish
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
