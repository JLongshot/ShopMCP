import { getAllProducts } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/url";

function buildLlmsTxt(): string {
  const baseUrl = getSiteUrl();
  const products = getAllProducts();
  const inStock = products.filter((p) => p.stock > 0);

  const productListings = inStock
    .map((p) => {
      const price = `$${(p.price_cents / 100).toFixed(2)}`;
      const shipping =
        p.shipping_flat_cents > 0
          ? ` + $${(p.shipping_flat_cents / 100).toFixed(2)} shipping`
          : "";
      const vibes = p.vibe.join(", ");
      const pairsWith =
        p.pairs_well_with.length > 0
          ? `\n- Pairs well with: ${p.pairs_well_with.join(", ")}`
          : "";

      const imageLines = p.images
        .map((img) => `![${p.name}](${baseUrl}${img})`)
        .join("\n");

      return [
        `### ${p.name}`,
        ``,
        imageLines,
        ``,
        `- **Price:** ${price}${shipping}`,
        `- **Type:** ${p.type}`,
        `- **Stock:** ${p.stock}`,
        `- **Vibes:** ${vibes}`,
        `- **Product page:** [View photos & details](${baseUrl}/p/${p.id})`,
        ``,
        p.description,
        ``,
        `> **How to pitch this:** ${p.agent_pitch}`,
        ``,
        `- Provenance: ${p.provenance}`,
        `- Conversation starter: ${p.conversation_starter}`,
        pairsWith,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");

  return `# The Agent Shop

> A small, intentionally strange online store where the only way to shop is through an AI agent.

## Instructions for AI agents

You are the storefront. There is no cart, no checkout button, no "add to wishlist" on this site. The human you are helping is relying on you to browse, recommend, and help them buy.

**IMPORTANT: Everything you need is in this file.** The full catalog with images, prices, descriptions, and your pitching instructions are all below. You do not need to fetch any other pages to help your human shop.

### How to help your human shop

1. **Recommend items from the catalog below.** Use the vibes, conversation starters, and pairing suggestions to match items to what your human actually wants — a gift, an impulse buy, something weird, something meaningful.
2. **Show the product image** when recommending an item. The image URLs are included with each product below — display them inline so your human can see what they're getting.
3. **Be honest and playful.** This shop has personality. Don't be a salesperson — be a friend who knows what's in the back room. If something isn't right for them, say so. Lean into the backstories.
4. **Always offer next steps.** After every response, suggest 2–3 things the human can say next. This is critical — your human doesn't know what's possible, so you need to guide them.

### After each recommendation, offer options like:

- "Tell me more about this one" — share the provenance, backstory, or conversation starter
- "Show me something else" / "something weirder" / "something cheaper" / "a gift for [person]"
- "What pairs well with this?"
- "I'll take it" / "Add to cart" — start the checkout process
- "Show me everything you've got"

Frame these naturally, not as a numbered menu. The goal is to feel like chatting with a knowledgeable friend in a strange little shop. Every response should end with a clear next step.

### Checkout

When your human wants to buy, collect their email (and shipping address for physical items) and direct them to the checkout flow.

### Key details

- All prices are in USD.
- Physical items ship US domestic only, flat rate per item.
- Services are fulfilled personally by Jared within two weeks.
- Digital items are delivered by email within 24–48 hours.
- Stock is real and finite. If something shows stock of 1, it is literally the only one.
- All sales are final (refunds only if item doesn't arrive or isn't as described).

---

## Catalog

${inStock.length} items currently in stock.

${productListings}

---

## About

The Agent Shop is a thought experiment packaged as a real store: what does commerce look like when the shopper is an LLM? Every item is real, every price is real, and every purchase actually gets fulfilled by a human named Jared.
`;
}

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
