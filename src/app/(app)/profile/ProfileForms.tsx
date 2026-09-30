"use client";

import { useState, useTransition } from "react";
import { Loader2, Lock, UserPen, Info } from "lucide-react";
import { Field, ErrorText } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { updateOwnProfileAction, changeCredentialsAction } from "@/lib/actions/users";
import type { CurrentUser } from "@/lib/auth";

export function ProfileForms({ user }: { user: CurrentUser }) {
  const { toast } = useToast();
  const admin = user.role === "SUPERADMIN";
  const [err1, setErr1] = useState<string | null>(null);
  const [err2, setErr2] = useState<string | null>(null);
  const [p1, start1] = useTransition();
  const [p2, start2] = useTransition();

  function saveInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setErr1(null);
    start1(async () => {
      const r = await updateOwnProfileAction({ firstName: String(fd.get("firstName")), lastName: String(fd.get("lastName")), phone: String(fd.get("phone")) });
      if (!r.ok) return setErr1(r.error);
      toast("Profil saqlandi");
    });
  }
  function saveCreds(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password && password !== confirm) return setErr2("Parollar mos kelmadi");
    setErr2(null);
    start2(async () => {
      const r = await changeCredentialsAction(user.id, { username: String(fd.get("username")), password: password || undefined });
      if (!r.ok) return setErr2(r.error);
      toast("Login/parol yangilandi");
      form.reset();
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={saveInfo} className="card p-5 md:p-6 space-y-4 animate-fade-up">
        <h3 className="font-bold flex items-center gap-2"><UserPen size={18} className="text-primary" /> Shaxsiy ma'lumotlar</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Ism"><input name="firstName" defaultValue={user.firstName} className="input" required /></Field>
          <Field label="Familiya"><input name="lastName" defaultValue={user.lastName} className="input" required /></Field>
        </div>
        <Field label="Telefon"><input name="phone" defaultValue={user.phone} className="input" placeholder="+998 90 123 45 67" /></Field>
        <ErrorText>{err1}</ErrorText>
        <div className="flex justify-end"><button disabled={p1} className="btn-primary">{p1 && <Loader2 size={16} className="animate-spin" />} Saqlash</button></div>
      </form>

      <div className="card p-5 md:p-6 space-y-4 animate-fade-up">
        <h3 className="font-bold flex items-center gap-2"><Lock size={18} className="text-primary" /> Login va parol</h3>
        {admin ? (
          <form onSubmit={saveCreds} className="space-y-3">
            <Field label="Login"><input name="username" defaultValue={user.username} className="input" autoCapitalize="none" /></Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Yangi parol"><input name="password" type="password" className="input" placeholder="O'zgartirmasangiz bo'sh qoldiring" autoComplete="new-password" /></Field>
              <Field label="Parolni takrorlang"><input name="confirm" type="password" className="input" autoComplete="new-password" /></Field>
            </div>
            <ErrorText>{err2}</ErrorText>
            <div className="flex justify-end"><button disabled={p2} className="btn-accent">{p2 && <Loader2 size={16} className="animate-spin" />} Yangilash</button></div>
          </form>
        ) : (
          <div className="flex items-start gap-3 text-sm text-text-2 bg-surface-2 rounded-xl p-4">
            <Info size={18} className="text-primary shrink-0 mt-0.5" />
            <div>Login yoki parolni o'zgartirish uchun <b>superadminga</b> murojaat qiling. Sizning loginingiz: <b className="text-text">@{user.username}</b></div>
          </div>
        )}
      </div>
    </div>
  );
}
