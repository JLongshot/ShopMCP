# The Agent Catalog

A small, intentionally strange online store where the only way to shop is through your AI agent. No product grid, no cart, no buy button — just a website that AI agents can read and shop on behalf of their humans.

Inventory is real physical items from Jared's life plus a handful of absurd micro-services; most exist in quantity one. Payment is Stripe, fulfillment is Jared.

## How it works

1. A human tells their AI agent to visit the site (e.g. "go shop theagentcatalog.com for me").
2. The agent fetches `/llms.txt` — a markdown file containing the full catalog, shopping instructions, and tone guidance.
3. The agent recommends items, links to product pages, and handles checkout.
4. Jared ships it (or performs the service).

No plugin installation, no config, no trust decisions. Any AI that can read a webpage can shop here.

## Stack

- **Framework:** Next.js (TypeScript)
- **Hosting:** Vercel
- **Payments:** Stripe Checkout (Phase 2)
- **Database:** Postgres on Neon (Phase 2)

Single deployable. The catalog lives in `catalog.json` at the repo root.

## Project structure

```
catalog.json              # Source of truth for all products
src/
├── app/
│   ├── layout.tsx        # Root layout + metadata
│   ├── globals.css       # Minimal styling (CSS variables)
│   ├── page.tsx          # Landing page
│   ├── llms.txt/
│   │   └── route.ts      # /llms.txt — agent-readable catalog + instructions
│   └── p/[id]/
│       ├── page.tsx      # Product detail pages (SSG)
│       └── agent-pitch-toggle.tsx  # "What your agent reads" client component
└── lib/
    └── catalog.ts        # Typed catalog helpers
docs/
└── architecture.md       # Full design doc
```

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | From Stripe dashboard (Developers → API keys) |
| `STRIPE_SECRET_KEY` | Yes | From Stripe dashboard — keep secret, server-only |
| `STRIPE_WEBHOOK_SECRET` | Yes for webhooks | From Stripe dashboard after creating the webhook endpoint. Set the endpoint URL to `https://theagentcatalog.com/api/webhooks/stripe` and listen for `checkout.session.completed`. |
| `RESEND_API_KEY` | Yes for emails | From resend.com. Requires domain verification for `orders@theagentcatalog.com`. Without this key, order emails are skipped but the webhook still processes successfully. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Full URL of the site (e.g. `https://theagentcatalog.com`). Used for Stripe checkout success/cancel URLs. Falls back to `VERCEL_URL` or `localhost:3000`. |

**Inventory note:** When an item sells, update its `stock` in `catalog.json` and push to main. Vercel's serverless filesystem is immutable — runtime writes won't persist. A proper inventory database is planned for a future phase.

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # Production build
npm run typecheck # Type checking
```

## Build order

1. ~~Seed `catalog.json` with 3 items~~ Done
2. ~~Build `/llms.txt` route with full catalog + agent instructions~~ Done
3. ~~Next.js landing page + `/p/[id]` product pages~~ Done
4. Deploy to Vercel
5. Add Postgres, sync catalog on deploy, `orders` + `inventory_holds` schemas
6. Integrate Stripe Checkout, webhooks, email notifications
7. Add `/sold` graveyard page
8. Fill out full catalog with real photos + final prices
9. Polish landing page, cut launch video
10. Soft-launch to friends, fix bugs
11. Public launch
