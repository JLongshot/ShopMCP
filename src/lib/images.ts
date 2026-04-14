import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

// Module-level caches — Vercel deployments are immutable, no invalidation needed.
const fileCache = new Map<string, string>();
const placeholderCache = new Map<string, string>();

export async function toDataUri(publicPath: string): Promise<string | null> {
  if (fileCache.has(publicPath)) return fileCache.get(publicPath)!;

  try {
    const filePath = path.join(process.cwd(), "public", publicPath);
    const raw = await readFile(filePath);
    const webp = await sharp(raw)
      .resize(400, 400, { fit: "cover", position: "centre" })
      .webp({ quality: 75 })
      .toBuffer();
    const uri = `data:image/webp;base64,${webp.toString("base64")}`;
    fileCache.set(publicPath, uri);
    return uri;
  } catch {
    return null;
  }
}

// Derive a muted, on-brand colour from a product ID string.
function idToRgb(id: string): { r: number; g: number; b: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (Math.imul(31, hash) + id.charCodeAt(i)) | 0;
  }
  const h = Math.abs(hash) % 360;
  // HSL → RGB: saturation 28%, lightness 74% — muted pastels
  const s = 0.28;
  const l = 0.74;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

export async function placeholderDataUri(id: string): Promise<string> {
  if (placeholderCache.has(id)) return placeholderCache.get(id)!;

  const { r, g, b } = idToRgb(id);
  const webp = await sharp({
    create: { width: 400, height: 400, channels: 3, background: { r, g, b } },
  })
    .webp({ quality: 75 })
    .toBuffer();
  const uri = `data:image/webp;base64,${webp.toString("base64")}`;
  placeholderCache.set(id, uri);
  return uri;
}
