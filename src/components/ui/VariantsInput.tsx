"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { MAX_VARIANTS, MAX_VARIANT_LEN, normalizeVariants } from "@/lib/constants";

type Props = { value: string[]; onChange: (v: string[]) => void; placeholder?: string };

/**
 * Razmerlar/variantlar uchun chip-input.
 * Yozib Enter yoki vergul bosilsa chip bo'ladi; bir nechtasini vergul bilan birga yozish ham mumkin ("32, 36, 40").
 */
export function VariantsInput({ value, onChange, placeholder = "masalan: 32, 36, 40" }: Props) {
  const [draft, setDraft] = useState("");

  function commit(text = draft) {
    const parts = text.split(/[,;\n]/);
    const next = normalizeVariants([...value, ...parts]);
    if (next.length !== value.length || next.some((v, i) => v !== value[i])) onChange(next);
    setDraft("");
  }
  function remove(v: string) {
    onChange(value.filter((x) => x !== v));
  }
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  const full = value.length >= MAX_VARIANTS;
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-lg bg-primary-3 text-primary text-sm font-bold pl-2.5 pr-1 py-1">
              {v}
              <button type="button" onClick={() => remove(v)} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-primary/15" aria-label={`${v} ni olib tashlash`}>
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_VARIANT_LEN * 4))}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && commit()}
          className="input"
          placeholder={full ? `Maksimum ${MAX_VARIANTS} ta` : placeholder}
          disabled={full}
          inputMode="text"
          autoCapitalize="none"
        />
        <button type="button" onClick={() => commit()} disabled={!draft.trim() || full} className="btn-ghost shrink-0 px-3" aria-label="Razmer qo'shish">
          <Plus size={16} />
        </button>
      </div>
      <p className="text-[11px] text-muted">Enter yoki vergul bilan ajrating. Obyektga qo'shishda shulardan bittasi tanlanadi.</p>
    </div>
  );
}
