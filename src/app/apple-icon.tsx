import { renderPwaIcon } from "@/lib/pwa-icon";

// iOS uy ekrani ikonkasi: 180x180, oq fon (iOS shaffof fonni qora qilib ko'rsatadi)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderPwaIcon(180);
}
