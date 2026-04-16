import { isTestMode, BANNER_HEIGHT } from "@/lib/stripe-mode";

export function TestModeBanner() {
  if (!isTestMode()) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: BANNER_HEIGHT,
        background: "#FFF4B8",
        borderBottom: "1px solid #E8D35C",
        color: "#4A3800",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        fontSize: 13,
        lineHeight: 1.3,
        letterSpacing: "0.02em",
        zIndex: 200,
        textAlign: "center",
      }}
    >
      Preview mode — checkout accepts test cards only (
      <code style={{ fontFamily: "inherit", fontWeight: 600 }}>
        4242 4242 4242 4242
      </code>
      ). Real payments launch soon.
    </div>
  );
}
