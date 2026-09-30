import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

/** Cloudinary papkasi: bitta akkaunt bir nechta loyihada ishlatiladi, shuning uchun alohida papka */
export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "imarat-santex/products";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary sozlamalari topilmadi (.env.local: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)");
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  configured = true;
}

export type UploadedImage = { url: string; publicId: string };

/** Rasmni Cloudinary'ga yuklaydi va https URL + public_id qaytaradi */
export async function uploadProductImage(file: Blob): Promise<UploadedImage> {
  ensureConfigured();
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: "image",
        overwrite: false,
        // Serverda ham cheklab qo'yamiz: max 800px, avtomatik format/sifat
        transformation: [{ width: 800, height: 800, crop: "limit" }, { quality: "auto", fetch_format: "auto" }],
      },
      (err, res) => (err || !res ? reject(err ?? new Error("Cloudinary javob bermadi")) : resolve(res)),
    );
    stream.end(buffer);
  });
  return { url: result.secure_url, publicId: result.public_id };
}

/** Eski rasmni Cloudinary'dan o'chiradi. Xato bo'lsa jim o'tkazib yuboradi (asosiy amalga ta'sir qilmasin). */
export async function deleteProductImage(publicId: string | null | undefined): Promise<void> {
  if (!publicId) return;
  try {
    ensureConfigured();
    await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  } catch (e) {
    console.error("Cloudinary'dan o'chirishda xato:", publicId, e);
  }
}
