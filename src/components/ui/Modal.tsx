"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open, onClose, title, children, footer, size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg";
  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-start sm:items-center justify-center p-3 sm:p-6" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-[oklch(0.2_0.02_260/0.45)]" onClick={onClose} />
      <div
        className={`relative w-full ${width} card animate-pop flex flex-col overflow-hidden`}
        style={{ maxHeight: "calc(100dvh - 1.5rem)", boxShadow: "var(--shadow-lg)" }}
      >
        <div className="flex items-center justify-between pl-5 pr-3 py-3 border-b border-border shrink-0">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} className="btn-icon bg-transparent border-0 text-muted hover:bg-surface-2 hover:text-text" aria-label="Yopish">
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-border flex gap-2 justify-end shrink-0 bg-surface">{footer}</div>}
      </div>
    </div>
  );
}
