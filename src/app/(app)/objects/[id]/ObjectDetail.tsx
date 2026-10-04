"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Share2, Plus, Trash2, Minus, Search, Pencil, Loader2, Check, Copy, Package, ExternalLink, StickyNote, CarTaxiFront, X,
} from "lucide-react";
import { TimeAgo } from "@/components/TimeAgo";
import { Modal } from "@/components/ui/Modal";
import { Field, ErrorText } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductThumb } from "@/components/ProductThumb";
import { DownloadImageButton } from "@/components/DownloadImageButton";
import { useToast } from "@/components/ui/Toast";
import {formatDate, formatQty} from "@/lib/format";
import { UNITS } from "@/lib/constants";
import { addItemAction, addItemsAction, deleteObjectAction, removeItemAction, updateItemAction, updateObjectAction } from "@/lib/actions/objects";
import { createProductAction } from "@/lib/actions/products";
import type { GeoPoint, ProductLite, SiteView } from "@/lib/types";
import { LocationPicker } from "@/components/map/LocationPicker";
import { SiteMap } from "@/components/map/SiteMap";
import { VariantBadge } from "@/components/ui/VariantBadge";
import { MAX_VARIANT_LEN } from "@/lib/constants";

type Props = { site: SiteView; products: ProductLite[]; isAdmin: boolean; canDelete: boolean; currentUserId: string };

export function ObjectDetail({ site, products, isAdmin, canDelete, currentUserId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, start] = useTransition();
  const [itemQ, setItemQ] = useState("");

  const total = site.items.reduce((a, i) => a + i.qty, 0);
  // Ro'yxat uzun bo'lganda nom / razmer / izoh bo'yicha qidirish
  const filteredItems = useMemo(() => {
    const s = itemQ.trim().toLowerCase();
    if (!s) return site.items;
    return site.items.filter((it) =>
      [it.product?.name, it.variant, it.note].some((v) => v?.toLowerCase().includes(s)),
    );
  }, [site.items, itemQ]);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/share/${site.shareToken}` : `/share/${site.shareToken}`;

  function del() {
    start(async () => {
      const r = await deleteObjectAction(site.id);
      if (!r.ok) return toast(r.error, "error");
      toast("Obyekt o'chirildi");
      router.push("/objects");
    });
  }

  return (
    <div className="animate-fade-up">
      <Link href="/objects" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text mb-4">
        <ArrowLeft size={16} /> Obyektlar
      </Link>

      {/* Header card */}
      <div className="card p-5 md:p-6 mb-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{site.name}</h1>
              <div className="flex items-center shrink-0 -mr-2 -mt-1">
                <button onClick={() => setEditOpen(true)} className="btn-icon bg-transparent border-0 text-muted hover:bg-surface-2 hover:text-text" title="Tahrirlash" aria-label="Tahrirlash"><Pencil size={18} /></button>
                {canDelete && (
                  <button onClick={() => setConfirmDelete(true)} className="btn-icon bg-transparent border-0 text-muted hover:bg-danger-bg hover:text-danger" title="Obyektni o'chirish" aria-label="Obyektni o'chirish"><Trash2 size={18} /></button>
                )}
              </div>
            </div>
            {site.address && <p className="text-sm text-text-2 mt-1 flex items-center gap-1.5"><MapPin size={14} className="text-muted" /> {site.address}</p>}
            {site.note && <p className="text-sm text-muted mt-2 flex items-start gap-1.5"><StickyNote size={14} className="mt-0.5 shrink-0" /> {site.note}</p>}
            {site.location && <SiteMap point={site.location} height={140} className="mt-3 max-w-md" />}
            <div className="flex items-center gap-3 flex-wrap mt-3 text-xs text-muted">
              <span className="badge-primary"><Package size={12} /> {site.items.length} xil · {formatQty(total)} miqdor</span>
              <span>Yaratilgan: {formatDate(site.createdAt)}</span>
              {isAdmin && site.createdBy && (
                <span className="flex items-center gap-1.5">
                  <Avatar firstName={site.createdBy.firstName} lastName={site.createdBy.lastName} size={18} src={site.createdBy.avatar} />
                  {site.createdBy.id === currentUserId ? "Siz" : `${site.createdBy.firstName} ${site.createdBy.lastName}`}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:flex gap-2 md:justify-end">
            <DownloadImageButton site={site} className="btn-ghost" />
            <button onClick={() => setShareOpen(true)} className="btn-ghost"><Share2 size={18} /> Ulashish</button>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Ashyolar ro'yxati</h2>
        <button onClick={() => setAddOpen(true)} className="btn-accent"><Plus size={18} /> Mahsulot qo'shish</button>
      </div>

      {site.items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Ro'yxat bo'sh"
          text="Bu obyekt uchun kerakli santexnika ashyolarini qo'shing: truba, tirsak, kran va boshqalar."
          action={<button onClick={() => setAddOpen(true)} className="btn-accent"><Plus size={18} /> Mahsulot qo'shish</button>}
        />
      ) : (
        <>
          <div className="relative mb-3 animate-fade-up">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={itemQ}
              onChange={(e) => setItemQ(e.target.value)}
              className="input pl-11 py-3 pr-10"
              placeholder="Ro'yxatdan qidirish: truba, tirsak, kran..."
              aria-label="Ashyolar ro'yxatidan qidirish"
            />
            {itemQ && (
              <button onClick={() => setItemQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text" aria-label="Tozalash">
                <X size={16} />
              </button>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">“{itemQ.trim()}” bo'yicha hech narsa topilmadi</div>
          ) : (
            <div className="card divide-y divide-border overflow-hidden">
              {filteredItems.map((it) => (
                <ItemRow key={it.id} siteId={site.id} item={it} isAdmin={isAdmin} currentUserId={currentUserId} />
              ))}
            </div>
          )}
        </>
      )}

      <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} siteId={site.id} products={products} existing={site.items.map((i) => i.product?.id ?? "")} isAdmin={isAdmin} />
      <EditObjectModal key={editOpen ? "open" : "closed"} open={editOpen} onClose={() => setEditOpen(false)} site={site} />

      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="Ro'yxatni ulashish" size="sm">
        <p className="text-sm text-muted mb-3">Bu havolani olgan har kim ro'yxatni <b className="text-text">faqat ko'rish</b> rejimida ochadi. Kirish talab qilinmaydi.</p>
        {site.location ? (
          <p className="text-xs text-muted mb-3 flex items-start gap-1.5"><CarTaxiFront size={14} className="mt-0.5 shrink-0 text-accent" /> Sotuvchi mahsulotlarni yig'ib, “Yandex Go taksi” tugmasi orqali do'kondan to'g'ri obyektga taksi chaqira oladi.</p>
        ) : (
          <p className="text-xs text-warning mb-3 flex items-start gap-1.5"><MapPin size={14} className="mt-0.5 shrink-0" /> Obyektning xaritadagi joylashuvi belgilanmagan — sotuvchi taksi chaqira olmaydi. “Tahrirlash” orqali belgilang.</p>
        )}
        <ShareBox url={shareUrl} />
        <a href={shareUrl} target="_blank" rel="noreferrer" className="btn-ghost w-full mt-3"><ExternalLink size={16} /> Ochib ko'rish</a>
      </Modal>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Obyektni o'chirish" size="sm"
        footer={<>
          <button onClick={() => setConfirmDelete(false)} className="btn-ghost">Bekor</button>
          <button onClick={del} disabled={pending} className="btn-danger">{pending && <Loader2 size={16} className="animate-spin" />} O'chirish</button>
        </>}>
        <p className="text-sm text-text-2"><b>{site.name}</b> obyekti va uning ichidagi {site.items.length} ta ashyo yozuvi o'chiriladi. Bu amalni qaytarib bo'lmaydi.</p>
      </Modal>
    </div>
  );
}

function ShareBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  }
  return (
    <div className="flex gap-2">
      <input readOnly value={url} className="input font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
      <button onClick={copy} className={copied ? "btn-primary shrink-0" : "btn-ghost shrink-0"}>
        {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Nusxalandi" : "Nusxa"}
      </button>
    </div>
  );
}

function ItemRow({ siteId, item, isAdmin, currentUserId }: { siteId: string; item: SiteView["items"][number]; isAdmin: boolean; currentUserId: string }) {
  const { toast } = useToast();
  const [qty, setQty] = useState(item.qty);
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const p = item.product;

  // Serverdan yangi miqdor kelsa (masalan, "Mahsulot qo'shish" orqali qo'shilganda) lokal state'ni yangilaymiz
  const [syncedQty, setSyncedQty] = useState(item.qty);
  if (syncedQty !== item.qty) {
    setSyncedQty(item.qty);
    setQty(item.qty);
  }

  function save(next: number) {
    if (next < 0) return;
    setQty(next);
    start(async () => {
      const r = await updateItemAction(siteId, item.id, { qty: next });
      if (!r.ok) { toast(r.error, "error"); setQty(item.qty); }
    });
  }
  function remove() {
    start(async () => {
      const r = await removeItemAction(siteId, item.id);
      if (!r.ok) return toast(r.error, "error");
      toast("Olib tashlandi");
    });
  }

  return (
    <div className={`p-3 md:px-4 transition-opacity ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3">
        <ProductThumb src={p?.image ?? null} name={p?.name ?? ""} size={46} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold leading-snug flex items-center gap-2 flex-wrap">
            {p?.name ?? <span className="text-danger">O'chirilgan mahsulot</span>}
            <VariantBadge value={item.variant} />
          </div>
          <div className="text-xs text-muted flex items-center gap-1.5 flex-wrap mt-0.5">
            {item.note && <span className="truncate max-w-full">{item.note}</span>}
            {isAdmin && item.addedBy ? (
              <span className="inline-flex items-center gap-1 whitespace-nowrap" title={`Qo'shdi: ${item.addedBy.firstName} ${item.addedBy.lastName}`}>
                <Avatar firstName={item.addedBy.firstName} lastName={item.addedBy.lastName} size={14} src={item.addedBy.avatar} />
                {item.addedBy.id === currentUserId ? "Siz" : item.addedBy.firstName} · <TimeAgo date={item.addedAt} />
              </span>
            ) : (
              <TimeAgo date={item.addedAt} className="whitespace-nowrap" />
            )}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <QtyControl qty={qty} unit={p?.unit ?? ""} onChange={setQty} onCommit={(n) => (n === 0 ? setConfirm(true) : n !== item.qty && save(n))} onZero={() => setConfirm(true)} />
          <button onClick={() => setConfirm(true)} className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-danger hover:bg-danger-bg" aria-label="O'chirish"><Trash2 size={18} /></button>
        </div>
        <button onClick={() => setConfirm(true)} className="sm:hidden w-11 h-11 rounded-xl flex items-center justify-center text-muted hover:text-danger hover:bg-danger-bg" aria-label="O'chirish"><Trash2 size={18} /></button>
      </div>
      <div className="sm:hidden mt-3">
        <QtyControl qty={qty} unit={p?.unit ?? ""} onChange={setQty} onCommit={(n) => (n === 0 ? setConfirm(true) : n !== item.qty && save(n))} onZero={() => setConfirm(true)} />
      </div>

      <Modal open={confirm} onClose={() => { setConfirm(false); setQty(item.qty); }} title="Ro'yxatdan olib tashlash" size="sm"
        footer={<>
          <button onClick={() => { setConfirm(false); setQty(item.qty); }} className="btn-ghost">Bekor</button>
          <button onClick={() => { setConfirm(false); remove(); }} className="btn-danger">Olib tashlash</button>
        </>}>
        <p className="text-sm text-text-2"><b>{p?.name}</b> ro'yxatdan olib tashlansinmi?</p>
      </Modal>
    </div>
  );
}

function QtyControl({ qty, unit, onChange, onCommit, onZero }: { qty: number; unit: string; onChange: (n: number) => void; onCommit: (n: number) => void; onZero: () => void }) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="flex items-center flex-1 sm:flex-initial rounded-xl border border-border bg-surface-2 p-1">
        <button
          type="button"
          onClick={() => (qty <= 1 ? onZero() : onCommit(qty - 1))}
          className="w-11 h-11 sm:w-10 sm:h-10 flex-1 sm:flex-initial rounded-lg bg-surface border border-border text-text hover:bg-surface-3 active:scale-95 transition-transform flex items-center justify-center"
          aria-label="Kamaytirish"
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>
        <input
          type="number" min={0} step="any" value={qty}
          onChange={(e) => onChange(Number(e.target.value))}
          onBlur={() => onCommit(qty)}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
          className="w-16 h-11 sm:h-10 bg-transparent text-center font-extrabold text-lg focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Miqdor"
        />
        <button
          type="button"
          onClick={() => onCommit(qty + 1)}
          className="w-11 h-11 sm:w-10 sm:h-10 flex-1 sm:flex-initial rounded-lg bg-primary-2 text-primary-ink hover:bg-primary active:scale-95 transition-transform flex items-center justify-center"
          aria-label="Ko'paytirish"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
      <span className="text-sm font-semibold text-text-2 w-14 shrink-0">{unit}</span>
    </div>
  );
}

function AddItemModal({ open, onClose, siteId, products, existing, isAdmin }: { open: boolean; onClose: () => void; siteId: string; products: ProductLite[]; existing: string[]; isAdmin: boolean }) {
  const { toast } = useToast();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<ProductLite | null>(null);
  const [qty, setQty] = useState("1");
  const [variant, setVariant] = useState("");
  /** Razmerli mahsulot uchun: tanlangan razmerlar, har biri o'z miqdori bilan */
  const [picks, setPicks] = useState<VariantPick[]>([]);
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [newUnit, setNewUnit] = useState<string>("dona");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? products.filter((p) => p.name.toLowerCase().includes(s)) : products).slice(0, 60);
  }, [q, products]);

  function reset() { setQ(""); setSelected(null); setQty("1"); setVariant(""); setPicks([]); setNote(""); setCreating(false); setError(null); }
  function select(p: ProductLite) { setSelected(p); setVariant(""); setPicks([]); setError(null); }
  function close() { reset(); onClose(); }

  function add(product: ProductLite) {
    // Razmerli mahsulot: tanlangan har bir razmer o'z miqdori bilan bitta so'rovda ketadi
    if (product.variants.length) {
      if (picks.length === 0) return setError("Kamida bitta razmerni tanlang");
      for (const pk of picks) {
        const n = Number(pk.qty);
        if (!Number.isFinite(n) || n <= 0) return setError(`${pk.variant} razmer uchun miqdor 0 dan katta bo'lsin`);
      }
      start(async () => {
        const r = await addItemsAction(siteId, { productId: product.id, note, items: picks.map((pk) => ({ variant: pk.variant, qty: Number(pk.qty) })) });
        if (!r.ok) return setError(r.error);
        toast(`${product.name} · ${picks.map((pk) => pk.variant).join(", ")} qo'shildi`);
        close();
      });
      return;
    }
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return setError("Miqdor 0 dan katta bo'lsin");
    const v = variant.trim();
    start(async () => {
      const r = await addItemAction(siteId, { productId: product.id, qty: n, variant: v, note });
      if (!r.ok) return setError(r.error);
      toast(`${product.name}${v ? ` · ${v}` : ""} qo'shildi`);
      close();
    });
  }

  function createAndAdd() {
    const name = q.trim();
    if (!name) return setError("Mahsulot nomini kiriting");
    start(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("unit", newUnit);
      const v = variant.trim();
      if (v) fd.append("variants", v);
      const r = await createProductAction(fd);
      if (!r.ok) return setError(r.error);
      const n = Number(qty);
      const r2 = await addItemAction(siteId, { productId: r.id!, qty: Number.isFinite(n) && n > 0 ? n : 1, variant: v, note });
      if (!r2.ok) return setError(r2.error);
      toast(`${name} yaratildi va qo'shildi`);
      router.refresh();
      close();
    });
  }

  return (
    <Modal open={open} onClose={close} title={selected ? "Miqdorni kiriting" : "Mahsulot qo'shish"} size="md">
      {!selected && !creating && (
        <>
          <div className="relative mb-3">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-10" placeholder="Mahsulot nomini yozing..." autoFocus />
          </div>
          <div className="max-h-[50dvh] overflow-y-auto -mx-1 px-1 space-y-1">
            {filtered.map((p) => {
              const inList = existing.includes(p.id);
              return (
                <button key={p.id} onClick={() => select(p)} className="w-full flex items-center gap-3 p-2.5 min-h-14 rounded-xl hover:bg-surface-2 active:bg-surface-3 text-left transition-colors">
                  <ProductThumb src={p.image} name={p.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{p.name}</div>
                    <div className="text-xs text-muted truncate">
                      {p.unit}
                      {p.variants.length > 0 && <> · <span className="text-text-2">{p.variants.slice(0, 6).join(", ")}{p.variants.length > 6 ? ", …" : ""}</span></>}
                      {inList && " · ro'yxatda bor"}
                    </div>
                  </div>
                  <Plus size={16} className="text-muted" />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-6 text-sm text-muted">
                Hech narsa topilmadi.
              </div>
            )}
          </div>
          {q.trim() && !products.some((p) => p.name.toLowerCase() === q.trim().toLowerCase()) && (
            <button onClick={() => { setCreating(true); setError(null); }} className="btn-ghost w-full mt-3 border-dashed">
              <Plus size={16} /> “{q.trim()}” nomli yangi mahsulot yaratish
            </button>
          )}
        </>
      )}

      {creating && (
        <div className="space-y-4">
          <div className="text-sm text-muted">Yangi mahsulot bazaga qo'shiladi va shu obyektga kiritiladi. Rasmni keyin “Mahsulotlar” bo'limida qo'shishingiz mumkin.</div>
          <Field label="Nomi"><input value={q} onChange={(e) => setQ(e.target.value)} className="input" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="O'lchov birligi">
              <select value={newUnit} onChange={(e) => setNewUnit(e.target.value)} className="input">
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Miqdor"><input type="number" min={0} step="any" value={qty} onChange={(e) => setQty(e.target.value)} className="input" /></Field>
          </div>
          {isAdmin && (
            <Field label="Razmer (ixtiyoriy)" hint="Mahsulot razmerlari ro'yxatiga ham qo'shiladi">
              <input value={variant} onChange={(e) => setVariant(e.target.value.slice(0, MAX_VARIANT_LEN))} className="input" placeholder="masalan: 32" />
            </Field>
          )}
          <ErrorText>{error}</ErrorText>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setCreating(false)} className="btn-ghost">Orqaga</button>
            <button onClick={createAndAdd} disabled={pending} className="btn-accent">{pending && <Loader2 size={16} className="animate-spin" />} Yaratish va qo'shish</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
            <ProductThumb src={selected.image} name={selected.name} size={48} />
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{selected.name}</div>
              <div className="text-xs text-muted">Birlik: {selected.unit}</div>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-primary font-semibold">O'zgartirish</button>
          </div>
          {selected.variants.length > 0 ? (
            <MultiVariantPicker options={selected.variants} unit={selected.unit} picks={picks} onChange={(next) => { setPicks(next); setError(null); }} onSubmit={() => add(selected)} allowCustom={isAdmin} />
          ) : (
            <>
              {isAdmin && <VariantPicker options={selected.variants} value={variant} onChange={(v) => { setVariant(v); setError(null); }} />}
              <Field label={`Miqdor (${selected.unit})`}>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setQty(String(Math.max(0, Number(qty) - 1)))} className="btn-ghost w-14 px-0 shrink-0" aria-label="Kamaytirish"><Minus size={20} strokeWidth={2.5} /></button>
                  <input type="number" min={0} step="any" value={qty} onChange={(e) => setQty(e.target.value)} className="input text-center text-2xl font-extrabold h-14" onKeyDown={(e) => e.key === "Enter" && add(selected)} />
                  <button type="button" onClick={() => setQty(String(Number(qty) + 1))} className="btn-primary w-14 px-0 shrink-0" aria-label="Ko'paytirish"><Plus size={20} strokeWidth={2.5} /></button>
                </div>
              </Field>
            </>
          )}
          <Field label="Izoh (ixtiyoriy)"><input value={note} onChange={(e) => setNote(e.target.value)} className="input" placeholder="masalan: 20mm, oq rang" /></Field>
          <ErrorText>{error}</ErrorText>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setSelected(null)} className="btn-ghost">Orqaga</button>
            <button onClick={() => add(selected)} disabled={pending} className="btn-accent">
              {pending && <Loader2 size={16} className="animate-spin" />}
              {selected.variants.length > 0 && picks.length > 1 ? `Qo'shish (${picks.length} razmer)` : "Qo'shish"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function EditObjectModal({ open, onClose, site }: { open: boolean; onClose: () => void; site: SiteView }) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoPoint | null>(site.location);
  const [pending, start] = useTransition();
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await updateObjectAction(site.id, { name: String(fd.get("name")), address: String(fd.get("address")), note: String(fd.get("note")), location });
      if (!r.ok) return setError(r.error);
      toast("Saqlandi");
      onClose();
    });
  }
  return (
    <Modal open={open} onClose={onClose} title="Obyektni tahrirlash">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Obyekt nomi"><input name="name" defaultValue={site.name} className="input" required /></Field>
        <Field label="Manzil"><input name="address" defaultValue={site.address} className="input" /></Field>
        <Field label="Xaritadagi joylashuv" plain><LocationPicker value={location} onChange={setLocation} height={220} /></Field>
        <Field label="Izoh"><textarea name="note" defaultValue={site.note} className="input min-h-20 resize-none" /></Field>
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">Bekor</button>
          <button type="submit" disabled={pending} className="btn-primary">{pending && <Loader2 size={16} className="animate-spin" />} Saqlash</button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Razmer tanlash: mahsulotdagi razmerlar chip bo'lib chiqadi, bosib tanlanadi.
 * Ro'yxatda yo'q razmerni "Boshqa" maydoniga yozish mumkin — u mahsulotga ham saqlanadi.
 * Mahsulotda razmer bo'lmasa — faqat ixtiyoriy matn maydoni.
 */
function VariantPicker({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const [custom, setCustom] = useState(false);
  const isCustom = custom || (!!value && !options.includes(value));
  if (options.length === 0) {
    return (
      <Field label="Razmer (ixtiyoriy)">
        <input value={value} onChange={(e) => onChange(e.target.value.slice(0, MAX_VARIANT_LEN))} className="input" placeholder="masalan: 32" />
      </Field>
    );
  }
  return (
    <Field label="Razmer" plain>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = !isCustom && value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => { setCustom(false); onChange(o); }}
              className={`min-h-11 px-4 rounded-xl text-sm font-bold border transition-colors active:scale-[0.98] ${
                active ? "bg-primary-2 text-primary-ink border-primary-2" : "bg-surface text-text border-border hover:border-border-strong hover:bg-surface-2"
              }`}
              aria-pressed={active}
            >
              {o}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => { setCustom(true); if (options.includes(value)) onChange(""); }}
          className={`min-h-11 px-4 rounded-xl text-sm font-bold border border-dashed transition-colors ${
            isCustom ? "bg-primary-3 text-primary border-primary/40" : "bg-surface text-muted border-border-strong hover:text-text"
          }`}
        >
          <Plus size={14} className="inline -mt-0.5 mr-1" />Boshqa
        </button>
      </div>
      {isCustom && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_VARIANT_LEN))}
          className="input mt-2"
          placeholder="Yangi razmerni yozing, masalan: 50"
          autoFocus
        />
      )}
    </Field>
  );
}

type VariantPick = { variant: string; qty: string };

/**
 * Bir nechta razmerni tanlash: chip bosilsa tanlanadi va pastda o'sha razmer uchun miqdor inputi paydo bo'ladi,
 * qayta bosilsa olib tashlanadi. "Boshqa" orqali ro'yxatda yo'q razmer yoziladi — u ham tanlanganlar qatoriga qo'shiladi.
 * Shunday qilib bitta mahsulotni bir nechta razmerda bir urinishda qo'shib ketish mumkin.
 */
function MultiVariantPicker({ options, unit, picks, onChange, onSubmit, allowCustom }: {
  options: string[]; unit: string; picks: VariantPick[]; onChange: (next: VariantPick[]) => void; onSubmit: () => void;
  /** Ro'yxatda yo'q razmer yozish ("Boshqa") — faqat superadmin uchun */
  allowCustom: boolean;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const has = (v: string) => picks.some((p) => p.variant.toLowerCase() === v.toLowerCase());

  function toggle(v: string) {
    if (has(v)) onChange(picks.filter((p) => p.variant.toLowerCase() !== v.toLowerCase()));
    else onChange([...picks, { variant: v, qty: "1" }]);
  }
  function addCustom() {
    const v = custom.trim().replace(/\s+/g, " ").slice(0, MAX_VARIANT_LEN);
    if (!v) return;
    // Ro'yxatdagi razmer yozilsa — o'sha chip tanlanadi (dublikat bo'lmasin)
    const known = options.find((o) => o.toLowerCase() === v.toLowerCase());
    if (!has(known ?? v)) onChange([...picks, { variant: known ?? v, qty: "1" }]);
    setCustom("");
    setCustomOpen(false);
  }
  function setQty(variant: string, qty: string) {
    onChange(picks.map((p) => (p.variant === variant ? { ...p, qty } : p)));
  }
  function step(variant: string, delta: number) {
    const cur = picks.find((p) => p.variant === variant);
    if (!cur) return;
    setQty(variant, String(Math.max(0, Number(cur.qty || 0) + delta)));
  }

  const customOnes = picks.filter((p) => !options.some((o) => o.toLowerCase() === p.variant.toLowerCase()));

  return (
    <>
      <Field label="Razmer" hint={allowCustom ? "Bir nechta razmerni tanlash mumkin — har biri uchun alohida miqdor kiritiladi" : "Bir nechta razmerni tanlash mumkin. Yangi razmer qo'shishni superadmin bajaradi"} plain>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const active = has(o);
            return (
              <button
                key={o}
                type="button"
                onClick={() => toggle(o)}
                className={`min-h-11 px-4 rounded-xl text-sm font-bold border transition-colors active:scale-[0.98] inline-flex items-center gap-1.5 ${
                  active ? "bg-primary-2 text-primary-ink border-primary-2" : "bg-surface text-text border-border hover:border-border-strong hover:bg-surface-2"
                }`}
                aria-pressed={active}
              >
                {active && <Check size={14} strokeWidth={3} />}
                {o}
              </button>
            );
          })}
          {customOnes.map((p) => (
            <button
              key={p.variant}
              type="button"
              onClick={() => toggle(p.variant)}
              className="min-h-11 px-4 rounded-xl text-sm font-bold border border-dashed bg-primary-2 text-primary-ink border-primary-2 inline-flex items-center gap-1.5"
              aria-pressed
            >
              <Check size={14} strokeWidth={3} />
              {p.variant}
            </button>
          ))}
          {allowCustom && (
            <button
              type="button"
              onClick={() => setCustomOpen((v) => !v)}
              className={`min-h-11 px-4 rounded-xl text-sm font-bold border border-dashed transition-colors ${
                customOpen ? "bg-primary-3 text-primary border-primary/40" : "bg-surface text-muted border-border-strong hover:text-text"
              }`}
            >
              <Plus size={14} className="inline -mt-0.5 mr-1" />Boshqa
            </button>
          )}
        </div>
        {allowCustom && customOpen && (
          <div className="flex gap-2 mt-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value.slice(0, MAX_VARIANT_LEN))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
              className="input"
              placeholder="Yangi razmerni yozing, masalan: 50"
              autoFocus
            />
            <button type="button" onClick={addCustom} disabled={!custom.trim()} className="btn-primary shrink-0"><Plus size={16} /> Tanlash</button>
          </div>
        )}
      </Field>

      {picks.length > 0 && (
        <Field label={`Miqdor (${unit})`} plain>
          <div className="space-y-2">
            {picks.map((p) => (
              <div key={p.variant} className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-2 animate-fade-up">
                <VariantBadge value={p.variant} className="shrink-0" />
                <div className="flex items-center gap-1.5 flex-1 justify-end">
                  <button type="button" onClick={() => step(p.variant, -1)} className="btn-ghost w-11 h-11 px-0 shrink-0" aria-label={`${p.variant}: kamaytirish`}><Minus size={18} strokeWidth={2.5} /></button>
                  <input
                    type="number" min={0} step="any" value={p.qty}
                    onChange={(e) => setQty(p.variant, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                    className="input text-center text-xl font-extrabold h-11 w-20 px-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label={`${p.variant} razmer miqdori`}
                  />
                  <button type="button" onClick={() => step(p.variant, 1)} className="btn-primary w-11 h-11 px-0 shrink-0" aria-label={`${p.variant}: ko'paytirish`}><Plus size={18} strokeWidth={2.5} /></button>
                  <button type="button" onClick={() => toggle(p.variant)} className="w-10 h-11 rounded-xl flex items-center justify-center text-muted hover:text-danger hover:bg-danger-bg shrink-0" aria-label={`${p.variant} razmerni olib tashlash`}><X size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </Field>
      )}
    </>
  );
}
