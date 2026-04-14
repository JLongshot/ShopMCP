import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getAllProducts } from "@/lib/catalog";

// Module-level cache: image path → base64 data URI
// Vercel deployments are immutable, so no invalidation needed.
const imageCache = new Map<string, string>();

async function toDataUri(publicPath: string): Promise<string | null> {
  if (imageCache.has(publicPath)) {
    return imageCache.get(publicPath)!;
  }

  try {
    const filePath = path.join(process.cwd(), "public", publicPath);
    const raw = await readFile(filePath);

    const webpBuffer = await sharp(raw)
      .resize(400, 400, { fit: "cover", position: "centre" })
      .webp({ quality: 75 })
      .toBuffer();

    const dataUri = `data:image/webp;base64,${webpBuffer.toString("base64")}`;
    imageCache.set(publicPath, dataUri);
    return dataUri;
  } catch {
    return null;
  }
}

export async function GET() {
  const allProducts = getAllProducts().filter((p) => p.stock > 0);

  const products = await Promise.all(
    allProducts.map(async (p) => {
      const imagePath = p.images[0] ?? null;
      const image = imagePath ? await toDataUri(imagePath) : null;

      return {
        id: p.id,
        name: p.name,
        price_cents: p.price_cents,
        shipping_flat_cents: p.shipping_flat_cents,
        description: p.description,
        vibe: p.vibe,
        agent_pitch: p.agent_pitch,
        image,
      };
    })
  );

  return Response.json(
    { products },
    {
      headers: {
        // Cache for 1 hour at the edge; immutable per deploy
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
