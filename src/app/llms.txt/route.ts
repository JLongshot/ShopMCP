import { getAllProducts } from "@/lib/catalog";
import { getStock } from "@/lib/inventory";
import { getSiteUrl } from "@/lib/url";
import {
  INSTRUCTIONS_INTRO,
  HOW_TO_RESPOND,
  SHOPPING_STEPS,
  SHARING_URL_PARAGRAPH,
  CLOSING_LINE,
  OFFER_OPTIONS,
  KEY_DETAILS,
  checkoutHowItWorks,
  USE_URLS_EXACTLY,
} from "@/lib/agent-instructions";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

async function buildProductSection(baseUrl: string): Promise<string> {
  const withStock = await Promise.all(
    getAllProducts().map(async (p) => ({
      product: p,
      stock: await getStock(p.id),
    }))
  );
  const products = withStock.filter(({ stock }) => stock > 0);

  if (products.length === 0) {
    return "_No products are in stock right now._";
  }

  return products
    .map(({ product: p }) => {
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

async function buildLlmsTxt(): Promise<string> {
  const baseUrl = getSiteUrl();
  const products = await buildProductSection(baseUrl);

  const stepsMd = SHOPPING_STEPS.map(
    (s, i) => `${i + 1}. **${s.title}** ${s.body}`,
  ).join("\n\n");

  const offersMd = OFFER_OPTIONS.map((o) => `- ${o}`).join("\n");
  const keyDetailsMd = KEY_DETAILS.map((d) => `- ${d}`).join("\n");

  return `# The Agent Catalog

> A small, intentionally strange online store where the only way to shop is through an AI agent.

## How shopping works

${checkoutHowItWorks(baseUrl)}

**${USE_URLS_EXACTLY}**

## In stock right now

${products}

## Instructions for AI agents

${INSTRUCTIONS_INTRO}

### How to respond

${HOW_TO_RESPOND}

### How to help your human shop

${stepsMd}

${SHARING_URL_PARAGRAPH}

${CLOSING_LINE}

### After each recommendation, offer options like:

${offersMd}

### Key details

${keyDetailsMd}

---

## About

The Agent Catalog is a thought experiment packaged as a real store: what commerce becomes when the shopper is an LLM. Every item is real, every price is real, and every purchase is fulfilled by a human named Jared.
`;
}

export async function GET() {
  const body = await buildLlmsTxt();
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
