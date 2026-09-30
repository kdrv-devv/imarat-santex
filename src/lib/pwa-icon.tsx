import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

/** public/logo-san.png ni data URI ko'rinishida o'qiydi (ImageResponse uchun) */
async function logoDataUri() {
  const buf = await readFile(path.join(process.cwd(), "public", "logo-san.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

/**
 * logo-san.png 500x500, lekin to'q sariq kvadratning o'zi 35..465 oralig'ida (430px),
 * atrofi shaffof. Ikonka oq chet qoldirmasligi uchun shu shaffof hoshiyani kesib tashlaymiz.
 */
const LOGO_SIZE = 500;
const LOGO_INSET = 35;
const LOGO_BOX = 430;
/** Kvadratning burchak radiusi (asl rasmda ~95px) */
const LOGO_RADIUS = 95;
/** Logotipning o'z gradienti: burchaklar OS maskasidan chiqib qolsa ham oq ko'rinmasin */
const LOGO_GRADIENT = "linear-gradient(135deg, #fd9d24 0%, #f44800 45%, #ab1f00 100%)";

/**
 * PWA ikonkasini yasaydi.
 * - oddiy (any / iOS): logotip ikonkani chetidan chetigacha to'liq qoplaydi
 * - maskable: Android dumaloq mask kesmasligi uchun logotip 80% (xavfsiz zona), orqa fon o'sha gradient
 */
export async function renderPwaIcon(size: number, opts: { maskable?: boolean } = {}) {
  const src = await logoDataUri();
  const box = opts.maskable ? Math.round(size * 0.8) : size; // to'q sariq kvadrat egallaydigan joy
  const scale = box / LOGO_BOX;
  const imgPx = Math.round(LOGO_SIZE * scale);
  const boxOffset = Math.round((size - box) / 2);
  const offset = Math.round(boxOffset - LOGO_INSET * scale);
  const radius = Math.round(LOGO_RADIUS * scale);
  // Oq fon logotipning yumshoq chetidan chiqib ko'rinmasligi uchun bir oz ichkariga
  const pad = Math.max(1, Math.round(box * 0.012));
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: "flex", position: "relative", overflow: "hidden", background: LOGO_GRADIENT }}>
        {/* Logotipdagi oq qismlar (quvur, matn) aslida shaffof, shuning uchun kvadrat ostiga oq fon qo'yamiz */}
        <div style={{ position: "absolute", left: boxOffset + pad, top: boxOffset + pad, width: box - pad * 2, height: box - pad * 2, background: "#ffffff", borderRadius: Math.max(0, radius - pad) }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={imgPx} height={imgPx} alt="" style={{ position: "absolute", left: offset, top: offset }} />
      </div>
    ),
    { width: size, height: size },
  );
}
