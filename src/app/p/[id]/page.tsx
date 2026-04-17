import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import { notFound, redirect } from "next/navigation";
import { getAllProducts, getProduct } from "@/lib/catalog";
import { getStock } from "@/lib/inventory";
import { createCheckoutSession } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/url";
import { AgentPitchToggle } from "./agent-pitch-toggle";

const display = localFont({
  src: [{ path: "../../fonts/GT-Ultra-VF.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const BG = "#eceeef";
const FG = "#111";
const MUTED = "#7a7d80";
const GRID = "#dcdfe1";
const ACCENT = "#5b5bd6";
const WHITE = "#ffffff";

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
  if (!product) notFound();

  const stock = await getStock(id);
  if (stock === 0) notFound();

  const inStock = stock > 0;
  const hasCheckoutError = checkout_error === "1";

  return (
    <div
      className={`${mono.variable} ${display.variable}`}
      style={{
        fontFamily: "var(--font-mono)",
        backgroundColor: BG,
        backgroundImage: [
          `linear-gradient(to right, ${GRID} 1px, transparent 1px)`,
          `linear-gradient(to bottom, ${GRID} 1px, transparent 1px)`,
        ].join(", "),
        backgroundSize: "24px 24px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        body {
          background-color: ${BG};
          background-image:
            linear-gradient(to right, ${GRID} 1px, transparent 1px),
            linear-gradient(to bottom, ${GRID} 1px, transparent 1px);
          background-size: 24px 24px;
          margin: 0;
        }
        .pdp-footer-link:hover { text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 600px) {
          .pdp-footer { flex-direction: column !important; align-items: center !important; text-align: center; }
        }
      `}</style>

      {/* Fixed top bar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          backgroundColor: BG,
          borderBottom: `1px solid ${FG}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 100,
        }}
      >
        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: FG,
          }}
        >
          The Agent Catalog
        </span>
        <span style={{ fontSize: 13, letterSpacing: "0.08em", color: FG }}>
          × 0
        </span>
      </header>

      {/* Page content */}
      <div
        style={{
          paddingTop: 48,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main
          style={{
            flex: 1,
            maxWidth: 640,
            width: "100%",
            margin: "0 auto",
            padding: "40px 24px 64px",
          }}
        >
          {/* Back link */}
          <a
            href="/"
            style={{
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: MUTED,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← The Agent Catalog
          </a>

          {/* Product image */}
          {product.images.length > 0 && (
            <div
              style={{
                marginTop: 24,
                background: WHITE,
                borderRadius: 8,
                border: `1px solid ${GRID}`,
                overflow: "hidden",
              }}
            >
              {product.images.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt={product.name}
                  style={{ width: "100%", display: "block" }}
                />
              ))}
            </div>
          )}

          {/* Name + Price */}
          <div
            style={{
              marginTop: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 16,
            }}
          >
            <h1
              style={{
                fontSize: "clamp(22px, 4vw, 32px)",
                fontWeight: 500,
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
                color: FG,
                margin: 0,
              }}
            >
              {product.name}
            </h1>
            <span
              style={{
                fontSize: 20,
                fontWeight: 500,
                whiteSpace: "nowrap",
                color: inStock ? FG : MUTED,
                flexShrink: 0,
              }}
            >
              ${(product.price_cents / 100).toFixed(2)}
            </span>
          </div>

          {/* Type + sold-out badge */}
          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              {product.type}
            </span>
            {!inStock && (
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#c0392b",
                  fontWeight: 500,
                }}
              >
                Sold out
              </span>
            )}
          </div>

          {/* Description */}
          <section style={{ marginTop: 28 }}>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.75,
                color: FG,
                margin: 0,
              }}
            >
              {product.description}
            </p>
          </section>

          {/* Provenance */}
          {product.provenance && (
            <section
              style={{
                marginTop: 24,
                padding: "16px 20px",
                background: WHITE,
                border: `1px solid ${GRID}`,
                borderRadius: 8,
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: MUTED,
                  marginBottom: 8,
                }}
              >
                Provenance
              </span>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: MUTED,
                  margin: 0,
                }}
              >
                {product.provenance}
              </p>
            </section>
          )}

          {/* Vibe tags — dot separators, no pill boxes */}
          {product.vibe.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: MUTED,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {product.vibe.map((v, i) => (
                  <span key={v} style={{ display: "flex", alignItems: "center" }}>
                    {i > 0 && (
                      <span style={{ margin: "0 8px", color: MUTED }}>·</span>
                    )}
                    {v}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Agent pitch */}
          <AgentPitchToggle pitch={product.agent_pitch} />

          {/* Shipping note */}
          {product.shipping_flat_cents > 0 && (
            <p
              style={{
                marginTop: 20,
                fontSize: 12,
                letterSpacing: "0.04em",
                color: MUTED,
              }}
            >
              + ${(product.shipping_flat_cents / 100).toFixed(2)} flat shipping · US domestic
            </p>
          )}

          {/* Buy / Contact / Sold out */}
          <div style={{ marginTop: 40 }}>
            {hasCheckoutError && (
              <p
                style={{
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#c0392b",
                  padding: "10px 14px",
                  border: "1px solid #e8b4b0",
                  borderRadius: 6,
                  background: "#fdf3f2",
                }}
              >
                Something went wrong starting checkout. Try again in a moment.
              </p>
            )}
            {product.contact_only ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <a
                  href="mailto:ovenbeard@gmail.com?subject=Angel%20Check%20-%20The%20Agent%20Catalog"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "13px 48px",
                    background: ACCENT,
                    color: WHITE,
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Get in touch
                </a>
              </div>
            ) : inStock ? (
              <form
                action={async () => {
                  "use server";
                  let checkoutUrl: string;
                  try {
                    const { url } = await createCheckoutSession(product.id, getSiteUrl());
                    checkoutUrl = url;
                  } catch (err) {
                    console.error("[checkout] Session creation failed:", err);
                    redirect(`/p/${product.id}?checkout_error=1`);
                  }
                  redirect(checkoutUrl);
                }}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <button
                  type="submit"
                  style={{
                    padding: "13px 48px",
                    background: ACCENT,
                    color: WHITE,
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Buy this — ${(product.price_cents / 100).toFixed(2)}
                </button>
              </form>
            ) : (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  disabled
                  style={{
                    padding: "13px 48px",
                    background: "transparent",
                    color: MUTED,
                    border: `1px solid ${GRID}`,
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "not-allowed",
                  }}
                >
                  Sold out
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer
          className="pdp-footer"
          style={{
            padding: "20px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            © The Agent Catalog
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { label: "PRIVACY", href: "/privacy" },
              { label: "TERMS", href: "/terms" },
              { label: "OVENBEARD@GMAIL.COM", href: "mailto:ovenbeard@gmail.com" },
            ].map(({ label, href }, i) => (
              <span key={label} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <span style={{ color: MUTED, margin: "0 8px", fontSize: 11 }}>·</span>
                )}
                <a
                  href={href}
                  className="pdp-footer-link"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: MUTED,
                    textDecoration: "none",
                  }}
                >
                  {label}
                </a>
              </span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
