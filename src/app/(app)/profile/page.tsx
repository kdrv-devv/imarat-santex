import type { Metadata } from "next";
import { Shield, Phone, AtSign, CalendarDays, Building2, Package } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Site } from "@/lib/models/Site";
import { Product } from "@/lib/models/Product";
import { requireUser, isAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { formatDate } from "@/lib/format";
import { LogoutButton } from "@/components/LogoutButton";
import { ProfileForms } from "./ProfileForms";
import { AvatarUploader } from "./AvatarUploader";
import { InstallAppButton } from "@/components/InstallAppButton";

export const metadata: Metadata = { title: "Profil" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  await connectDB();
  const [siteCount, productCount, itemCount] = await Promise.all([
    Site.countDocuments({ createdBy: user.id }),
    Product.countDocuments({ createdBy: user.id }),
    Site.aggregate<{ n: number }>([{ $unwind: "$items" }, { $match: { "items.addedBy": { $eq: new (await import("mongoose")).default.Types.ObjectId(user.id) } } }, { $count: "n" }]).then((r) => r[0]?.n ?? 0),
  ]);
  const admin = isAdmin(user);

  return (
    <>
      <PageHeader title="Profil" />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <div className="card p-6 flex flex-col items-center text-center animate-fade-up">
            <AvatarUploader user={user} />
            <h2 className="text-xl font-extrabold mt-4">{user.fullName}</h2>
            <span className={admin ? "badge-accent mt-2" : "badge-primary mt-2"}><Shield size={12} /> {admin ? "Superadmin" : "Hodim"}</span>
            <div className="w-full mt-6 space-y-2 text-sm text-left">
              <div className="flex items-center gap-3 text-text-2"><AtSign size={16} className="text-muted" /> {user.username}</div>
              <div className="flex items-center gap-3 text-text-2"><Phone size={16} className="text-muted" /> {user.phone}</div>
              <div className="flex items-center gap-3 text-text-2"><CalendarDays size={16} className="text-muted" /> {formatDate(user.createdAt)} dan beri</div>
            </div>
            <div className="w-full mt-6 space-y-2">
              <InstallAppButton className="btn-primary" full />
              <LogoutButton variant="full" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 animate-fade-up">
            <Stat icon={Building2} label="Obyekt" value={siteCount} />
            <Stat icon={Package} label="Mahsulot" value={productCount} />
            <Stat icon={Package} label="Qo'shilgan" value={itemCount} />
          </div>
        </div>
        <ProfileForms user={user} />
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: number }) {
  return (
    <div className="card p-4 text-center">
      <Icon size={18} className="mx-auto text-primary" />
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}
