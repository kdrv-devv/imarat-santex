"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import { Field, ErrorText } from "@/components/ui/Field";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Login">
        <input name="username" className="input" placeholder="masalan: sardor" autoComplete="username" autoCapitalize="none" required />
      </Field>
      <Field label="Parol">
        <div className="relative">
          <input name="password" type={show ? "text" : "password"} className="input pr-11" placeholder="••••••••" autoComplete="current-password" required />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-text" aria-label="Parolni ko'rsatish">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>
      {state && !state.ok && <ErrorText>{state.error}</ErrorText>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3 text-base">
        {pending ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
        Kirish
      </button>
    </form>
  );
}
