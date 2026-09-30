"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type Toast = { id: number; kind: "success" | "error"; text: string };
const Ctx = createContext<{ toast: (text: string, kind?: Toast["kind"]) => void }>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const toast = useCallback((text: string, kind: Toast["kind"] = "success") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, kind, text }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3500);
  }, []);
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[var(--z-toast)] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto card px-4 py-3 shadow-lg flex items-center gap-3 text-sm animate-fade-up border ${
              t.kind === "success" ? "border-success/40" : "border-danger/40"
            }`}
          >
            {t.kind === "success" ? <CheckCircle2 size={18} className="text-success shrink-0" /> : <AlertCircle size={18} className="text-danger shrink-0" />}
            <span className="flex-1">{t.text}</span>
            <button onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))} className="text-muted hover:text-text">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
