# Shop MCP

A small online store with no browsable storefront. The only way to shop is by connecting the store's MCP server to an AI agent and having a conversation. Inventory is real physical items from Jared's life plus a handful of absurd micro-services; most exist in quantity one. Payment is Stripe, fulfillment is Jared.

**Status:** bootstrapping. Nothing is built yet — this repo currently holds the architecture doc and an empty scaffold.

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full design (system components, catalog schema, MCP tool surface, payment flow, build order).

The live source of truth for the architecture doc lives at `~/Documents/Claude/Projects/Shop MCP/architecture.md`; the copy in this repo is a snapshot.

## Stack (per arch doc)

TypeScript + Next.js, single deployable on Vercel. Postgres on Neon. Stripe Checkout for payments. The MCP endpoint is a route in the same Next.js app as the website.

## Build order

Per the arch doc, roughly: seed `catalog.json` → MCP with `list_products` / `get_product` from JSON → Next.js landing + `/p/[id]` → Vercel deploy → Postgres sync → Stripe Checkout + webhooks → admin page → full catalog → launch.
