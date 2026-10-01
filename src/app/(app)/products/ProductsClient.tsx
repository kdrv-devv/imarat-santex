"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, ImagePlus, X, Package, Building2 } from "lucide-react";
import { TimeAgo } from "@/components/TimeAgo";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { Field, ErrorText } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { VariantsInput } from "@/components/ui/VariantsInput";
import { useToast } from "@/components/ui/Toast";
import { UNITS } from "@/lib/constants";
import { compressImage } from "@/lib/image-client";
import { createProductAction, deleteProductAction, updateProductAction } from "@/lib/actions/products";
import { formatDate } from "@/lib/format";
import type { ProductView } from "@/lib/types";

type Props = { products: ProductView[]; usage: Record<string, number>; isAdmin: boolean; currentUserId: string };

export function ProductsClient({ products, usage, isAdmin, currentUserId }: Props) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<ProductView | null | "new">(null);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? products.filter((p) => p.name.toLowerCase().includes(s)) : products;
  }, [q, products]);

  return (
    <>
      <PageHeader
        title="Mahsulotlar"
        subtitle={`${products.length} ta mahsulot bazada`}
        action={<button onClick={() => setEditing("new")} className="btn-primary"><Plus size={18} /> <span className="hidden sm:inline">Yangi mahsulot</span><span className="sm:hidden">Yangi</span></button>}
      />

      {products.length > 0 && (
        <div className="relative mb-4 animate-fade-up">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-11 py-3" placeholder="Qidirish: truba, tirsak, kran..." />
          {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"><X size={16} /></button>}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState image="/maxsulot-bosh.png" title="Mahsulotlar bazasi bo'sh" text="Bir marta qo'shib qo'ying — keyin istalgan obyektga bir bosishda kiritasiz."
          action={<button onClick={() => setEditing("new")} className="btn-primary"><Plus size={18} /> Mahsulot qo'shish</button>} />
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted">“{q}” bo'yicha hech narsa topilmadi</div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p, i) => (
            <button key={p.id} onClick={() => setEditing(p)} className="card card-hover p-3 text-left flex flex-col gap-3 animate-fade-up group" style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}>
              <div className="relative">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} className="w-full aspect-square object-cover rounded-xl bg-white border border-border" />
                ) : (
                  <div className="w-full aspect-square rounded-xl bg-surface-2 border border-border flex items-center justify-center text-muted">
                    <Package size={36} />
                  </div>
                )}
                <span className="absolute top-2 left-2 badge bg-surface/95 text-text-2 border border-border text-[11px]">{p.unit}</span>
                <span className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface/95 border border-border text-text-2 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={13} /></span>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm leading-tight truncate">{p.name}</div>
                {p.variants.length > 0 && (
                  <div className="text-[11px] text-text-2 mt-0.5 truncate" title={p.variants.join(", ")}>
                    <span className="text-muted">Razmer:</span> {p.variants.join(" · ")}
                  </div>
                )}
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted">
                  <span className="flex items-center gap-1"><Building2 size={11} /> {usage[p.id] ?? 0} obyektda</span>
                  {isAdmin && p.createdBy && (
                    <span className="flex items-center gap-1" title={`Qo'shdi: ${p.createdBy.firstName} ${p.createdBy.lastName} · ${formatDate(p.createdAt, true)}`}>
                      <Avatar firstName={p.createdBy.firstName} lastName={p.createdBy.lastName} size={14} src={p.createdBy.avatar} />
                      {p.createdBy.id === currentUserId ? "Siz" : p.createdBy.firstName}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <ProductModal key={editing === "new" ? "new" : editing?.id ?? "none"} product={editing === "new" ? null : editing} open={editing !== null} onClose={() => setEditing(null)} isAdmin={isAdmin} usage={editing && editing !== "new" ? usage[editing.id] ?? 0 : 0} />
    </>
  );
}

function ProductModal({ product, open, onClose, isAdmin, usage }: { product: ProductView | null; open: boolean; onClose: () => void; isAdmin: boolean; usage: number }) {
  const { toast } = useToast();
  const [name, setName] = useState(product?.name ?? "");
  const [unit, setUnit] = useState<string>(product?.unit ?? "dona");
  const [note, setNote] = useState(product?.note ?? "");
  const [variants, setVariants] = useState<string[]>(product?.variants ?? []);
  // preview: ko'rsatiladigan rasm (mavjud URL yoki yangi faylning object URL'i)
  const [preview, setPreview] = useState<string | null>(product?.image ?? null);
  // newFile: Cloudinary'ga yuboriladigan siqilgan rasm; removed: mavjud rasm olib tashlansin
  const [newFile, setNewFile] = useState<Blob | null>(null);
  const [removed, setRemoved] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImgBusy(true);
    setError(null);
    try {
      const blob = await compressImage(f);
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setNewFile(blob);
      setRemoved(false);
      setPreview(URL.createObjectURL(blob));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setImgBusy(false);
      e.target.value = "";
    }
  }

  function removeImage() {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setNewFile(null);
    setRemoved(!!product?.image);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("unit", unit);
      fd.set("note", note);
      for (const v of variants) fd.append("variants", v);
      if (newFile) {
        fd.set("imageAction", "replace");
        fd.set("image", newFile, "product.jpg");
      } else if (removed) {
        fd.set("imageAction", "remove");
      } else {
        fd.set("imageAction", "keep");
      }
      const r = product ? await updateProductAction(product.id, fd) : await createProductAction(fd);
      if (!r.ok) return setError(r.error);
      toast(product ? "Mahsulot yangilandi" : "Mahsulot qo'shildi");
      onClose();
    });
  }

  function del() {
    if (!product) return;
    start(async () => {
      const r = await deleteProductAction(product.id);
      if (!r.ok) { setConfirm(false); return setError(r.error); }
      toast("Mahsulot o'chirildi");
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={product ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-4">
          <div className="shrink-0">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={imgBusy}
              className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-border-strong hover:border-primary/60 overflow-hidden flex items-center justify-center text-muted hover:text-primary transition-colors bg-bg-2">
              {imgBusy ? <Loader2 size={22} className="animate-spin" /> : preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="w-full h-full object-cover bg-white" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-xs font-semibold"><ImagePlus size={22} /> Rasm</div>
              )}
            </button>
            {preview && (
              <button type="button" onClick={removeImage} className="text-[11px] text-danger font-semibold mt-1.5 w-full text-center">Rasmni olib tashlash</button>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <Field label="Nomi"><input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="masalan: Tirsak 20mm" autoFocus required /></Field>
            <Field label="O'lchov birligi">
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input">
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <Field label="Razmerlar / variantlar (ixtiyoriy)" plain>
          <VariantsInput value={variants} onChange={setVariants} />
        </Field>
        <Field label="Izoh (ixtiyoriy)"><input value={note} onChange={(e) => setNote(e.target.value)} className="input" placeholder="Brend, rang..." /></Field>

        {product && isAdmin && (
          <div className="text-xs text-muted rounded-xl bg-surface-2 px-3 py-2 space-y-0.5">
            {product.createdBy && <div>Qo'shdi: <b className="text-text-2">{product.createdBy.firstName} {product.createdBy.lastName}</b> · <TimeAgo date={product.createdAt} /></div>}
            {product.updatedBy && product.updatedAt !== product.createdAt && <div>O'zgartirdi: <b className="text-text-2">{product.updatedBy.firstName} {product.updatedBy.lastName}</b> · <TimeAgo date={product.updatedAt} /></div>}
            <div>{usage} ta obyektda ishlatilgan</div>
          </div>
        )}

        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2 justify-between pt-1">
          <div>
            {product && isAdmin && (
              <button type="button" onClick={() => setConfirm(true)} className="btn-danger"><Trash2 size={16} /> <span className="hidden sm:inline">O'chirish</span></button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Bekor</button>
            <button type="submit" disabled={pending || imgBusy} className="btn-primary">{pending && <Loader2 size={16} className="animate-spin" />} Saqlash</button>
          </div>
        </div>
      </form>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Mahsulotni o'chirish" size="sm"
        footer={<><button onClick={() => setConfirm(false)} className="btn-ghost">Bekor</button><button onClick={del} disabled={pending} className="btn-danger">O'chirish</button></>}>
        <p className="text-sm text-text-2"><b>{product?.name}</b> bazadan o'chirilsinmi? {usage > 0 && <span className="text-warning">Bu mahsulot {usage} ta obyektda bor — avval ulardan olib tashlash kerak.</span>}</p>
      </Modal>
    </Modal>
  );
}
