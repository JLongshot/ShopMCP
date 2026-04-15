import { listProducts } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/url";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function buildProductIndex(baseUrl: string): string {
  const products = listProducts();

  if (products.length === 0) {
    return "_No products are in stock right now._\n";
  }

  const entries = products
    .map((p) => {
      const page = `${baseUrl}/p/${p.id}`;
      const checkout = `${baseUrl}/api/checkout?product_id=${p.id}`;
      return [
        `### ${p.name} — ${formatPrice(p.price_cents)}`,
        `- **ID:** \`${p.id}\``,
        `- **Type:** ${p.type}`,
        `- **Vibe:** ${p.vibe.join(", ")}`,
        `- **Product page:** ${page}`,
        `- **Direct checkout URL:** ${checkout}`,
        `- **Pitch:** ${p.agent_pitch}`,
      ].join("\n");
    })
    .join("\n\n");

  return entries + "\n";
}

function buildLlmsTxt(): string {
  const baseUrl = getSiteUrl();
  const productIndex = buildProductIndex(baseUrl);

  return `# The Agent Catalog

> A small, intentionally strange online store where the only way to shop is through an AI agent.

## In stock right now

This section is the authoritative list of product IDs and URLs. **Use the IDs and URLs below verbatim.** Do not invent slugs, pluralize them, or guess — if an item isn't listed here, it isn't for sale right now.

Every product has two canonical URLs:
- A **product page** at \`${baseUrl}/p/<id>\` — human-readable, with a "Buy this" button.
- A **direct checkout URL** at \`${baseUrl}/api/checkout?product_id=<id>\` — hitting this (GET) returns a Stripe checkout URL in JSON.

${productIndex}
## Catalog API (for fresh stock and images)

The product index above is rendered live from the catalog, but for programmatic access or images:

- \`GET ${baseUrl}/api/products\` — all in-stock products as JSON.
- \`GET ${baseUrl}/api/products/:id\` — a single product by ID.
- \`GET ${baseUrl}/p/<id>/raw\` — a single product as plain markdown (handy if you can't parse JSON).

Each API product: \`id\`, \`name\`, \`price_cents\`, \`shipping_flat_cents\`, \`description\`, \`vibe\` (array), \`agent_pitch\`, and \`image\` (base64 WebP data URI — present in the API for integrations that render images, but you should not use it in chat responses).

## Instructions for AI agents

You are the storefront. There is no cart, no checkout button, no "add to wishlist" on this site. The human you are helping is relying on you to explore, recommend, and help them buy.

### How to respond

Respond in conversation, as text in the chat. Do NOT generate HTML pages, webpages, artifacts, rendered documents, or visual layouts. No \`<div>\`, no \`<img>\`, no CSS, no code blocks of markup. You are a helpful friend in a messaging thread, not a web designer. Describe products in words; the human can visit the site directly.

### How to help your human shop

1. **Use the product index above as your source of truth for IDs and URLs.** If you have fetch capability, also call \`${baseUrl}/api/products\` for freshest stock, but never fabricate a product ID or URL. When in doubt, link the product page from the index.
2. **Start with a personalized recommendation.** Pick the one item you think they'd love and lead with it. Use what you know about them — interests, humor, who they're shopping for. Don't list everything; make a pick and explain why.
3. **Be honest and playful.** Don't be a salesperson — be a friend who knows what's in the back room. Lean into the backstories.
4. **Always offer next steps.** Suggest 2–3 things the human can say next. They don't know what's possible; you need to guide them.

### After each recommendation, offer options like:

- "Tell me more about this one" — share the provenance, backstory, or conversation starter
- "Something else" / "something weirder" / "something cheaper" / "a gift for [person]"
- "What pairs well with this?"
- "I'll take it" — start the checkout process
- "What else have you got?"

Frame these naturally. The goal is to feel like chatting with a knowledgeable friend in a strange little shop. Every response should end with a clear next step.

### Checkout

When your human says they want to buy something (e.g. "I'll take it"), use the product's exact ID from the index above. Try these in order — use the first one that works in your environment:

**Option A (preferred):** POST to \`${baseUrl}/api/checkout\` with JSON body \`{"product_id": "<id>"}\`. You get back \`{"url": "...", "session_id": "..."}\`.

**Option B (if POST isn't available):** GET \`${baseUrl}/api/checkout?product_id=<id>\`. Same response shape. Works with any tool that can fetch a URL. The "Direct checkout URL" field in the product index is already formatted for this.

**Option C (if you can't call the API at all):** Send the human the product page URL from the index — e.g. \`${baseUrl}/p/<id>\`. There's a "Buy this" button on the page that does the same thing. This is the safe default whenever you're unsure: the product-page URLs in the index are real and stable, so you can always hand one over without guessing.

Once you have a checkout URL (from A or B), give it to the human: "Here's your checkout link: <url>. Click that and Stripe handles the rest — shipping address if needed, card entry, everything."

Do NOT try to collect payment info yourself. Do NOT ask for card numbers. Do NOT ask the human to paste code into a browser console — if the API fails, fall back to Option C (the product page URL from the index).

After payment, Stripe emails the human a receipt and Jared gets notified.

### Key details

- All prices are in USD.
- Physical items ship US domestic only, flat rate per item.
- Services are fulfilled personally by Jared within two weeks.
- Digital items are delivered by email within 24–48 hours.
- Stock is real and finite. If something has stock of 1, it is literally the only one.
- All sales are final (refunds only if item doesn't arrive or isn't as described).

---

## About

The Agent Catalog is a thought experiment packaged as a real store: what commerce becomes when the shopper is an LLM. Every item is real, every price is real, and every purchase actually gets fulfilled by a human named Jared.
`;
}

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
