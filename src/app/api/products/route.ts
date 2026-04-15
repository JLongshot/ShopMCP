import { getAllProducts } from "@/lib/catalog";

export async function GET() {
  const products = getAllProducts()
    .filter((p) => p.stock > 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price_cents: p.price_cents,
      shipping_flat_cents: p.shipping_flat_cents,
      description: p.description,
      vibe: p.vibe,
      agent_pitch: p.agent_pitch,
    }));

  return Response.json(
    { products },
    { headers: { "Cache-Control": "public, max-age=0, must-revalidate" } }
  );
}
