import { getProduct, getAllProducts } from "@/lib/catalog";
import { getStock } from "@/lib/inventory";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ id: p.id }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const stock = await getStock(id);
  if (stock === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(
    {
      product: {
        id: product.id,
        name: product.name,
        price_cents: product.price_cents,
        shipping_flat_cents: product.shipping_flat_cents,
        description: product.description,
        vibe: product.vibe,
        agent_pitch: product.agent_pitch,
        stock,
      },
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
