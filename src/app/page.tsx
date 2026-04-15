// TODO: replace Source Serif 4 with GT Super when license/files are available — ask Jared for the .woff2 files from opencard
import { JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { getSiteUrl } from "@/lib/url";
import CopyButton from "./copy-button";
import HeadlineTyper from "./headline-typer";

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500"],
  display: "swap",
});

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
const DOT = "#dcd9d4";

const agents = ["CLAUDE", "CHATGPT", "GEMINI"] as const;

export default function Home() {
  const siteUrl = getSiteUrl();
  const prompt = `Fetch ${siteUrl}/llms.txt and help me shop`;

  return (
    <div
      className={`${mono.variable} ${serif.variable}`}
      style={{
        fontFamily: "var(--font-mono)",
        backgroundColor: BG,
        backgroundImage: `radial-gradient(circle, ${DOT} 1.5px, transparent 1.5px)`,
        backgroundSize: "24px 24px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        body {
          background-color: ${BG};
          background-image: radial-gradient(circle, ${DOT} 1.5px, transparent 1.5px);
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
          {/* Headline — serif, types in on load */}
          <HeadlineTyper
            text="The shop your AI reads for you."
            style={{
              fontSize: "clamp(32px, 7vw, 80px)",
              fontWeight: 500,
              fontFamily: "var(--font-serif)",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              lineHeight: 1.05,
              color: FG,
              maxWidth: 900,
              margin: 0,
            }}
          />

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
            {/* Plain label — no box */}
            <span
              style={{
                display: "block",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: MUTED,
                marginBottom: 12,
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

          {/* Agent row — inline text with separators, no boxes */}
          <div
            style={{
              marginTop: 24,
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {agents.map((name, i) => (
              <span key={name} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <span style={{ color: MUTED, margin: "0 8px" }}>·</span>
                )}
                <span style={{ color: FG }}>{name}</span>
              </span>
            ))}
            <span style={{ display: "flex", alignItems: "center" }}>
              <span style={{ color: MUTED, margin: "0 8px" }}>·</span>
              <span style={{ color: MUTED }}>+ANY AGENT</span>
            </span>
          </div>
        </section>

        {/* Footer — plain text links, no pill boxes */}
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
