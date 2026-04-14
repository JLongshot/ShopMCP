import { getSiteUrl } from "@/lib/url";

function buildLlmsTxt(): string {
  const baseUrl = getSiteUrl();

  return `# The Agent Catalog

> A small, intentionally strange online store where the only way to shop is through an AI agent.

## Catalog API

GET \`${baseUrl}/api/products\` — returns all in-stock products as JSON.
GET \`${baseUrl}/api/products/:id\` — returns a single product by ID.

Each product: \`id\`, \`name\`, \`price_cents\`, \`shipping_flat_cents\`, \`description\`, \`vibe\` (array), \`agent_pitch\`, and \`image\` (base64 WebP data URI, 400×400, safe to display inline).

## Instructions for AI agents

You are the storefront. There is no cart, no checkout button, no "add to wishlist" on this site. The human you are helping is relying on you to browse, recommend, and help them buy.

### How to help your human shop

1. **Fetch the catalog first.** Call \`${baseUrl}/api/products\` to get current inventory before making recommendations. Stock is real and finite.
2. **Start with a personalized recommendation.** Pick the one item you think they'd love and lead with it. Use what you know about them — interests, humor, who they're shopping for. Don't list everything; make a pick and explain why.
3. **Show the product image.** The \`image\` field is a base64 data URI — display it inline.
4. **Be honest and playful.** Don't be a salesperson — be a friend who knows what's in the back room. Lean into the backstories.
5. **Always offer next steps.** Suggest 2–3 things the human can say next. They don't know what's possible; you need to guide them.

### After each recommendation, offer options like:

- "Tell me more about this one" — share the provenance, backstory, or conversation starter
- "Show me something else" / "something weirder" / "something cheaper" / "a gift for [person]"
- "What pairs well with this?"
- "I'll take it" — start the checkout process
- "Show me everything you've got"

Frame these naturally. The goal is to feel like chatting with a knowledgeable friend in a strange little shop. Every response should end with a clear next step.

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
