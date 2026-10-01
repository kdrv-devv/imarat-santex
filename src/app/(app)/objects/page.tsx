import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin, Package, ChevronRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import "@/lib/models/User";
import { requireUser, isAdmin } from "@/lib/auth";
import { TimeAgo } from "@/components/TimeAgo";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import {} from "@/lib/format";
import { NewObjectButton } from "./NewObjectButton";

export const metadata: Metadata = { title: "Obyektlar" };
export const dynamic = "force-dynamic";

type Creator = { _id: unknown; firstName: string; lastName: string; avatar?: string | null };

export default async function ObjectsPage() {
  const user = await requireUser();
  await connectDB();
  const sites = await Site.find()
    .sort({ createdAt: -1 })
    .populate<{ createdBy: Creator | null }>("createdBy", "firstName lastName avatar")
    .lean();
  const admin = isAdmin(user);

  return (
    <>
      <PageHeader title="Obyektlar" subtitle={`${sites.length} ta obyekt`} action={<NewObjectButton />} />

      {sites.length === 0 ? (
        <EmptyState
          image="/obyekt-bosh.png"
          title="Hali obyekt yo'q"
          text="Birinchi uy yoki obyektingizni qo'shing va unga kerakli santexnika ashyolarini ro'yxatlang."
          action={<NewObjectButton />}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((s, i) => {
            const total = s.items.reduce((a, it) => a + it.qty, 0);
            const mine = String(s.createdBy?._id ?? "") === user.id;
            return (
              <Link
                key={String(s._id)}
                href={`/objects/${s._id}`}
                className="card card-hover p-4 flex flex-col gap-3 animate-fade-up group"
                style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-3 text-primary flex items-center justify-center shrink-0">
                    <Building2 size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold leading-tight truncate group-hover:text-primary transition-colors">{s.name}</h3>
                    {s.address ? (
                      <p className="text-xs text-muted mt-0.5 flex items-center gap-1 truncate"><MapPin size={12} /> {s.address}</p>
                    ) : (
                      <p className="text-xs text-muted mt-0.5">Manzil kiritilmagan</p>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="badge-muted"><Package size={12} /> {s.items.length} xil · {total} dona</span>
                  <div className="flex items-center gap-2">
                    {admin && s.createdBy && (
                      <span className="flex items-center gap-1.5 text-xs text-muted" title={`Yaratuvchi: ${s.createdBy.firstName} ${s.createdBy.lastName}`}>
                        <Avatar firstName={s.createdBy.firstName} lastName={s.createdBy.lastName} size={20} src={s.createdBy.avatar} />
                        {mine ? "Siz" : s.createdBy.firstName}
                      </span>
                    )}
                    <span className="text-xs text-muted"><TimeAgo date={s.createdAt} /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
