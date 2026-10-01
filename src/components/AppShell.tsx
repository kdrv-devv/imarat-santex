"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Package, Users, Activity, UserCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { LogoutButton } from "@/components/LogoutButton";
import type { CurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/objects", label: "Obyektlar", icon: Building2 },
  { href: "/products", label: "Mahsulotlar", icon: Package },
  { href: "/admin/employees", label: "Hodimlar", icon: Users, admin: true },
  { href: "/admin/activity", label: "Faoliyat", icon: Activity, admin: true },
  { href: "/profile", label: "Profil", icon: UserCircle2 },
];

export function AppShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = user.role === "SUPERADMIN";
  const items = NAV.filter((n) => !n.admin || isAdmin);
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex-1 flex min-h-dvh">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-dvh border-r border-border bg-bg-2 p-4 z-[var(--z-sticky)] overflow-y-auto">
        <Link href="/objects" className="px-2 py-1">
          <Logo />
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${active(href) ? "nav-link-active" : ""}`}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto card p-3 flex items-center gap-3">
          <Avatar firstName={user.firstName} lastName={user.lastName} size={38} src={user.avatar} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{user.fullName}</div>
            <div className="text-xs text-muted truncate">{isAdmin ? "Superadmin" : "Hodim"} · @{user.username}</div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-[var(--z-sticky)] flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface">
          <Link href="/objects"><Logo compact /></Link>
          <Link href="/profile"><Avatar firstName={user.firstName} lastName={user.lastName} size={34} src={user.avatar} /></Link>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-5 md:px-8 md:py-8 pb-28 md:pb-10">{children}</main>

        {/* Bottom nav (mobile) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-[var(--z-nav)] border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
          <div className={`grid ${items.length === 5 ? "grid-cols-5" : "grid-cols-3"}`}>
            {items.map(({ href, label, icon: Icon }) => {
              const a = active(href);
              return (
                <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-2 min-h-14 text-[11px] font-bold transition-colors ${a ? "text-primary" : "text-text-2"}`}>
                  <span className={`px-4 py-1 rounded-full transition-colors ${a ? "bg-primary-3" : ""}`}>
                    <Icon size={20} />
                  </span>
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
