import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import { LANDING_PROMPT } from "@/lib/prompt";
import HeadlineTyper from "./headline-typer";
import PromptCard from "./prompt-card";
import AgentButtonRow from "./agent-button-row";

// GT Ultra variable font (weights 100–900) — from opencard-dashboard
// NOTE: Jared asked for "GT Super" but GT Ultra is what's in the local projects.
// Verify with Jared — if GT Super files exist, drop this and wire them up via localFont.
const display = localFont({
  src: [{ path: "./fonts/GT-Ultra-VF.woff2", weight: "100 900", style: "normal" }],
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

export default function Home() {
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
        .footer-link:hover { text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 600px) {
          .page-footer { flex-direction: column !important; align-items: center !important; text-align: center; }
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

      {/* Content below fixed bar */}
      <div
        style={{
          paddingTop: 48,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Hero — fills remaining viewport height */}
        <section
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 16px",
            textAlign: "center",
          }}
        >
          {/* Headline — GT Ultra, sentence case, types in on load */}
          <HeadlineTyper
            text="The shop your AI reads for you."
            style={{
              fontSize: "clamp(40px, 7vw, 80px)",
              fontWeight: 500,
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: FG,
              maxWidth: 900,
              margin: 0,
            }}
          />

          {/* Prompt card — click anywhere to copy */}
          <PromptCard text={LANDING_PROMPT} />

          {/* Agent deep-link buttons — pre-fill each agent's composer with the prompt */}
          <AgentButtonRow />
        </section>

        {/* Footer — plain text links */}
        <footer
          className="page-footer"
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
                  <span style={{ color: MUTED, margin: "0 8px", fontSize: 11 }}>
                    ·
                  </span>
                )}
                <a
                  href={href}
                  className="footer-link"
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
