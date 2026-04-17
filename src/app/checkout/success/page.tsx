import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getProduct } from "@/lib/catalog";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
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
const WHITE = "#ffffff";

const DELIVERY: Record<string, string> = {
  physical: "Ships domestic US, usually within 3–5 business days.",
  digital: "We'll deliver to your email shortly.",
  service: "Jared will reach out to get started.",
};

function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${mono.variable} ${display.variable} ${body.variable}`}
      style={{
        fontFamily: "var(--font-body)",
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
        .checkout-footer-link:hover { text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 600px) {
          .checkout-footer { flex-direction: column !important; align-items: center !important; text-align: center; }
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
        <span style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: FG, fontFamily: "var(--font-mono)" }}>
          The Agent Catalog
        </span>
      </header>

      <div style={{ paddingTop: 48, flex: 1, display: "flex", flexDirection: "column" }}>
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 16px",
          }}
        >
          {children}
        </main>

        {/* Footer */}
        <footer
          className="checkout-footer"
          style={{
            padding: "20px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: MUTED, fontFamily: "var(--font-mono)" }}>
            © The Agent Catalog
          </span>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "PRIVACY", href: "/privacy" },
              { label: "TERMS", href: "/terms" },
              { label: "OVENBEARD@GMAIL.COM", href: "mailto:ovenbeard@gmail.com" },
            ].map(({ label, href }, i) => (
              <span key={label} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <span style={{ color: MUTED, margin: "0 8px", fontSize: 11 }}>·</span>}
                <a
                  href={href}
                  className="checkout-footer-link"
                  style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: MUTED, textDecoration: "none", fontFamily: "var(--font-mono)" }}
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

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return <Chrome><ErrorCard /></Chrome>;
  }

  let session: Stripe.Checkout.Session;
  try {
    const stripe = getStripe();
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });
  } catch {
    return <Chrome><ErrorCard /></Chrome>;
  }

  if (session.payment_status !== "paid") {
    return <Chrome><ErrorCard /></Chrome>;
  }

  const productName = session.metadata?.product_name ?? "your item";
  const productId = session.metadata?.product_id;
  const product = productId ? getProduct(productId) : null;
  const shortId = session_id.slice(-8).toUpperCase();
  const priceLine = product
    ? `$${(product.price_cents / 100).toFixed(2)}`
    : null;
  const delivery = product ? DELIVERY[product.type] ?? null : null;

  return (
    <Chrome>
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: WHITE,
          border: `1px solid ${GRID}`,
          borderRadius: 8,
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(22px, 4vw, 30px)",
            fontWeight: 500,
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            color: FG,
            margin: "0 0 16px",
          }}
        >
          Thanks — Jared got your order.
        </h1>

        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: FG,
            margin: "0 0 8px",
          }}
        >
          {productName}
          {priceLine && (
            <span style={{ color: MUTED }}> — {priceLine}</span>
          )}
        </p>

        {delivery && (
          <p style={{ fontSize: 14, lineHeight: 1.6, color: MUTED, margin: "0 0 24px" }}>
            {delivery}
          </p>
        )}

        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: MUTED,
            margin: "0 0 32px",
            fontFamily: "var(--font-mono)",
          }}
        >
          Ref: {shortId}
        </p>

        <a
          href="/"
          style={{
            fontSize: 12,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: MUTED,
            textDecoration: "none",
            borderBottom: `1px solid ${GRID}`,
            paddingBottom: 2,
            fontFamily: "var(--font-mono)",
          }}
        >
          ← Back to The Agent Catalog
        </a>
      </div>
    </Chrome>
  );
}

function ErrorCard() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        background: WHITE,
        border: `1px solid ${GRID}`,
        borderRadius: 8,
        padding: "40px 32px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: 24,
          fontWeight: 500,
          fontFamily: "var(--font-display)",
          color: FG,
          margin: "0 0 16px",
        }}
      >
        Hmm.
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.65, color: MUTED, margin: "0 0 32px" }}>
        We don&apos;t have a record of that payment yet. If you just completed checkout, try
        refreshing in a moment. If this keeps happening, email Jared directly.
      </p>
      <a
        href="/"
        style={{
          fontSize: 12,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: MUTED,
          textDecoration: "none",
          borderBottom: `1px solid ${GRID}`,
          paddingBottom: 2,
          fontFamily: "var(--font-mono)",
        }}
      >
        ← Back to The Agent Catalog
      </a>
    </div>
  );
}
