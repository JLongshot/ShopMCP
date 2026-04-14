import { getProduct, getAllProducts } from "@/lib/catalog";
import { toDataUri } from "@/lib/images";

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

  const image = product.images[0] ? await toDataUri(product.images[0]) : null;

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
        image,
      },
    },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
  );
}
