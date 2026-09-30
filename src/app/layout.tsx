import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: { default: "Imarat-log", template: "%s · Imarat-log" },
  description: "Santexnika obyektlari va ashyolar ro'yxatini yuritish ilovasi",
  icons: { icon: "/icon.svg", apple: "/apple-icon" },
  applicationName: "Imarat-log",
  // iOS uy ekraniga o'rnatilganda ilova kabi (brauzer paneli yo'q) ochilishi uchun
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Imarat-log" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  interactiveWidget: "resizes-content",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${manrope.variable} h-full antialiased`}>
      <head>
        {/* Chrome "beforeinstallprompt" ni React yuklanishidan oldin yuborishi mumkin.
            Shu skript uni saqlab qo'yadi, InstallAppButton keyin undan foydalanadi. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__pwaInstallEvent=e;window.dispatchEvent(new Event('pwa-install-change'));});window.addEventListener('appinstalled',function(){window.__pwaInstallEvent=null;window.__pwaInstalled=true;window.dispatchEvent(new Event('pwa-install-change'));});`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
