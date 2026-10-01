"use client";

import { useState, useTransition } from "react";
import { Plus, KeyRound, Pencil, UserX, UserCheck, Loader2, Phone, Users, Eye, EyeOff, Shuffle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { Field, ErrorText } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";
import { changeCredentialsAction, createEmployeeAction, deleteEmployeeAction, updateEmployeeAction } from "@/lib/actions/users";

export type EmployeeView = {
  id: string; firstName: string; lastName: string; phone: string; username: string; avatar: string | null;
  role: "SUPERADMIN" | "EMPLOYEE"; active: boolean; createdAt: string; sites: number; products: number;
};

function genPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function EmployeesClient({ users, meId }: { users: EmployeeView[]; meId: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeView | null>(null);
  const [creds, setCreds] = useState<EmployeeView | null>(null);
  const employees = users.filter((u) => u.role !== "SUPERADMIN");
  const admins = users.filter((u) => u.role === "SUPERADMIN");

  return (
    <>
      <PageHeader title="Hodimlar" subtitle={`${employees.filter((e) => e.active).length} faol hodim`}
        action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus size={18} /> <span className="hidden sm:inline">Hodim qo'shish</span><span className="sm:hidden">Qo'shish</span></button>} />

      <div className="space-y-6">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 px-1">Superadmin</h3>
          <div className="card divide-y divide-border overflow-hidden">
            {admins.map((u) => <Row key={u.id} u={u} me={u.id === meId} onEdit={() => setEditing(u)} onCreds={() => setCreds(u)} />)}
          </div>
        </section>
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 px-1">Hodimlar</h3>
          {employees.length === 0 ? (
            <EmptyState icon={Users} title="Hodimlar yo'q" text="Hodim qo'shing — u uchun login va parol yaratib berasiz."
              action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus size={18} /> Hodim qo'shish</button>} />
          ) : (
            <div className="card divide-y divide-border overflow-hidden">
              {employees.map((u) => <Row key={u.id} u={u} me={false} onEdit={() => setEditing(u)} onCreds={() => setCreds(u)} />)}
            </div>
          )}
        </section>
      </div>

      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
      {editing && <EditModal key={editing.id} u={editing} me={editing.id === meId} onClose={() => setEditing(null)} />}
      {creds && <CredsModal key={creds.id} u={creds} onClose={() => setCreds(null)} />}
    </>
  );
}

function Row({ u, me, onEdit, onCreds }: { u: EmployeeView; me: boolean; onEdit: () => void; onCreds: () => void }) {
  return (
    <div className={`flex items-center gap-3 p-3 md:px-4 ${!u.active ? "opacity-50" : ""}`}>
      <Avatar firstName={u.firstName} lastName={u.lastName} size={42} src={u.avatar} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate flex items-center gap-2">
          {u.firstName} {u.lastName}
          {me && <span className="badge-accent">Siz</span>}
          {!u.active && <span className="badge-danger">Faol emas</span>}
        </div>
        <div className="text-xs text-muted flex items-center gap-2 flex-wrap">
          <span>@{u.username}</span>
          <span className="flex items-center gap-1"><Phone size={11} /> {u.phone}</span>
          <span className="hidden sm:inline">· {u.sites} obyekt · {u.products} mahsulot</span>
          <span className="hidden md:inline">· {formatDate(u.createdAt)}</span>
        </div>
      </div>
      <button onClick={onCreds} className="btn-icon btn-ghost" title="Login/parol"><KeyRound size={16} /></button>
      <button onClick={onEdit} className="btn-icon btn-ghost" title="Tahrirlash"><Pencil size={16} /></button>
    </div>
  );
}

function CreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState(genPassword());
  const [show, setShow] = useState(true);
  const [pending, start] = useTransition();
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const r = await createEmployeeAction({
        firstName: String(fd.get("firstName")), lastName: String(fd.get("lastName")), phone: String(fd.get("phone")),
        username: String(fd.get("username")), password,
      });
      if (!r.ok) return setError(r.error);
      toast("Hodim yaratildi");
      setPassword(genPassword());
      onClose();
    });
  }
  return (
    <Modal open={open} onClose={onClose} title="Yangi hodim">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ism"><input name="firstName" className="input" autoFocus required /></Field>
          <Field label="Familiya"><input name="lastName" className="input" required /></Field>
        </div>
        <Field label="Telefon"><input name="phone" className="input" placeholder="+998 90 123 45 67" required /></Field>
        <div className="border-t border-border pt-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-muted">Kirish ma'lumotlari</div>
          <Field label="Login" hint="Kichik harf, raqam, _ yoki . (3-30 belgi)"><input name="username" className="input" autoCapitalize="none" placeholder="masalan: sardor" required /></Field>
          <Field label="Parol">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} className="input pr-10 font-mono" required />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <button type="button" onClick={() => setPassword(genPassword())} className="btn-ghost px-3" title="Tasodifiy parol"><Shuffle size={16} /></button>
            </div>
          </Field>
          <p className="text-xs text-muted">Login va parolni hodimga yozib bering — u keyin o'zi o'zgartira olmaydi.</p>
        </div>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">Bekor</button>
          <button type="submit" disabled={pending} className="btn-primary">{pending && <Loader2 size={16} className="animate-spin" />} Yaratish</button>
        </div>
      </form>
    </Modal>
  );
}

function EditModal({ u, me, onClose }: { u: EmployeeView; me: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await updateEmployeeAction(u.id, { firstName: String(fd.get("firstName")), lastName: String(fd.get("lastName")), phone: String(fd.get("phone")) });
      if (!r.ok) return setError(r.error);
      toast("Saqlandi");
      onClose();
    });
  }
  function toggleActive() {
    start(async () => {
      const r = u.active ? await deleteEmployeeAction(u.id) : await updateEmployeeAction(u.id, { firstName: u.firstName, lastName: u.lastName, phone: u.phone, active: true });
      if (!r.ok) return setError(r.error);
      toast(u.active ? "Hodim faolsizlantirildi" : "Hodim qayta faollashtirildi");
      onClose();
    });
  }
  return (
    <Modal open onClose={onClose} title="Hodimni tahrirlash">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ism"><input name="firstName" defaultValue={u.firstName} className="input" required /></Field>
          <Field label="Familiya"><input name="lastName" defaultValue={u.lastName} className="input" required /></Field>
        </div>
        <Field label="Telefon"><input name="phone" defaultValue={u.phone} className="input" required /></Field>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2 justify-between">
          <div>
            {!me && u.role !== "SUPERADMIN" && (
              <button type="button" onClick={toggleActive} disabled={pending} className={u.active ? "btn-danger" : "btn-ghost text-success"}>
                {u.active ? <UserX size={16} /> : <UserCheck size={16} />} {u.active ? "Faolsizlantirish" : "Faollashtirish"}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Bekor</button>
            <button type="submit" disabled={pending} className="btn-primary">{pending && <Loader2 size={16} className="animate-spin" />} Saqlash</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function CredsModal({ u, onClose }: { u: EmployeeView; onClose: () => void }) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState(u.username);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(true);
  const [pending, start] = useTransition();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await changeCredentialsAction(u.id, { username, password: password || undefined });
      if (!r.ok) return setError(r.error);
      toast("Login/parol yangilandi");
      onClose();
    });
  }
  return (
    <Modal open onClose={onClose} title={`Login/parol — ${u.firstName} ${u.lastName}`} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Login"><input value={username} onChange={(e) => setUsername(e.target.value)} className="input" autoCapitalize="none" /></Field>
        <Field label="Yangi parol" hint="O'zgartirmasangiz bo'sh qoldiring">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} className="input pr-10 font-mono" autoComplete="new-password" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <button type="button" onClick={() => setPassword(genPassword())} className="btn-ghost px-3" title="Tasodifiy parol"><Shuffle size={16} /></button>
          </div>
        </Field>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">Bekor</button>
          <button type="submit" disabled={pending} className="btn-accent">{pending && <Loader2 size={16} className="animate-spin" />} Yangilash</button>
        </div>
      </form>
    </Modal>
  );
}
