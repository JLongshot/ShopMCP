"use client";

type Mode = "human" | "agent";

const SHELL_BG = "#ffffff";
const PILL_BG = "#5b5bd6";
const INACTIVE_FG = "#111";
const ACTIVE_FG = "#ffffff";

export default function ViewerToggle({
  mode,
  onToggle,
}: {
  mode: Mode;
  onToggle: (m: Mode) => void;
}) {
  const isHuman = mode === "human";

  return (
    <>
      <style>{`
        .viewer-toggle {
          position: relative;
          display: flex;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          background: ${SHELL_BG};
          padding: 2px;
          -webkit-tap-highlight-color: transparent;
          gap: 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .viewer-toggle:focus-visible {
          outline: 2px solid ${PILL_BG};
          outline-offset: 2px;
        }
        .toggle-pill {
          position: absolute;
          top: 2px;
          bottom: 2px;
          width: calc(50% - 2px);
          border-radius: 999px;
          background: ${PILL_BG};
          transition: left 100ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .toggle-seg {
          position: relative;
          z-index: 1;
          padding: 7px 16px;
          font-size: 11px;
          font-family: var(--font-mono);
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          user-select: none;
          pointer-events: none;
          line-height: 1;
          white-space: nowrap;
          transition: color 100ms ease;
        }
      `}</style>
      <button
        className="viewer-toggle"
        onClick={() => onToggle(isHuman ? "agent" : "human")}
        aria-label={`Switch to ${isHuman ? "agent" : "human"} view`}
        role="switch"
        aria-checked={mode === "agent"}
      >
        <div
          className="toggle-pill"
          style={{ left: isHuman ? 2 : "calc(50%)" }}
        />
        <span
          className="toggle-seg"
          style={{ color: isHuman ? ACTIVE_FG : INACTIVE_FG }}
        >
          Human
        </span>
        <span
          className="toggle-seg"
          style={{ color: isHuman ? INACTIVE_FG : ACTIVE_FG }}
        >
          Agent
        </span>
      </button>
    </>
  );
}
