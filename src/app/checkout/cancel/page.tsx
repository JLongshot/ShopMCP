import Link from "next/link";
import { isTestMode as getIsTestMode } from "@/lib/stripe-mode";

const isTestMode = getIsTestMode();

export default function CancelPage() {
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>No worries.</h1>
      <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
        Come back when you&apos;re ready. Your agent will know what you were looking at.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "10px 20px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          textDecoration: "none",
          fontSize: 14,
          color: "var(--fg)",
        }}
      >
        Back to The Agent Catalog
      </Link>
      {isTestMode && (
        <p style={{ marginTop: 48, fontSize: 12, color: "var(--muted)" }}>
          Test mode — no real money moved.
        </p>
      )}
    </main>
  );
}
