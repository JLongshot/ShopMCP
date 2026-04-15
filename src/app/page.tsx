import { JetBrains_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/url";
import CopyButton from "./copy-button";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const BG = "#efedea";
const FG = "#111";
const MUTED = "#767372";
const WHITE = "#ffffff";

const agents = ["CLAUDE", "CHATGPT", "GEMINI"] as const;

export default function Home() {
  const siteUrl = getSiteUrl();
  const prompt = `Fetch ${siteUrl}/llms.txt and help me shop`;

  return (
    <div
      className={mono.variable}
      style={{
        fontFamily: "var(--font-mono)",
        background: BG,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        body { background: ${BG}; margin: 0; }
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
          background: BG,
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
        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            color: FG,
          }}
        >
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
        {/* Hero — fill remaining viewport height */}
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
          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(32px, 7vw, 80px)",
              fontWeight: 500,
              fontFamily: "var(--font-mono)",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              lineHeight: 1.05,
              color: FG,
              maxWidth: 900,
              margin: 0,
            }}
          >
            The shop your AI reads for you.
          </h1>

          {/* Copy-prompt card */}
          <div
            style={{
              marginTop: 64,
              width: "100%",
              maxWidth: 560,
              background: WHITE,
              border: `1px solid ${FG}`,
              borderRadius: 0,
              padding: 24,
              textAlign: "left",
            }}
          >
            {/* Pill tag */}
            <span
              style={{
                display: "inline-block",
                background: WHITE,
                border: `1px solid ${FG}`,
                padding: "2px 8px",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: FG,
                marginBottom: 14,
                borderRadius: 0,
              }}
            >
              PROMPT
            </span>

            {/* Prompt text */}
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: FG,
                marginBottom: 16,
                wordBreak: "break-all",
              }}
            >
              {prompt}
            </p>

            <CopyButton text={prompt} />
          </div>

          {/* Agent pills */}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {agents.map((name) => (
              <span
                key={name}
                style={{
                  display: "inline-block",
                  background: WHITE,
                  border: `1px solid ${FG}`,
                  padding: "4px 10px",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: FG,
                  borderRadius: 0,
                }}
              >
                {name}
              </span>
            ))}
            <span
              style={{
                display: "inline-block",
                background: WHITE,
                border: "1px solid #ccc",
                padding: "4px 10px",
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: MUTED,
                borderRadius: 0,
              }}
            >
              + ANY AGENT
            </span>
          </div>
        </section>

        {/* Footer */}
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
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { label: "PRIVACY", href: "/privacy" },
              { label: "TERMS", href: "/terms" },
              { label: "OVENBEARD@GMAIL.COM", href: "mailto:ovenbeard@gmail.com" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  display: "inline-block",
                  background: WHITE,
                  border: "1px solid #ccc",
                  padding: "3px 8px",
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: MUTED,
                  textDecoration: "none",
                  borderRadius: 0,
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
