import Link from "next/link";
import { LogoImage } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <LogoImage size={56} />
      <h1 className="text-3xl font-extrabold mt-4">Sahifa topilmadi</h1>
      <p className="text-muted mt-1 text-sm">Havola noto&apos;g&apos;ri yoki obyekt o&apos;chirilgan bo&apos;lishi mumkin.</p>
      <Link href="/" className="btn-primary mt-6">Bosh sahifa</Link>
    </main>
  );
}
