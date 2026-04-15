import { getProduct, getAllProducts } from "@/lib/catalog";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ id: p.id }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product || product.stock === 0) {
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
      },
    },
    { headers: { "Cache-Control": "public, max-age=0, must-revalidate" } }
  );
}
