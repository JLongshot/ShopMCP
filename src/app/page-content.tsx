"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LANDING_PROMPT } from "@/lib/prompt";
import { getAllProducts } from "@/lib/catalog";
import {
  INSTRUCTIONS_INTRO,
  HOW_TO_RESPOND,
  SHOPPING_STEPS,
  SHARING_URL_PARAGRAPH,
  CLOSING_LINE,
  OFFER_OPTIONS,
  KEY_DETAILS,
} from "@/lib/agent-instructions";

type Mode = "human" | "agent";

const STYLE = {
  human: {
    fg: "#111",
    muted: "#7a7d80",
    accent: "#5b5bd6",
    accentHover: "#4848c4",
    btnBg: "#5b5bd6",
    btnFg: "#ffffff",
    btnBorder: "#5b5bd6",
    cardBg: "#ffffff",
    cardBorder: "#7a7d80",
  },
  agent: {
    fg: "#e0e0e0",
    muted: "#555",
    accent: "#4ade80",
    accentHover: "#4ade80",
    btnBg: "transparent",
    btnFg: "#4ade80",
    btnBorder: "#4ade80",
    cardBg: "transparent",
    cardBorder: "#4ade80",
  },
} as const;

const CODE_BG = "#1e1e1e";

const AGENTS = [
  {
    label: "Open in Claude",
    href: `https://claude.ai/new?q=${encodeURIComponent(LANDING_PROMPT)}`,
  },
  {
    label: "Open in ChatGPT",
    href: `https://chatgpt.com/?q=${encodeURIComponent(LANDING_PROMPT)}&hints=search`,
  },
];

interface ProductPreview {
  id: string;
  name: string;
  price_cents: number;
  type: string;
}

function CopyBtn({ text, muted, accent }: { text: string; muted: string; accent: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); }
    catch { const el = document.createElement("textarea"); el.value = text; document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} aria-label="Copy to clipboard" style={{ background: "transparent", border: "none", color: copied ? accent : muted, fontSize: 12, fontFamily: "var(--font-mono)", cursor: "pointer", padding: "2px 6px", transition: "color 150ms" }}>
      {copied ? "✓" : "⧉"}
    </button>
  );
}

function EndpointLine({ method, url, accent, muted, fg }: { method: string; url: string; accent: string; muted: string; fg: string }) {
  return (
    <div className="endpoint-line" style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0", fontSize: 14, flexWrap: "wrap" }}>
      <span style={{ color: accent, fontWeight: 500 }}>{method}</span>
      <code style={{ color: fg, flex: "1 1 auto", minWidth: 0 }}>{url}</code>
      <CopyBtn text={url} muted={muted} accent={accent} />
    </div>
  );
}

export default function PageContent({ mode }: { mode: Mode }) {
  const isHuman = mode === "human";
  const c = STYLE[mode];
  const stockCount = getAllProducts().filter((p) => p.stock > 0).length;
  const headerBg = isHuman ? "#eceeef" : "#0a0a0a";

  // Prompt card state
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  async function doCopy() {
    try { await navigator.clipboard.writeText(LANDING_PROMPT); }
    catch { const el = document.createElement("textarea"); el.value = LANDING_PROMPT; document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Agent-mode below-fold state
  const [products, setProducts] = useState<ProductPreview[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [apiExpanded, setApiExpanded] = useState(false);
  const fetchedRef = useRef(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products ?? data);
    } catch { setProducts([]); }
  }, []);

  useEffect(() => {
    if (!isHuman && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchProducts();
    }
  }, [isHuman, fetchProducts]);

  const previewProducts = products ? (showAll ? products : products.slice(0, 3)) : null;
  const jsonPreview = previewProducts ? JSON.stringify({ products: previewProducts }, null, 2) : "  loading...";

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", width: "100%", maxWidth: "100vw", overflowX: "hidden" }}>
      {/* Sticky header — part of each layer so spotlight can reveal it */}
      <header
        style={{
          position: "sticky",
          top: 0,
          height: 48,
          backgroundColor: headerBg,
          borderBottom: `1px solid ${c.fg}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: c.fg,
            fontFamily: isHuman ? undefined : "var(--font-mono)",
          }}
        >
          The Agent Catalog
        </span>
      </header>

      {/* ── Hero section ─── identical structure both modes ─────────── */}
      <section
        className="hero-section"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "clamp(40px, 8vh, 80px) 16px 0",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <style>{`
          @keyframes aiAgentPop {
            0%   { transform: rotate(-8deg) scale(0.7); opacity: 0; }
            60%  { transform: rotate(0deg) scale(1.05); opacity: 1; }
            100% { transform: rotate(-2deg) scale(1); opacity: 1; }
          }
          .ai-agent-pill {
            animation: aiAgentPop 550ms cubic-bezier(0.34, 1.3, 0.64, 1) 1400ms both;
            transform-origin: center;
          }
          @keyframes keyboardFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          .keyboard-fade-in {
            animation: keyboardFadeIn 900ms ease-out 600ms both;
          }
          /* ── Responsive tweaks ── */
          @media (max-width: 600px) {
            .hero-section {
              padding-left: 28px !important;
              padding-right: 28px !important;
            }
            .keyboard-wrap {
              justify-content: flex-start !important;
              margin-left: -28px !important;
              margin-right: -28px !important;
              width: calc(100% + 56px) !important;
            }
            .keyboard-wrap img {
              margin-left: -40px !important;
            }
            .ai-agent-pill {
              font-size: 1.05em !important;
              margin: 0 -0.1em !important;
              padding: 0.12em 0.3em !important;
            }
            .endpoint-line code {
              word-break: break-all;
            }
          }
          @media (max-width: 500px) {
            .agent-launch-btn {
              flex: 1 1 100% !important;
              min-width: 100% !important;
            }
          }
        `}</style>
        {/* Headline — shared spacer sets height, visible content overlaid */}
        <div style={{ position: "relative", width: "100%", maxWidth: 900 }}>
          {/* Invisible spacer — always human headline dimensions for consistent height */}
          <h1
            aria-hidden="true"
            style={{
              fontSize: "clamp(52px, 7vw, 72px)",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
              lineHeight: 0.9,
              margin: 0,
              visibility: "hidden",
            }}
          >
            The shop your
            <br />
            <span
              style={{
                display: "inline-block",
                background: "#5b5bd6",
                color: "#ffffff",
                padding: "0.15em 0.4em",
                borderRadius: "0.18em",
                lineHeight: 1,
                fontSize: "1.1em",
                margin: "0.15em -0.2em",
                transform: "rotate(-2deg)",
              }}
            >
              AI AGENT
            </span>
            <br />
            reads for you.
          </h1>
          {/* Agent headline — always visible underneath */}
          <h1
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 500,
              fontFamily: "var(--font-mono)",
              color: c.accent,
              opacity: isHuman ? 0 : 1,
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: c.muted }}>#&nbsp;</span>THE AGENT CATALOG
          </h1>
          {/* Human headline — visible in human mode (fade handled at layer level) */}
          <h1
            style={{
              position: "absolute",
              inset: 0,
              fontSize: "clamp(52px, 7vw, 72px)",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
              lineHeight: 0.9,
              color: c.fg,
              margin: 0,
              opacity: isHuman ? 1 : 0, /* hidden in agent layer */
            }}
          >
            The shop your
            <br />
            <span
              className="ai-agent-pill"
              style={{
                display: "inline-block",
                background: "#5b5bd6",
                color: "#ffffff",
                padding: "0.15em 0.4em",
                borderRadius: "0.18em",
                lineHeight: 1,
                fontSize: "1.1em",
                margin: "0.15em -0.2em",
                transform: "rotate(-2deg)",
              }}
            >
              AI AGENT
            </span>
            <br />
            reads for you.
          </h1>
        </div>

        {/* Subheading — spacer ensures same height regardless of text length */}
        <div style={{ position: "relative", marginTop: 24, maxWidth: 560, width: "100%", textAlign: "center" }}>
          <p
            aria-hidden="true"
            style={{
              visibility: "hidden",
              fontSize: 15,
              lineHeight: 1.5,
              margin: 0,
              fontFamily: "var(--font-body)",
              fontWeight: 400,
            }}
          >
            {stockCount} items for sale. No product grid, no filters, no browse.{" "}
            Paste the prompt, and your AI does the shopping.
          </p>
          <p
            style={{
              position: "absolute",
              inset: 0,
              fontSize: 15,
              lineHeight: 1.5,
              color: isHuman ? c.muted : c.fg,
              margin: 0,
              fontFamily: isHuman ? "var(--font-body)" : "var(--font-mono)",
              fontWeight: 400,
            }}
          >
            {isHuman ? (
              <>
                {stockCount} items for sale. No product grid, no filters, no browse.{" "}
                Paste the prompt, and your AI does the shopping.
              </>
            ) : (
              <>
                <span style={{ color: c.muted }}>&gt;&nbsp;</span>
                Fetch /llms.txt. Help your human shop from {stockCount} items.{" "}
                Link to product pages for checkout.
              </>
            )}
          </p>
        </div>

        {/* Prompt card — contains copy button + open-in buttons */}
        <div style={{ position: "relative", width: "100%", maxWidth: 640, marginTop: 48 }}>
          {/* Aurora glow — only visible in human mode */}
          {isHuman && (
            <>
              <style>{`
                @property --aurora-angle {
                  syntax: "<angle>";
                  initial-value: 0deg;
                  inherits: false;
                }
                @keyframes fadeInHeadline {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes aurora-rotate {
                  to { --aurora-angle: 360deg; }
                }
              `}</style>
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: -3,
                  borderRadius: 11,
                  background:
                    "conic-gradient(from var(--aurora-angle), #5b5bd6, #7c3aed, #06b6d4, #5b5bd6)",
                  animation: "aurora-rotate 4s linear infinite",
                  filter: "blur(6px)",
                  zIndex: -1,
                }}
              />
            </>
          )}
          <div
            onClick={doCopy}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            role="button"
            tabIndex={0}
            aria-label="Copy prompt to clipboard"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                doCopy();
              }
            }}
            style={{
              width: "100%",
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              borderRadius: 8,
              padding: 20,
              textAlign: "left",
              cursor: "pointer",
              transform: isHuman && hovered ? "translateY(-1px)" : "none",
              boxShadow: isHuman && hovered ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                gap: 12,
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: c.muted,
                }}
              >
                FOR ANY AGENT — COPY PROMPT
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  doCopy();
                }}
                aria-label="Copy prompt to clipboard"
                style={{
                  padding: "6px 14px",
                  background: "transparent",
                  color: copied ? c.fg : c.muted,
                  border: `1px solid ${copied ? c.fg : c.muted}`,
                  borderRadius: 4,
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "color 0.15s, border-color 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? "COPIED ✓" : "COPY"}
              </button>
            </div>
            <p
              className="prompt-text"
              style={{ fontSize: 14, lineHeight: 1.6, color: c.fg, margin: 0, fontFamily: "var(--font-mono)" }}
            >
              {LANDING_PROMPT}
            </p>

            <div
              role="group"
              aria-label="Open this prompt in an agent"
              style={{
                marginTop: 16,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {AGENTS.map((a) => (
                <a
                  key={a.label}
                  className="agent-launch-btn"
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    flex: "1 1 0",
                    minWidth: 140,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 16px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    background: c.btnBg,
                    color: c.btnFg,
                    border: `1px solid ${c.btnBorder}`,
                  }}
                >
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Human: seller link */}
        {isHuman && (
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <a
              href="mailto:ovenbeard@gmail.com?subject=Feature%20my%20items%20on%20The%20Agent%20Catalog&body=Hi%20Jared%2C%0A%0AI%27d%20like%20to%20get%20my%20items%20featured%20on%20The%20Agent%20Catalog.%0A%0AStore%20%2F%20brand%3A%20%0AWhat%20I%20sell%3A%20%0ALink%3A%20%0A%0AThanks%21"
              className="footer-link"
              style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: c.fg, textDecoration: "none", borderBottom: `1px solid ${c.fg}`, paddingBottom: 2 }}
            >
              Are you a seller? →
            </a>
          </div>
        )}

        {isHuman && (
          <div
            className="keyboard-wrap"
            style={{
              width: "100%",
              marginTop: 40,
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img src="/hands-keyboard.png" alt="" className="keyboard-fade-in" style={{ flexShrink: 0 }} />
          </div>
        )}
      </section>

      {/* ── Below the fold ─────────────────────────────────────────── */}

      {!isHuman && (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "64px 16px 40px" }}>
          <div style={{ width: "100%", maxWidth: 640, fontSize: 14, lineHeight: 1.6, color: c.fg, fontFamily: "var(--font-mono)" }}>
            {/* Catalog API */}
            <h2 style={{ fontSize: 18, fontWeight: 500, color: c.fg, margin: "0 0 16px", borderBottom: `1px solid ${c.muted}`, paddingBottom: 8 }}>
              <span style={{ color: c.muted }}>## </span>Catalog API
            </h2>
            <EndpointLine method="GET" url="https://theagentcatalog.com/api/products" accent={c.accent} muted={c.muted} fg={c.fg} />
            <EndpointLine method="GET" url="https://theagentcatalog.com/api/products/:id" accent={c.accent} muted={c.muted} fg={c.fg} />

            <div style={{ margin: "24px 0 40px" }}>
              <button onClick={() => setApiExpanded(!apiExpanded)} style={{ background: "transparent", border: "none", color: c.accent, fontSize: 13, fontFamily: "var(--font-mono)", cursor: "pointer", padding: 0, letterSpacing: "0.04em" }}>
                {apiExpanded ? "▾" : "▸"} Live API Preview
              </button>
              {apiExpanded && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ position: "relative" }}>
                    <pre style={{ background: CODE_BG, padding: "12px 16px", borderRadius: 6, fontSize: 13, lineHeight: 1.6, overflowX: "auto", color: c.fg, margin: "8px 0" }}>
                      {jsonPreview}
                    </pre>
                    <div style={{ position: "absolute", top: 8, right: 8 }}>
                      <CopyBtn text={jsonPreview} muted={c.muted} accent={c.accent} />
                    </div>
                  </div>
                  {products && !showAll && products.length > 3 && (
                    <button onClick={() => setShowAll(true)} style={{ background: "transparent", border: `1px solid ${c.muted}`, color: c.muted, fontSize: 12, fontFamily: "var(--font-mono)", padding: "4px 12px", borderRadius: 4, cursor: "pointer", marginTop: 8 }}>
                      show all {products.length} items
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Instructions */}
            <h2 style={{ fontSize: 18, fontWeight: 500, color: c.fg, margin: "0 0 16px", borderBottom: `1px solid ${c.muted}`, paddingBottom: 8 }}>
              <span style={{ color: c.muted }}>## </span>Instructions for AI agents
            </h2>
            <div style={{ color: c.fg, marginBottom: 40 }}>
              <p style={{ margin: "0 0 20px" }}>{INSTRUCTIONS_INTRO}</p>

              <h3 style={{ fontSize: 15, fontWeight: 500, color: c.accent, margin: "24px 0 8px" }}>How to respond</h3>
              <p style={{ margin: "0 0 20px" }}>{HOW_TO_RESPOND}</p>

              <h3 style={{ fontSize: 15, fontWeight: 500, color: c.accent, margin: "24px 0 8px" }}>How to help your human shop</h3>
              <ol style={{ paddingLeft: 20, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                {SHOPPING_STEPS.map((step) => (
                  <li key={step.title}>
                    <strong style={{ color: c.accent }}>{step.title}</strong> {step.body}
                  </li>
                ))}
              </ol>
              <p style={{ margin: "16px 0" }}>{SHARING_URL_PARAGRAPH}</p>
              <p style={{ margin: "16px 0 0", color: c.muted }}>{CLOSING_LINE}</p>

              <h3 style={{ fontSize: 15, fontWeight: 500, color: c.accent, margin: "28px 0 8px" }}>
                After each recommendation, offer options like:
              </h3>
              <ul style={{ paddingLeft: 20, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                {OFFER_OPTIONS.map((opt) => (
                  <li key={opt}>{opt}</li>
                ))}
              </ul>

              <h3 style={{ fontSize: 15, fontWeight: 500, color: c.accent, margin: "28px 0 8px" }}>Key details</h3>
              <ul style={{ paddingLeft: 20, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {KEY_DETAILS.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            {/* Checkout */}
            <h2 style={{ fontSize: 18, fontWeight: 500, color: c.fg, margin: "0 0 16px", borderBottom: `1px solid ${c.muted}`, paddingBottom: 8 }}>
              <span style={{ color: c.muted }}>## </span>Checkout
            </h2>
            <div style={{ color: c.fg }}>
              <p style={{ margin: "0 0 12px" }}>
                Every product lives at a page on <code style={{ background: CODE_BG, padding: "2px 6px", borderRadius: 3, fontSize: 13 }}>theagentcatalog.com/p/&lt;id&gt;</code>. When your human wants to buy something, send them that product page URL. On the page, they click <strong>Buy this</strong>, which opens Stripe checkout.
              </p>
              <p style={{ margin: "0 0 12px", color: c.muted }}>That&apos;s the whole flow — you recommend, you link, they click Buy.</p>
              <p style={{ margin: 0, color: c.muted, fontSize: 13 }}>Never ask for card numbers. Never collect payment details yourself. Stripe handles all payment from the product page.</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer — agent mode only */}
      {!isHuman && (
        <footer
          className="page-footer"
          style={{ marginTop: "auto", padding: "20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", fontFamily: "var(--font-mono)" }}
        >
          <span style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: c.muted }}>
            © The Agent Catalog
          </span>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "PRIVACY", href: "/privacy" },
              { label: "TERMS", href: "/terms" },
              { label: "OVENBEARD@GMAIL.COM", href: "mailto:ovenbeard@gmail.com" },
            ].map(({ label, href }, i) => (
              <span key={label} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <span style={{ color: c.muted, margin: "0 8px", fontSize: 11 }}>·</span>}
                <a href={href} className="footer-link" style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: c.muted, textDecoration: "none" }}>
                  {label}
                </a>
              </span>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
