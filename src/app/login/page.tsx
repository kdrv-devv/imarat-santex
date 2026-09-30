import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import Image from "next/image";
import { InstallAppButton } from "@/components/InstallAppButton";

export const metadata: Metadata = { title: "Kirish" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="flex flex-col items-center mb-8">
         <Image width={40} height={40} src="/imarat-icon-removebg-preview.png" alt="Logo" className="w-16 h-16 mb-2" />  
          <h1 className="text-3xl font-extrabold tracking-tight">
            Imarat<span className="text-primary">-log</span>
          </h1>
          <p className="text-sm text-muted mt-1">Santexnika obyektlari uchun ashyolar hisobi</p>
        </div>
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-1">Xush kelibsiz 👋</h2>
          <p className="text-sm text-muted mb-6">Davom etish uchun login va parolingizni kiriting</p>
          <LoginForm next={next ?? ""} />
        </div>
        <p className="text-center text-xs text-muted mt-6">Login yoki parolni unutdingizmi? Superadminga murojaat qiling.</p>
        <div className="flex justify-center mt-4"><InstallAppButton /></div>
      </div>
    </main>
  );
}
