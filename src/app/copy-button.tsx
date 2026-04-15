"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
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

  return (
    <button
      onClick={handleClick}
      style={{
        width: "100%",
        height: 40,
        padding: "0 16px",
        background: copied ? "#333" : "#111",
        color: "#fff",
        border: "none",
        borderRadius: 0,
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
  );
}
