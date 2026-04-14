import { getProduct } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/url";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = getProduct(id);
  const baseUrl = getSiteUrl();

  if (!product) {
    return new Response("Product not found.\n", { status: 404 });
  }

  const price = `$${(product.price_cents / 100).toFixed(2)}`;
  const shipping =
    product.shipping_flat_cents > 0
      ? ` + $${(product.shipping_flat_cents / 100).toFixed(2)} shipping`
      : "";
  const pairsWith =
    product.pairs_well_with.length > 0
      ? `\n- Pairs well with: ${product.pairs_well_with.join(", ")}`
      : "";

  const githubRaw =
    "https://raw.githubusercontent.com/JLongshot/ShopMCP/main/public";
  const images = product.images
    .map((img) => `![${product.name}](${githubRaw}${img})`)
    .join("\n");

  const markdown = `# ${product.name}

- **Type:** ${product.type}
- **Price:** ${price}${shipping}
- **Stock:** ${product.stock}
- **Vibes:** ${product.vibe.join(", ")}
- **Images:** ${images}
- **Page:** ${baseUrl}/p/${product.id}

${product.description}

> **Agent pitch:** ${product.agent_pitch}

- Provenance: ${product.provenance}
- Conversation starter: ${product.conversation_starter}${pairsWith}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
