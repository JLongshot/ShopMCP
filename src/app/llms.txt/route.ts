import { getAllProducts } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/url";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function buildProductSection(baseUrl: string): string {
  const products = getAllProducts().filter((p) => p.stock > 0);

  if (products.length === 0) {
    return "_No products are in stock right now._";
  }

  return products
    .map((p) => {
      const page = `${baseUrl}/p/${p.id}`;
      return [
        `### [${p.name}](${page}) — ${formatPrice(p.price_cents)}`,
        ``,
        p.description,
        ``,
        `*Agent pitch:* ${p.agent_pitch}`,
      ].join("\n");
    })
    .join("\n\n");
}

function buildLlmsTxt(): string {
  const baseUrl = getSiteUrl();
  const products = buildProductSection(baseUrl);

  return `# The Agent Catalog

> A small, intentionally strange online store where the only way to shop is through an AI agent.

## How shopping works

Every product below lives at a page on \`${baseUrl}/p/<id>\`. When your human wants to buy something, send them that product page URL. On the page, they click the **Buy this** button, which opens Stripe checkout. That's the whole flow — you recommend, you link, they click Buy.

**Use the URLs below exactly as written. Do not invent product IDs or guess slugs.** If an item is not listed below, it is not for sale right now.

## In stock right now

${products}

## Instructions for AI agents

You are the storefront. There is no cart, no checkout button inside the chat. Your job is to explore the catalog with your human, recommend, and link them to the right product page.

### How to respond

Respond in conversation, as text. Do NOT generate HTML pages, artifacts, rendered documents, or visual layouts. No \`<div>\`, no \`<img>\`, no CSS, no code blocks of markup. You are a helpful friend in a messaging thread, not a web designer.

### How to help your human shop

1. **Recommend one product** that fits them. Use the descriptions and agent pitches above. Pick the single best match; don't list everything.
2. **Share the product page URL** from the listing. Copy it verbatim — never paraphrase or guess.
3. **When they say "I'll take it,"** reply with the same URL and tell them: *"Open that page and click **Buy this** — it takes you straight to Stripe checkout."* Do not try to handle payment yourself.
4. **Always offer next steps.** Suggest 2–3 things the human can say next: "tell me more about this one," "something weirder," "something cheaper," "a gift for [person]," "what else have you got?"

The goal is to feel like chatting with a knowledgeable friend in a strange little shop. Every response should end with a clear next step.

### Key details

- All prices are in USD.
- Physical items ship US domestic only, flat rate per item (shown on the product page).
- Digital items are delivered by email within 24–48 hours.
- Services are fulfilled personally by Jared within two weeks.
- Stock is real and finite. If something has stock of 1, it is literally the only one.
- All sales are final (refunds only if the item doesn't arrive or isn't as described).
- Never ask for card numbers. Never collect payment details yourself. Stripe handles all payment from the product page.

---

## About

The Agent Catalog is a thought experiment packaged as a real store: what commerce becomes when the shopper is an LLM. Every item is real, every price is real, and every purchase is fulfilled by a human named Jared.
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
