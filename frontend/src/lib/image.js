// Browser-side image compression for serial-plate photos.
// Phones routinely produce 3–8 MB JPEGs; we squeeze them down so each
// stored report row stays small and lists return quickly.

const MAX_DIMENSION = 1200;
const QUALITY = 0.7;

export async function compressImage(file) {
  if (!file || !file.type?.startsWith("image/")) {
    throw new Error("Not an image file");
  }
  const bitmap = await loadBitmap(file);
  const { width, height } = fit(bitmap.width, bitmap.height, MAX_DIMENSION);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);
  if (bitmap.close) bitmap.close();

  return canvas.toDataURL("image/jpeg", QUALITY);
}

function fit(w, h, max) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w > h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

async function loadBitmap(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img> path
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Failed to load image"));
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}
