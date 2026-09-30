"use client";

import { useState, useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton({ variant = "icon" }: { variant?: "icon" | "full" }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  function confirm() {
    start(async () => {
      await logoutAction();
    });
  }
  return (
    <>
      {variant === "icon" ? (
        <button onClick={() => setOpen(true)} className="btn-icon bg-transparent border-0 text-muted hover:bg-surface-3 hover:text-danger" title="Chiqish" aria-label="Chiqish">
          <LogOut size={18} />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-ghost w-full text-danger">
          <LogOut size={16} /> Chiqish
        </button>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tizimdan chiqish"
        size="sm"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-ghost">Bekor</button>
            <button onClick={confirm} disabled={pending} className="btn-danger">
              {pending && <Loader2 size={16} className="animate-spin" />} Ha, chiqish
            </button>
          </>
        }
      >
        <p className="text-sm text-text-2">Rostdan ham tizimdan chiqmoqchimisiz? Qayta kirish uchun login va parol kerak bo'ladi.</p>
      </Modal>
    </>
  );
}
