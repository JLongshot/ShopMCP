import { notFound, redirect } from "next/navigation";
import { getAllProducts, getProduct } from "@/lib/catalog";
import { createCheckoutSession } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/url";
import { AgentPitchToggle } from "./agent-pitch-toggle";

const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false;

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return {};
  return {
    title: `${product.name} — The Agent Catalog`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkout_error?: string }>;
}) {
  const { id } = await params;
  const { checkout_error } = await searchParams;
  const product = getProduct(id);
  if (!product || product.stock === 0) notFound();

  const inStock = product.stock > 0;
  const hasCheckoutError = checkout_error === "1";

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px" }}>
      <a
        href="/"
        style={{
          fontSize: 13,
          color: "var(--muted)",
          textDecoration: "none",
        }}
      >
        &larr; The Agent Catalog
      </a>

      {product.images.length > 0 && (
        <div style={{ marginTop: 24 }}>
          {product.images.map((src) => (
            <img
              key={src}
              src={src}
              alt={product.name}
              style={{
                width: "100%",
                borderRadius: "var(--radius)",
                marginBottom: 12,
              }}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}>
            {product.name}
          </h1>
          <span
            style={{
              fontSize: 20,
              fontWeight: 500,
              whiteSpace: "nowrap",
              color: inStock ? "var(--fg)" : "var(--muted)",
            }}
          >
            ${(product.price_cents / 100).toFixed(2)}
          </span>
        </div>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            alignItems: "center",
            fontSize: 13,
          }}
        >
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--muted)",
            }}
          >
            {product.type}
          </span>
          {!inStock && (
            <span
              style={{
                color: "var(--accent)",
                fontWeight: 500,
              }}
            >
              Sold
            </span>
          )}
        </div>
      </div>

      <section style={{ marginTop: 32 }}>
        <p style={{ fontSize: 16, lineHeight: 1.7 }}>{product.description}</p>
      </section>

      {product.provenance && (
        <section style={{ marginTop: 24 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--muted)",
              marginBottom: 6,
            }}
          >
            Provenance
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.6 }}>
            {product.provenance}
          </p>
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {product.vibe.map((v) => (
            <span
              key={v}
              style={{
                fontSize: 12,
                padding: "3px 10px",
                borderRadius: 999,
                border: "1px solid var(--border)",
                color: "var(--muted)",
              }}
            >
              {v}
            </span>
          ))}
        </div>
      </section>

      <AgentPitchToggle pitch={product.agent_pitch} />

      {product.shipping_flat_cents > 0 && (
        <p
          style={{
            marginTop: 24,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          Shipping: ${(product.shipping_flat_cents / 100).toFixed(2)} flat rate
          (US domestic)
        </p>
      )}

      <div style={{ marginTop: 48 }}>
        {hasCheckoutError && (
          <p
            style={{
              marginBottom: 12,
              fontSize: 13,
              color: "var(--accent)",
              padding: "10px 14px",
              border: "1px solid var(--accent)",
              borderRadius: "var(--radius)",
              opacity: 0.85,
            }}
          >
            Hmm — something went wrong starting checkout. Try again in a moment.
          </p>
        )}
        {inStock ? (
          <form
            action={async () => {
              "use server";
              try {
                const { url } = await createCheckoutSession(product.id, getSiteUrl());
                redirect(url);
              } catch (err) {
                console.error("[checkout] Session creation failed:", err);
                redirect(`/p/${product.id}?checkout_error=1`);
              }
            }}
          >
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px 24px",
                background: "var(--fg)",
                color: "var(--bg)",
                border: "none",
                borderRadius: "var(--radius)",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Buy this &mdash; ${(product.price_cents / 100).toFixed(2)}
            </button>
          </form>
        ) : (
          <button
            disabled
            style={{
              width: "100%",
              padding: "14px 24px",
              background: "transparent",
              color: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              fontSize: 16,
              fontWeight: 600,
              cursor: "not-allowed",
            }}
          >
            Sold out
          </button>
        )}
        {isTestMode && inStock && (
          <p style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
            Test mode — no real payment will be taken.
          </p>
        )}
      </div>

      <footer
        style={{
          marginTop: 80,
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        <a href="/" style={{ color: "var(--muted)" }}>The Agent Catalog</a>
        {" · "}
        <a href="/privacy" style={{ color: "var(--muted)" }}>Privacy</a>
        {" · "}
        <a href="/terms" style={{ color: "var(--muted)" }}>Terms</a>
        {" · "}
        <a href="mailto:ovenbeard@gmail.com" style={{ color: "var(--muted)" }}>ovenbeard@gmail.com</a>
      </footer>
    </main>
  );
}
