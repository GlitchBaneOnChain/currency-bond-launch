/** Client-side image compression + upload helpers.
 *
 * Bankpad launches store the coin's image inline as a compressed data URL —
 * no Supabase Storage bucket required for MVP. If a launch's image ever
 * grows past `MAX_DATA_URL_BYTES` after compression, the caller should push
 * it to a real bucket instead. */

const TARGET_MAX_DIM = 512;
const OUTPUT_QUALITY = 0.85;
const MAX_INPUT_BYTES = 8 * 1024 * 1024;
export const MAX_DATA_URL_BYTES = 400_000;

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

/** Read an <input type="file"> selection, resize + re-encode to WebP and
 * return a data URL suitable for saving with the coin's metadata. */
export async function readAndCompressImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Image must be a PNG, JPEG, WebP or GIF");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("Image is over 8MB. Pick a smaller file.");
  }
  const bitmap = await fileToBitmap(file);
  try {
    const dataUrl = drawToDataUrl(bitmap);
    if (dataUrl.length > MAX_DATA_URL_BYTES) {
      throw new Error(
        "Image is still too heavy after compression. Try a simpler image or lower resolution.",
      );
    }
    return dataUrl;
  } finally {
    bitmap.close?.();
  }
}

function fileToBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap !== "function") {
    throw new Error("This browser cannot decode images");
  }
  return createImageBitmap(file);
}

function drawToDataUrl(bitmap: ImageBitmap): string {
  const scale = Math.min(1, TARGET_MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser");
  ctx.drawImage(bitmap, 0, 0, w, h);
  // WebP first for size; fall back to JPEG for browsers that only encode JPEG.
  const webp = canvas.toDataURL("image/webp", OUTPUT_QUALITY);
  if (webp.startsWith("data:image/webp")) return webp;
  return canvas.toDataURL("image/jpeg", OUTPUT_QUALITY);
}
