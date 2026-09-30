/** Brauzerda rasmni siqib JPEG Blob qaytaradi (max 640px, sifat ~0.82). Serverga shu Blob yuboriladi. */
export async function compressImage(file: File, maxSize = 640, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Faqat rasm fayli yuklash mumkin");
  const bitmap = await createImageBitmap(file).catch(() => null);
  const img = bitmap ?? (await loadImage(file));
  const w = "width" in img ? img.width : 0;
  const h = "height" in img ? img.height : 0;
  const scale = Math.min(1, maxSize / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img as CanvasImageSource, 0, 0, cw, ch);
  return new Promise((res, rej) => {
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Rasmni siqib bo'lmadi"))), "image/jpeg", quality);
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Rasm o'qilmadi")); };
    img.src = url;
  });
}
