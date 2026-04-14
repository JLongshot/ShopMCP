# Shop MCP — Architecture

## The premise

Shop MCP is a small, intentionally strange online store where the only way to shop is through an AI agent. There is no product grid, no search bar, no "you might also like" carousel — just an MCP server the customer's agent talks to, and a minimal website for humans who click through an agent's suggestion and want to see the thing up close.

The inventory is real items from Jared's life plus a handful of absurd micro-services (a handshake, a Polaroid of whatever's on the desk right now, a haiku about your pet). Every item has exactly as much stock as actually exists — usually one. Payments go through Stripe Checkout. Fulfillment is Jared, manually.

It is a thought experiment ("what does commerce look like when the shopper is an LLM?") packaged as a publicity stunt. Because it is a stunt, it has to actually work: when the launch post ships, every item must be really purchasable and every checkout must really complete.

## Product philosophy

The catalog is shaped for a reader, not a shopper. Each item has a backstory, a recommended pitch, and a set of vibe tags the agent can reason over. The interesting design move is that the data model is written for an LLM to read well, not for a human to scan — fields like `agent_pitch`, `pairs_well_with`, and `conversation_starter` only make sense when the "browsing" step is a conversation.

The mix we are going for, roughly: 60% physical items from Jared's life (books, gadgets, objects with provenance), 30% absurd services (handshake, voicemail, postcard, haiku), 10% "are they serious?" anchors that set the tone. Total of 20–30 items at launch.

Single-unit inventory is deliberate. "There is exactly one of these and once it is gone it is gone" is a feature of the aesthetic, and it makes the stunt feel live — something is actually happening when somebody buys something.

## System components

Four things, each doing one thing:

1. **Catalog** — a JSON file in the repo, the source of truth for what is for sale.
2. **MCP server** — a small TypeScript service that exposes the catalog and order flow as tools.
3. **Website** — a Next.js app that serves the landing page and per-item preview pages.
4. **Payments and fulfillment pipeline** — Stripe Checkout for payment, Postgres for orders and inventory holds, webhooks for notification.

All of it lives in a single repo deployed to Vercel, with Postgres on Neon. Catalog edits are Git commits.

## Catalog

Source of truth: `catalog.json` in the repo. On deploy, it is synced into a `products` table in Postgres so the MCP can do stock math atomically without reaching for the filesystem.

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

Field notes. `type` is `physical`, `service`, or `digital`; it controls what Stripe Checkout collects and how fulfillment works. `agent_pitch` is the voice we want the agent to adopt — playful, honest about provenance — and is where the personality of the shop lives. `requires` tells Stripe which fields to collect (physical items need a shipping address; a voicemail needs an email; some services need a phone number). `fulfillment_notes` is never returned by the MCP or shown publicly; it only appears in the email Jared receives. `pairs_well_with` lets the agent upsell semantically rather than algorithmically.

## MCP server

Remote-hosted (streamable HTTP), so users install it by pasting a URL into their agent. No auth — the store is public. Written in TypeScript, roughly 300 lines.

Tools it exposes:

- `list_products(filters?)` — returns in-stock items. Optional filters by `vibe`, `type`, `max_price_cents`. Returns `id`, `name`, `price_cents`, `agent_pitch`, `vibe`, and `type` — enough for the agent to pitch, not so much that the context fills up. Omits `provenance` and `fulfillment_notes` to keep responses compact.
- `get_product(id)` — full detail including provenance, images, `pairs_well_with`, and `conversation_starter`.
- `create_order(items, contact_email, shipping_address?)` — validates stock, places an inventory hold, creates a Stripe Checkout Session with the right line items and required fields, returns `{ checkout_url, order_id, expires_at }`.
- `check_order_status(order_id)` — returns `pending` / `paid` / `fulfilled` / `expired` / `refunded`, plus any buyer-facing fulfillment info (tracking number, delivery URL).

A deliberate non-feature: no server-side cart. The agent holds the cart in its own context; we only materialize it when `create_order` is called.

Hosting: Vercel. The MCP endpoint is a route in the same Next.js app as the website, so there is one deployable.

## Website

Deliberately strange. Three pages total.

`/` is the landing page. Copy leans into "this store is not for you, it is for your agent." The hero is the MCP install snippet, not a product grid. Secondary CTA opens a raw view of the catalog data ("see what your agent sees"). A short explainer for curious humans sits below the fold.

`/p/[id]` is the per-item preview. When an agent recommends something, it links here so the human can see photos and provenance. The page shows the product honestly, with a small "what your agent reads" toggle that reveals the `agent_pitch`. There is no "buy now" button — checkout only flows through the agent. That is the whole bit.

`/sold` is a graveyard of already-sold items, for after-the-fact voyeurism. It reinforces that this is a real, finite store.

Everything pulls from the same catalog as the MCP.

## Payments

Stripe Checkout, live mode from launch. The flow:

1. Agent calls `create_order`.
2. MCP checks stock in Postgres with a row-level lock. If anything is out of stock or already held, it returns a clean error the agent can relay.
3. MCP inserts a row into `orders` with status `pending` and a 30-minute TTL, and a row into `inventory_holds` marking the affected products as held.
4. MCP creates a Stripe Checkout Session with line items, matching `expires_at`, and the union of `requires` fields across the items (address, email, phone). Shipping costs are separate line items computed from `shipping_flat_cents`.
5. MCP returns the `checkout_url` and `order_id`.
6. Buyer pays on Stripe's hosted page.
7. `checkout.session.completed` webhook fires → MCP marks order `paid`, decrements stock permanently, removes the hold, emails Jared the fulfillment details, and emails the buyer a receipt.
8. If the session expires unpaid, `checkout.session.expired` webhook fires → order marked `expired`, hold released, stock available again.

Inventory holds are not optional. If the launch post goes viral and ten people try to buy the one espresso machine at the same time, we need exactly one of them to succeed and the other nine to get a clean "someone else got it" error through their agent — not nine successful payments we then have to refund.

## Fulfillment

When `checkout.session.completed` fires, Jared gets an email tailored to the item type.

For physical items, the email includes item name, buyer name, shipping address, any notes, and the private `fulfillment_notes` string. He packs and ships, then marks the order `fulfilled` on a small admin page (`/admin`, protected by a shared secret) with an optional tracking number.

For services, the email includes item name, buyer email, and phone if collected. He performs the service (records the voicemail, writes the haiku, calls the number, schedules the handshake), then uploads the output to the admin page or replies to the buyer by email, and marks the order `fulfilled`.

For digital items, the same flow applies, and any delivery URL is stored on the order so `check_order_status` can return it.

The admin page also lists open orders so Jared can see the queue at a glance, especially during a launch spike.

## Discovery and rollout

For humans, the landing page is the front door. For agents, the MCP needs to be listed on Anthropic's MCP registry, Smithery, PulseMCP, and any other aggregators that are live at launch.

The launch itself is a social post (X, LinkedIn, short video) showing Jared talking to Claude, Claude recommending a weird item based on context, and Jared clicking the checkout link that Claude returns. One-sentence tagline: "I built a store where the only way to shop is through your AI. Yes, you can actually buy things."

A short FAQ lives on the landing page: how is this real, what is for sale, how does checkout work, why is there a handshake on there.

## Operational concerns

Because this is a real store with real money, a short list of things to be deliberate about.

Race conditions on stock are handled by Postgres row locks and inventory holds; do not skip this, viral launches expose every concurrency bug. Refunds default to "all sales final, except we will refund anything that does not arrive or is not as described," stated clearly on the landing page; Stripe makes individual refunds a one-click operation. Shipping is domestic US only at launch to keep customs out of the picture, flat-rate per item baked into the catalog. Sales tax is below most state thresholds for a one-person seller, but Stripe Tax can be enabled later if we cross into states where it matters. Terms of service is a short plain-English page: single-unit inventory (sold is sold), seller reserves the right to decline weird orders, services are performed in good humor and reasonable scope, two-week SLA on services. The admin page must support cancel-and-refund in one click for edge cases. Bots will probe the MCP; rate-limit at the edge (Vercel supports this natively). Privacy is minimal — we only collect what Stripe Checkout collects, never store card info, and use addresses and emails only for fulfillment.

## Build order

A rough sequence that keeps us always-deployable.

First, seed `catalog.json` with three items (one physical, one service, one digital). Then build the MCP with `list_products` and `get_product` only, reading straight from the JSON. Stand up the Next.js website with the landing page and `/p/[id]` pages against the same data source. Deploy to Vercel and connect from Claude Desktop to verify the browse experience end-to-end. Next, add Postgres, sync-on-deploy for the catalog, and schemas for `orders` and `inventory_holds`. Integrate Stripe Checkout: the `create_order` tool, the webhook handler, permanent stock decrement on paid. Add email notifications to Jared, receipts to the buyer, and the admin page for marking things fulfilled. Then the `check_order_status` tool. Fill out the full catalog with real photos and final prices. Polish the landing page, do a copy pass, cut the launch video, and submit to MCP registries. Soft-launch to a handful of friends, fix whatever breaks. Then public launch.

## Open questions

Remote MCP is assumed for the primary launch target; confirm whether we also ship a stdio version for power users on day one.

Domain name needs to be picked.

Admin page: same app behind a shared secret, or a separate deployment?

Shipping: flat rate per item (baked into the catalog, simpler for single-unit inventory) or flat rate per order (simpler for multi-item carts). Leaning per-item.

Should `list_products` include sold-out items by default? Proposal: hide by default, expose via a filter, so the agent does not waste context pitching things that are gone.
