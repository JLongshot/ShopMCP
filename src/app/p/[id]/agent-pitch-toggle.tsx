"use client";

import { useState } from "react";

export function AgentPitchToggle({ pitch }: { pitch: string }) {
  const [open, setOpen] = useState(false);

  return (
    <section style={{ marginTop: 24 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontSize: 13,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--muted)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        {open ? "Hide" : "Show"} what your agent reads {open ? "▴" : "▾"}
      </button>
      {open && (
        <p
          style={{
            marginTop: 8,
            fontSize: 14,
            lineHeight: 1.6,
            fontStyle: "italic",
            color: "var(--muted)",
            padding: "12px 16px",
            background: "#f5f5f4",
            borderRadius: "var(--radius)",
          }}
        >
          {pitch}
        </p>
      )}
    </section>
  );
}
