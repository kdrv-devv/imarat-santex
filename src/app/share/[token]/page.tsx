import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Package, Eye } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import "@/lib/models/Product";
import { toSiteView } from "@/lib/serialize";
import { LogoImage } from "@/components/ui/Logo";
import { ProductThumb } from "@/components/ProductThumb";
import { DownloadImageButton } from "@/components/DownloadImageButton";
import { SiteMap } from "@/components/map/SiteMap";
import { formatDate, formatQty } from "@/lib/format";
import { VariantBadge } from "@/components/ui/VariantBadge";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  await connectDB();
  const s = await Site.findOne({ shareToken: token }, "name").lean();
  return { title: s ? `${s.name} — ro'yxat` : "Ro'yxat", robots: { index: false } };
}

export default async function SharePage({ params }: Params) {
  const { token } = await params;
  if (!token || token.length < 6) notFound();
  await connectDB();
  const site = await Site.findOne({ shareToken: token }).populate("items.product", "name unit image variants").lean();
  if (!site) notFound();
  const view = toSiteView(site);
  view.createdBy = null;
  view.items = view.items.filter((i) => i.product);
  const total = view.items.reduce((a, i) => a + i.qty, 0);

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 md:py-10 animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <LogoImage size={36} />
          <div className="font-extrabold tracking-tight text-lg">Imarat<span className="text-primary">-log</span></div>
        </div>
        <span className="badge-muted"><Eye size={12} /> Faqat ko'rish</span>
      </div>

      <div className="card p-5 md:p-6 mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{view.name}</h1>
        {view.address && <p className="text-sm text-text-2 mt-1 flex items-center gap-1.5"><MapPin size={14} className="text-muted" /> {view.address}</p>}
        {view.location && <SiteMap point={view.location} height={150} className="mt-4" />}
        <div className="flex items-center justify-between gap-3 flex-wrap mt-4">
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="badge-primary"><Package size={12} /> {view.items.length} xil · {formatQty(total)} miqdor</span>
            <span>{formatDate(view.updatedAt)}</span>
          </div>
          <DownloadImageButton site={view} />
        </div>
      </div>

      {view.items.length === 0 ? (
        <div className="card p-10 text-center text-muted text-sm">Ro'yxat bo'sh</div>
      ) : (
        <div className="card divide-y divide-border overflow-hidden">
          {view.items.map((it, i) => (
            <div key={it.id} className="flex items-center gap-3 p-3 md:px-4">
              <span className="w-6 text-xs text-muted font-semibold text-center">{i + 1}</span>
              <ProductThumb src={it.product!.image} name={it.product!.name} size={44} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{it.product!.name}</div>
                {it.variant && <div className="mt-1"><VariantBadge value={it.variant} className="!text-sm !px-2.5 !py-1" /></div>}
                {it.note && <div className="text-xs text-muted truncate">{it.note}</div>}
              </div>
              <div className="text-right">
                <div className="font-extrabold text-lg leading-none">{formatQty(it.qty)}</div>
                <div className="text-[11px] text-muted">{it.product!.unit}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-center text-xs text-muted mt-6">Imarat-log orqali ulashildi</p>
    </main>
  );
}
