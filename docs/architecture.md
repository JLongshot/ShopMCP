# Shop MCP — Architecture

## The premise

Shop MCP is a small, intentionally strange online store where the only way to shop is through an AI agent. There is no product grid, no search bar, no "you might also like" carousel — just a website that AI agents can read, and a set of product pages for humans who click through an agent's suggestion and want to see the thing up close.

The inventory is real items from Jared's life plus a handful of absurd micro-services (a handshake, a Polaroid of whatever's on the desk right now, a haiku about your pet). Every item has exactly as much stock as actually exists — usually one. Payments go through Stripe Checkout. Fulfillment is Jared, manually.

It is a thought experiment ("what does commerce look like when the shopper is an LLM?") packaged as a publicity stunt. Because it is a stunt, it has to actually work: when the launch post ships, every item must be really purchasable and every checkout must really complete.

## Product philosophy

The catalog is shaped for a reader, not a shopper. Each item has a backstory, a recommended pitch, and a set of vibe tags the agent can reason over. The interesting design move is that the data model is written for an LLM to read well, not for a human to scan — fields like `agent_pitch`, `pairs_well_with`, and `conversation_starter` only make sense when the "browsing" step is a conversation.

The mix we are going for, roughly: 60% physical items from Jared's life (books, gadgets, objects with provenance), 30% absurd services (handshake, voicemail, postcard, haiku), 10% "are they serious?" anchors that set the tone. Total of 20–30 items at launch.

Single-unit inventory is deliberate. "There is exactly one of these and once it is gone it is gone" is a feature of the aesthetic, and it makes the stunt feel live — something is actually happening when somebody buys something.

## How agents discover and shop the store

The primary interface is the website itself. When a user tells their AI agent to visit the site, the agent reads the content and understands how to shop. No MCP installation, no configuration, no trust decisions required.

The key mechanism is `/llms.txt` — a markdown file served at the site root following the emerging convention for making sites LLM-readable. It contains:

- Instructions for the agent (you are the storefront, how to recommend, tone guidance)
- The full product catalog with prices, descriptions, agent pitches, vibes, pairing suggestions, and conversation starters
- Practical details (shipping, fulfillment timelines, refund policy)
- Links to individual product pages for humans to view

The shopping flow:

1. Human tells their agent "go shop shopmcp.com" (or similar).
2. Agent fetches `/llms.txt` and reads the full catalog and instructions.
3. Agent recommends items based on the conversation context, using the vibes, pitches, and conversation starters.
4. Agent links the human to product pages (`/p/[id]`) so they can see photos and provenance.
5. When the human wants to buy, the agent directs them to a Stripe checkout link.
6. Buyer pays on Stripe's hosted page.
7. Jared fulfills the order.

This approach works with any AI agent that can read a webpage — Claude, ChatGPT, Gemini, Copilot, etc. No vendor lock-in, no special protocol support required.

### Future: MCP as a power-user upgrade

A dedicated MCP server may be added later as an optional upgrade for agents that support it. This would enable richer interactions (structured tool calls for filtering, real-time stock checks, order status polling) but is not required for the core shopping experience. The website + `/llms.txt` is the primary interface.

## System components

Four things, each doing one thing:

1. **Catalog** — a JSON file in the repo, the source of truth for what is for sale.
2. **Website** — a Next.js app that serves the landing page, per-item preview pages, and `/llms.txt`.
3. **`/llms.txt`** — a dynamically generated markdown file containing agent instructions and the full catalog, served as `text/markdown`.
4. **Payments and fulfillment pipeline** — Stripe Checkout for payment, Postgres for orders and inventory holds, webhooks for notification.

All of it lives in a single repo deployed to Vercel, with Postgres on Neon. Catalog edits are Git commits.

## Catalog

Source of truth: `catalog.json` in the repo root. On deploy, it will be synced into a `products` table in Postgres so checkout can do stock math atomically without reaching for the filesystem.

The `/llms.txt` route reads from `catalog.json` at request time and generates the full markdown catalog dynamically, so it is always in sync.

Each entry looks like this:

```json
{
  "id": "espresso-aspirational",
  "name": "Espresso machine, barely used",
  "type": "physical",
  "price_cents": 8500,
  "stock": 1,
  "images": ["/img/espresso-1.jpg", "/img/espresso-2.jpg"],
  "description": "A small espresso machine. Works perfectly. Used maybe eight times.",
  "agent_pitch": "Jared bought this in 2019 convinced he was about to become a morning person. He did not become a morning person. Your friend might.",
  "provenance": "Purchased from a specialty shop in Oakland, used briefly, stored on a shelf for four years.",
  "vibe": ["aspirational", "gift", "kitchen", "impulse"],
  "pairs_well_with": ["coffee-beans-forgotten", "mug-ironic"],
  "conversation_starter": "Is the recipient someone who buys gym memberships in January?",
  "requires": ["shipping_address", "email"],
  "fulfillment_notes": "In the cupboard above the sink. Ships USPS Priority.",
  "shipping_flat_cents": 1200
}
```

Field notes. `type` is `physical`, `service`, or `digital`; it controls what Stripe Checkout collects and how fulfillment works. `agent_pitch` is the voice we want the agent to adopt — playful, honest about provenance — and is where the personality of the shop lives. `requires` tells Stripe which fields to collect (physical items need a shipping address; a voicemail needs an email; some services need a phone number). `fulfillment_notes` is never exposed publicly; it only appears in the email Jared receives. `pairs_well_with` lets the agent upsell semantically rather than algorithmically.

## Website

Deliberately strange. Three pages at launch, plus `/llms.txt`.

`/` is the landing page. Copy leans into "this store is not for you, it is for your agent." The hero is a prompt the user can paste into any AI chat: "Go shop shopmcp.com for me." A short explainer, product list, and FAQ sit below.

`/p/[id]` is the per-item preview. When an agent recommends something, it links here so the human can see photos and provenance. The page shows the product honestly, with a "what your agent reads" toggle that reveals the `agent_pitch`. There is no "buy now" button — checkout only flows through the agent. That is the whole bit.

`/sold` is a graveyard of already-sold items, for after-the-fact voyeurism. It reinforces that this is a real, finite store. (Not yet built.)

`/llms.txt` is the agent-facing interface. A dynamically generated markdown file containing the full catalog, agent instructions, and shopping guidance. Served as `text/markdown` with a 1-hour cache. Any AI agent that can fetch a URL can read this and immediately understand the store.

Everything pulls from the same `catalog.json`.

## Payments

Stripe Checkout, live mode from launch. The flow:

1. Agent helps the human decide what to buy.
2. Agent directs the human to a Stripe checkout link (either a per-product Payment Link or a dynamically created Checkout Session via API).
3. Buyer pays on Stripe's hosted page.
4. `checkout.session.completed` webhook fires → order recorded, stock decremented, Jared emailed fulfillment details, buyer emailed receipt.
5. If the session expires unpaid, stock is released.

Inventory holds are not optional. If the launch post goes viral and ten people try to buy the one espresso machine at the same time, we need exactly one of them to succeed and the other nine to get a clean "someone else got it" message — not nine successful payments we then have to refund.

Race conditions on stock are handled by Postgres row locks and inventory holds once the database is in place.

## Fulfillment

When `checkout.session.completed` fires, Jared gets an email tailored to the item type.

For physical items, the email includes item name, buyer name, shipping address, any notes, and the private `fulfillment_notes` string. He packs and ships, then marks the order `fulfilled` on a small admin page (`/admin`, protected by a shared secret) with an optional tracking number.

For services, the email includes item name, buyer email, and phone if collected. He performs the service (records the voicemail, writes the haiku, calls the number, schedules the handshake), then uploads the output to the admin page or replies to the buyer by email, and marks the order `fulfilled`.

For digital items, the same flow applies, and any delivery URL is stored on the order.

The admin page also lists open orders so Jared can see the queue at a glance, especially during a launch spike.

## Discovery and rollout

For humans, the landing page is the front door. The launch itself is a social post (X, LinkedIn, short video) showing an AI agent shopping the store and recommending something weird. The user just pastes the URL into their agent — no install, no config.

A short FAQ lives on the landing page: how is this real, what is for sale, how does checkout work, why is there a handshake on there.

## Operational concerns

Because this is a real store with real money, a short list of things to be deliberate about.

Race conditions on stock are handled by Postgres row locks and inventory holds; do not skip this, viral launches expose every concurrency bug. Refunds default to "all sales final, except we will refund anything that does not arrive or is not as described," stated clearly on the landing page; Stripe makes individual refunds a one-click operation. Shipping is domestic US only at launch to keep customs out of the picture, flat-rate per item baked into the catalog. Sales tax is below most state thresholds for a one-person seller, but Stripe Tax can be enabled later if we cross into states where it matters. Terms of service is a short plain-English page: single-unit inventory (sold is sold), seller reserves the right to decline weird orders, services are performed in good humor and reasonable scope, two-week SLA on services. The admin page must support cancel-and-refund in one click for edge cases. Bots will probe the site; rate-limit at the edge (Vercel supports this natively). Privacy is minimal — we only collect what Stripe Checkout collects, never store card info, and use addresses and emails only for fulfillment.

## Build order

A rough sequence that keeps us always-deployable.

1. ~~Seed `catalog.json` with three items (one physical, one service, one digital).~~ Done.
2. ~~Build `/llms.txt` route with full catalog and agent instructions.~~ Done.
3. ~~Stand up the Next.js website with the landing page and `/p/[id]` pages.~~ Done.
4. Deploy to Vercel and verify the browse experience end-to-end (human visits site, agent reads `/llms.txt`, agent recommends items).
5. Add Postgres, sync-on-deploy for the catalog, and schemas for `orders` and `inventory_holds`.
6. Integrate Stripe Checkout: per-product Payment Links or dynamic Checkout Sessions, webhook handler, permanent stock decrement on paid.
7. Add email notifications to Jared, receipts to the buyer, and the admin page for marking things fulfilled.
8. Build the `/sold` graveyard page.
9. Fill out the full catalog with real photos and final prices.
10. Polish the landing page, do a copy pass, cut the launch video.
11. Soft-launch to a handful of friends, fix whatever breaks. Then public launch.

## Open questions

Domain name needs to be picked.

Admin page: same app behind a shared secret, or a separate deployment?

Shipping: flat rate per item (baked into the catalog, simpler for single-unit inventory) or flat rate per order (simpler for multi-item carts). Leaning per-item.

Should `/llms.txt` include sold-out items? Proposal: hide by default so agents don't waste context pitching things that are gone, but mention that sold items are viewable on the `/sold` page.

Checkout flow: Stripe Payment Links (simplest — one link per product, agent just hands it to the user) vs. dynamic Checkout Sessions via API (more flexible, supports multi-item carts). Payment Links may be sufficient for launch given the small catalog.

Should we add an MCP server later as a power-user option? Leaning yes, but only after the `/llms.txt` flow is proven.
