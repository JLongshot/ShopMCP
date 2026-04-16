import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";

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
const WHITE = "#ffffff";

export default function CancelPage() {
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
        <span style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: FG }}>
          The Agent Catalog
        </span>
        <span style={{ fontSize: 13, letterSpacing: "0.08em", color: FG }}>× 0</span>
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
              No worries.
            </h1>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: MUTED,
                margin: "0 0 32px",
              }}
            >
              Come back when you&apos;re ready.
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
              }}
            >
              ← Back to The Agent Catalog
            </a>
          </div>
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
          <span style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: MUTED }}>
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
                  style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: MUTED, textDecoration: "none" }}
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
