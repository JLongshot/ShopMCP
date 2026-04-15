import { LANDING_PROMPT } from "@/lib/prompt";

const ACCENT = "#5b5bd6";
const ACCENT_HOVER = "#4848c4";

type Agent = { label: string; href: (prompt: string) => string };

// ?q= deep-linking is undocumented on both platforms — behavior can drift.
// Gemini was dropped because its deep link doesn't reliably pre-fill; users of
// other agents copy the prompt from the secondary card below.
// Verify manually (logged-in + incognito) before relying on auto-submit.
const AGENTS: Agent[] = [
  {
    label: "Open in Claude",
    href: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
  },
  {
    label: "Open in ChatGPT",
    href: (p) =>
      `https://chatgpt.com/?q=${encodeURIComponent(p)}&hints=search`,
  },
];

export default function AgentButtonRow() {
  return (
    <>
      <style>{`
        .agent-cta {
          background: ${ACCENT};
          transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
        }
        .agent-cta:hover {
          background: ${ACCENT_HOVER};
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(91, 91, 214, 0.25);
        }
      `}</style>
      <div
        role="group"
        aria-label="Open this prompt in an agent"
        style={{
          marginTop: 48,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 12,
        }}
      >
        {AGENTS.map((a) => (
          <a
            key={a.label}
            href={a.href(LANDING_PROMPT)}
            target="_blank"
            rel="noopener noreferrer"
            data-agent={a.label.toLowerCase().replace(/\s+/g, "-")}
            className="agent-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 28px",
              minWidth: 220,
              color: "#ffffff",
              borderRadius: 8,
              fontSize: 14,
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            {a.label}
          </a>
        ))}
      </div>
    </>
  );
}
