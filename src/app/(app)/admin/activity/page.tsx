import type { Metadata } from "next";
import Link from "next/link";
import { Activity as ActivityIcon, Building2, Package, Users, KeyRound, LogIn, Trash2, Pencil, PlusCircle, MinusCircle } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Activity, type ActivityType } from "@/lib/models/Activity";
import "@/lib/models/User";
import { requireAdmin } from "@/lib/auth";
import { TimeAgo } from "@/components/TimeAgo";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import {formatDate, formatQty} from "@/lib/format";

export const metadata: Metadata = { title: "Faoliyat" };
export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string; types: ActivityType[] }[] = [
  { key: "all", label: "Hammasi", types: [] },
  { key: "objects", label: "Obyektlar", types: ["OBJECT_CREATED", "OBJECT_UPDATED", "OBJECT_DELETED"] },
  { key: "items", label: "Ro'yxatga qo'shish", types: ["ITEM_ADDED", "ITEM_UPDATED", "ITEM_REMOVED"] },
  { key: "products", label: "Mahsulotlar", types: ["PRODUCT_CREATED", "PRODUCT_UPDATED", "PRODUCT_DELETED"] },
  { key: "users", label: "Hodimlar", types: ["USER_CREATED", "USER_UPDATED", "CREDENTIALS_CHANGED", "LOGIN"] },
];

const ICONS: Record<ActivityType, { icon: typeof Building2; cls: string }> = {
  OBJECT_CREATED: { icon: Building2, cls: "bg-primary-3 text-primary" },
  OBJECT_UPDATED: { icon: Pencil, cls: "bg-primary-3 text-primary" },
  OBJECT_DELETED: { icon: Trash2, cls: "bg-danger-bg text-danger" },
  ITEM_ADDED: { icon: PlusCircle, cls: "bg-primary-3 text-primary" },
  ITEM_UPDATED: { icon: Pencil, cls: "bg-primary-3 text-primary" },
  ITEM_REMOVED: { icon: MinusCircle, cls: "bg-danger-bg text-danger" },
  PRODUCT_CREATED: { icon: Package, cls: "bg-success-bg text-success" },
  PRODUCT_UPDATED: { icon: Package, cls: "bg-success-bg text-success" },
  PRODUCT_DELETED: { icon: Trash2, cls: "bg-danger-bg text-danger" },
  USER_CREATED: { icon: Users, cls: "bg-violet-100 text-violet-800" },
  USER_UPDATED: { icon: Users, cls: "bg-violet-100 text-violet-800" },
  CREDENTIALS_CHANGED: { icon: KeyRound, cls: "bg-amber-100 text-amber-800" },
  LOGIN: { icon: LogIn, cls: "bg-surface-3 text-muted" },
};

type Row = {
  _id: unknown; type: ActivityType; createdAt: Date; site: unknown; product: unknown;
  actor: { firstName: string; lastName: string } | null;
  meta: { siteName: string; productName: string; userName: string; qty: number | null; unit: string; extra: string };
};

function describe(a: Row): React.ReactNode {
  const m = a.meta;
  const S = <b className="text-text">{m.siteName}</b>;
  const P = <b className="text-text">{m.productName}</b>;
  const U = <b className="text-text">{m.userName}</b>;
  const Q = m.qty != null ? <b className="text-accent">{formatQty(m.qty)} {m.unit}</b> : null;
  switch (a.type) {
    case "OBJECT_CREATED": return <>{S} obyektini yaratdi</>;
    case "OBJECT_UPDATED": return <>{S} obyektini tahrirladi</>;
    case "OBJECT_DELETED": return <>{S} obyektini o&apos;chirdi</>;
    case "ITEM_ADDED": return <>{S} ga {P} qo&apos;shdi — {Q}</>;
    case "ITEM_UPDATED": return <>{S} dagi {P} miqdorini o&apos;zgartirdi — {Q}{m.extra && <span className="text-muted"> ({m.extra})</span>}</>;
    case "ITEM_REMOVED": return <>{S} dan {P} ni olib tashladi</>;
    case "PRODUCT_CREATED": return <>bazaga {P} mahsulotini qo&apos;shdi ({m.unit})</>;
    case "PRODUCT_UPDATED": return <>{P} mahsulotini tahrirladi</>;
    case "PRODUCT_DELETED": return <>{P} mahsulotini o&apos;chirdi</>;
    case "USER_CREATED": return <>{U} hodimini yaratdi</>;
    case "USER_UPDATED": return <>{U} ma&apos;lumotlarini yangiladi{m.extra && <span className="text-muted"> ({m.extra})</span>}</>;
    case "CREDENTIALS_CHANGED": return <>{U} uchun {m.extra} o&apos;zgartirdi</>;
    case "LOGIN": return <>tizimga kirdi</>;
  }
}

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ f?: string; page?: string }> }) {
  await requireAdmin();
  const { f = "all", page = "1" } = await searchParams;
  const filter = FILTERS.find((x) => x.key === f) ?? FILTERS[0];
  const pageNum = Math.max(1, Number(page) || 1);
  const PAGE = 50;
  await connectDB();
  const query = filter.types.length ? { type: { $in: filter.types } } : {};
  const [rows, total] = await Promise.all([
    Activity.find(query).sort({ createdAt: -1 }).skip((pageNum - 1) * PAGE).limit(PAGE).populate("actor", "firstName lastName").lean<Row[]>(),
    Activity.countDocuments(query),
  ]);

  // Kun bo'yicha guruhlash
  const groups: { day: string; items: Row[] }[] = [];
  for (const r of rows) {
    const day = formatDate(r.createdAt);
    const g = groups[groups.length - 1];
    if (g && g.day === day) g.items.push(r); else groups.push({ day, items: [r] });
  }

  return (
    <>
      <PageHeader title="Faoliyat" subtitle="Kim nima qilganini kuzating" />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {FILTERS.map((x) => (
          <Link key={x.key} href={`/admin/activity?f=${x.key}`} className={`badge px-3.5 py-1.5 whitespace-nowrap border transition-colors ${x.key === filter.key ? "bg-primary-3 text-primary border-primary/30" : "bg-surface text-text-2 border-border hover:bg-surface-2"}`}>
            {x.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={ActivityIcon} title="Hozircha faoliyat yo'q" text="Hodimlar obyekt yaratsa yoki mahsulot qo'shsa, bu yerda ko'rinadi." />
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <section key={g.day}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 px-1">{g.day}</h3>
              <div className="card divide-y divide-border overflow-hidden">
                {g.items.map((a) => {
                  const { icon: Icon, cls } = ICONS[a.type];
                  const inner = (
                    <div className="flex items-center gap-3 p-3 md:px-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cls}`}><Icon size={16} /></div>
                      <div className="flex-1 min-w-0 text-sm text-text-2">
                        <span className="inline-flex items-center gap-1.5 mr-1">
                          {a.actor && <Avatar firstName={a.actor.firstName} lastName={a.actor.lastName} size={18} />}
                          <b className="text-text">{a.actor ? `${a.actor.firstName} ${a.actor.lastName}` : "Noma'lum"}</b>
                        </span>
                        {describe(a)}
                      </div>
                      <TimeAgo date={a.createdAt} className="text-xs text-muted whitespace-nowrap" />
                    </div>
                  );
                  return a.site && a.type !== "OBJECT_DELETED" ? (
                    <Link key={String(a._id)} href={`/objects/${a.site}`} className="block hover:bg-surface-2 transition-colors">{inner}</Link>
                  ) : (
                    <div key={String(a._id)}>{inner}</div>
                  );
                })}
              </div>
            </section>
          ))}
          {total > PAGE && (
            <div className="flex justify-center gap-2 pt-2">
              {pageNum > 1 && <Link href={`/admin/activity?f=${filter.key}&page=${pageNum - 1}`} className="btn-ghost">Oldingi</Link>}
              <span className="btn-ghost pointer-events-none">{pageNum} / {Math.ceil(total / PAGE)}</span>
              {pageNum * PAGE < total && <Link href={`/admin/activity?f=${filter.key}&page=${pageNum + 1}`} className="btn-ghost">Keyingi</Link>}
            </div>
          )}
        </div>
      )}
    </>
  );
}
