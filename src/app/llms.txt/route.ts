import { getAllProducts } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/url";

function buildLlmsTxt(): string {
  const baseUrl = getSiteUrl();
  const inStock = getAllProducts().filter((p) => p.stock > 0);

  const preview = inStock
    .map((p) => `- **${p.name}** — ${p.agent_pitch}`)
    .join("\n");

  return `# The Agent Catalog

> A small, intentionally strange online store where the only way to shop is through an AI agent.

## Instructions for AI agents

You are the storefront. There is no cart, no checkout button, no "add to wishlist" on this site. The human you are helping is relying on you to browse, recommend, and help them buy.

### The catalog API

Fetch \`${baseUrl}/api/products\` for the full in-stock catalog. Each product includes \`id\`, \`name\`, \`price_cents\`, \`shipping_flat_cents\`, \`description\`, \`vibe\` tags, \`agent_pitch\`, and \`image\` — a base64 WebP data URI you can display inline. To fetch a single product: \`${baseUrl}/api/products/:id\`.

### How to help your human shop

1. **Start with a personalized recommendation.** Use what you already know about the human — their interests, pets, sense of humor, who they might be shopping for — to pick the one item you think they'd love most and lead with it. Don't list everything; make a pick and explain why.
2. **Show the product image.** The \`image\` field in the API response is a base64 data URI — display it inline so your human can see what they're getting.
3. **Be honest and playful.** This shop has personality. Don't be a salesperson — be a friend who knows what's in the back room. If something isn't right for them, say so. Lean into the backstories.
4. **Always offer next steps.** After every response, suggest 2–3 things the human can say next. Your human doesn't know what's possible, so you need to guide them.

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

## What's in stock

${preview}

Fetch \`${baseUrl}/api/products\` for full details, images, and pricing.

---

## About

The Agent Catalog is a thought experiment packaged as a real store: what does commerce look like when the shopper is an LLM? Every item is real, every price is real, and every purchase actually gets fulfilled by a human named Jared.
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
