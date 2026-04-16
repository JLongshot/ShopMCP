import { getAllProducts } from "@/lib/catalog";
import { getStock } from "@/lib/inventory";

export async function GET() {
  const withStock = await Promise.all(
    getAllProducts().map(async (p) => ({
      product: p,
      stock: await getStock(p.id),
    }))
  );

  const products = withStock
    .filter(({ stock }) => stock > 0)
    .map(({ product: p, stock }) => ({
      id: p.id,
      name: p.name,
      price_cents: p.price_cents,
      shipping_flat_cents: p.shipping_flat_cents,
      description: p.description,
      vibe: p.vibe,
      agent_pitch: p.agent_pitch,
      stock,
    }));

  return Response.json(
    { products },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
