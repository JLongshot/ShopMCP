import { getAllProducts } from "@/lib/catalog";
import { toDataUri, placeholderDataUri } from "@/lib/images";

export async function GET() {
  const products = await Promise.all(
    getAllProducts()
      .filter((p) => p.stock > 0)
      .map(async (p) => ({
        id: p.id,
        name: p.name,
        price_cents: p.price_cents,
        shipping_flat_cents: p.shipping_flat_cents,
        description: p.description,
        vibe: p.vibe,
        agent_pitch: p.agent_pitch,
        image: p.images[0] ? await toDataUri(p.images[0]) : await placeholderDataUri(p.id),
      }))
  );

  return Response.json(
    { products },
    { headers: { "Cache-Control": "public, max-age=0, must-revalidate" } }
  );
}
