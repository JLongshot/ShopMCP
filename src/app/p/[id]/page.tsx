import { notFound } from "next/navigation";
import { getAllProducts, getProduct } from "@/lib/catalog";
import { AgentPitchToggle } from "./agent-pitch-toggle";

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
    title: `${product.name} — Shop MCP`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const inStock = product.stock > 0;

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
        &larr; Shop MCP
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

      <section
        style={{
          marginTop: 48,
          padding: "20px 24px",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          background: "#fef2f2",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
          Want to buy this?
        </p>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          There is no buy button. Ask your AI agent to check out Shop MCP — it
          knows how to handle the rest.
        </p>
      </section>

      <footer
        style={{
          marginTop: 80,
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        <a href="/" style={{ color: "var(--muted)" }}>
          Shop MCP
        </a>
        {" — "}A store for your AI agent.
      </footer>
    </main>
  );
}
