import { LANDING_PROMPT } from "@/lib/prompt";

const FG = "#111";
const MUTED = "#7a7d80";

type Agent = { name: string; href: (prompt: string) => string };

// ?q= deep-linking is undocumented on all three platforms — behavior can drift.
// Verify manually (logged-in + incognito) before relying on auto-submit.
const AGENTS: Agent[] = [
  {
    name: "CLAUDE",
    href: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
  },
  {
    name: "CHATGPT",
    href: (p) =>
      `https://chatgpt.com/?q=${encodeURIComponent(p)}&hints=search`,
  },
  {
    name: "GEMINI",
    href: (p) => `https://gemini.google.com/app?q=${encodeURIComponent(p)}`,
  },
];

export default function AgentButtonRow() {
  return (
    <div
      role="group"
      aria-label="Open this prompt in an agent"
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
      {AGENTS.map((a, i) => (
        <span key={a.name} style={{ display: "flex", alignItems: "center" }}>
          {i > 0 && <span style={{ color: MUTED, margin: "0 8px" }}>·</span>}
          <a
            href={a.href(LANDING_PROMPT)}
            target="_blank"
            rel="noopener noreferrer"
            data-agent={a.name.toLowerCase()}
            className="footer-link"
            style={{
              color: FG,
              textDecoration: "none",
            }}
          >
            {a.name}
          </a>
        </span>
      ))}
      <span style={{ display: "flex", alignItems: "center" }}>
        <span style={{ color: MUTED, margin: "0 8px" }}>·</span>
        <span style={{ color: MUTED }}>+ANY AGENT</span>
      </span>
    </div>
  );
}
