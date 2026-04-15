"use client";

import { useState } from "react";

const ACCENT = "#5b5bd6";
const ACCENT_HOVER = "#4848c4";
const FG = "#111";
const MUTED = "#7a7d80";

export default function PromptCard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  async function doCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleButtonClick(e: React.MouseEvent) {
    e.stopPropagation(); // prevent card click from double-firing
    doCopy();
  }

  return (
    <div
      onClick={doCopy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          doCopy();
        }
      }}
      style={{
        marginTop: 64,
        width: "100%",
        maxWidth: 560,
        background: "#ffffff",
        border: "1px solid #111",
        borderRadius: 8,
        padding: 24,
        textAlign: "left",
        cursor: "pointer",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
    >
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

      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: FG,
          marginBottom: 20,
          wordBreak: "break-all",
        }}
      >
        {text}
      </p>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={handleButtonClick}
          style={{
            padding: "12px 48px",
            background: copied ? ACCENT_HOVER : ACCENT,
            color: "#ffffff",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
        >
          {copied ? "COPIED ✓" : "COPY PROMPT"}
        </button>
      </div>
    </div>
  );
}
