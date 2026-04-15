"use client";

import { useState } from "react";

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
      aria-label="Copy prompt to clipboard"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          doCopy();
        }
      }}
      style={{
        width: "100%",
        maxWidth: 560,
        background: "#ffffff",
        border: `1px solid ${MUTED}`,
        borderRadius: 8,
        padding: 20,
        textAlign: "left",
        cursor: "pointer",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.06)" : "none",
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
            color: MUTED,
          }}
        >
          FOR ANY OTHER AGENT — COPY PROMPT
        </span>
        <button
          onClick={handleButtonClick}
          aria-label="Copy prompt to clipboard"
          style={{
            padding: "6px 14px",
            background: "transparent",
            color: copied ? FG : MUTED,
            border: `1px solid ${copied ? FG : MUTED}`,
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
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: FG,
          margin: 0,
          wordBreak: "break-word",
        }}
      >
        {text}
      </p>
    </div>
  );
}
