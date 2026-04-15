"use client";

import { useState } from "react";

const BG = "#0e0d0b";
const FG = "#ece8dc";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for environments without clipboard API
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

  return (
    <button
      onClick={handleClick}
      style={{
        width: "100%",
        padding: "11px 20px",
        background: copied ? "#d4d0c4" : FG,
        color: BG,
        border: "none",
        borderRadius: "var(--radius)",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.15s, transform 0.1s",
        transform: copied ? "scale(0.98)" : "scale(1)",
        letterSpacing: "0.01em",
      }}
    >
      {copied ? "Copied ✓" : "Copy prompt"}
    </button>
  );
}
