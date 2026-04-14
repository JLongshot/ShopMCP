import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

// Module-level cache: public path → base64 data URI.
// Vercel deployments are immutable, so no invalidation needed.
const cache = new Map<string, string>();

export async function toDataUri(publicPath: string): Promise<string | null> {
  if (cache.has(publicPath)) return cache.get(publicPath)!;

  try {
    const filePath = path.join(process.cwd(), "public", publicPath);
    const raw = await readFile(filePath);
    const webp = await sharp(raw)
      .resize(400, 400, { fit: "cover", position: "centre" })
      .webp({ quality: 75 })
      .toBuffer();
    const uri = `data:image/webp;base64,${webp.toString("base64")}`;
    cache.set(publicPath, uri);
    return uri;
  } catch {
    return null;
  }
}
