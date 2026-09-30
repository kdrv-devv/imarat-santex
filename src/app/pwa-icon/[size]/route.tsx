import { NextResponse } from "next/server";
import { renderPwaIcon } from "@/lib/pwa-icon";

const ALLOWED = new Set([192, 512]);

/** /pwa-icon/192, /pwa-icon/512, /pwa-icon/512?maskable=1 */
export async function GET(req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const px = Number(size);
  if (!ALLOWED.has(px)) return new NextResponse("Not found", { status: 404 });
  const maskable = new URL(req.url).searchParams.get("maskable") === "1";
  const res = await renderPwaIcon(px, { maskable });
  res.headers.set("Cache-Control", "public, max-age=86400, immutable");
  return res;
}
