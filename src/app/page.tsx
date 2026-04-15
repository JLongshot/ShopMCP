import { Fraunces } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/url";
import CopyButton from "./copy-button";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400"],
  display: "swap",
});

const BG = "#0e0d0b";
const FG = "#ece8dc";
const MUTED = "#7a776f";
const BORDER = "#2a2824";

export default function Home() {
  const siteUrl = getSiteUrl();
  const prompt = `Fetch ${siteUrl}/llms.txt and help me shop`;

  return (
    <main
      className={`${fraunces.variable} ${mono.variable}`}
      style={{
        minHeight: "100dvh",
        background: BG,
        color: FG,
        display: "flex",
        flexDirection: "column",
        padding: "24px",
      }}
    >
      {/* Override body background for this page only */}
      <style>{`body { background: ${BG}; }`}</style>

      {/* Nav */}
      <nav>
        <a
          href="/"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: 13,
            color: MUTED,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          The Agent Catalog
        </a>
      </nav>

      {/* Hero — vertically + horizontally centered */}
      <section
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 0",
        }}
      >
        <div
          style={{
            maxWidth: 580,
            width: "100%",
            textAlign: "center",
          }}
        >
          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(40px, 8vw, 88px)",
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: 24,
            }}
          >
            The shop your AI reads for you.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 18,
              color: MUTED,
              lineHeight: 1.5,
              marginBottom: 56,
            }}
          >
            Paste this into any chat. Your agent does the rest.
          </p>

          {/* Copy-prompt card */}
          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: "var(--radius)",
              padding: "28px 28px 24px",
              marginBottom: 32,
              textAlign: "left",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 15,
                lineHeight: 1.7,
                color: FG,
                marginBottom: 20,
                wordBreak: "break-word",
              }}
            >
              {prompt}
            </p>
            <CopyButton text={prompt} />
          </div>

          {/* Works-with line */}
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
            Works with Claude, ChatGPT, Gemini, or anything that can read a URL.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          fontSize: 13,
          color: MUTED,
          textAlign: "center",
          lineHeight: 1.8,
        }}
      >
        <span>© The Agent Catalog</span>
        {" · "}
        <a href="/privacy" style={{ color: MUTED, textDecoration: "none" }}>
          Privacy
        </a>
        {" · "}
        <a href="/terms" style={{ color: MUTED, textDecoration: "none" }}>
          Terms
        </a>
        {" · "}
        <a
          href="mailto:ovenbeard@gmail.com"
          style={{ color: MUTED, textDecoration: "none" }}
        >
          ovenbeard@gmail.com
        </a>
      </footer>
    </main>
  );
}
