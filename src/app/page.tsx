"use client";

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import ViewerToggle from "./viewer-toggle";
import PageContent from "./page-content";
import SpotlightRing, { type SpotlightRingHandle } from "./spotlight-ring";
import { useIsCoarse } from "./use-is-coarse";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

type Mode = "human" | "agent";

const THEME = {
  human: { bg: "#eceeef", fg: "#111", muted: "#7a7d80", grid: "#dcdfe1" },
  agent: { bg: "#0a0a0a", fg: "#e0e0e0", muted: "#555", grid: "#1a1a1a" },
} as const;

const SPOTLIGHT_RADIUS = 144;
const SPOTLIGHT_RADIUS_HOVER = 14;
const SPOTLIGHT_HOLD_RADIUS = 134;
const HOLD_DURATION_MS = 3000;

function isClickable(el: Element | null): boolean {
  while (el) {
    if (el instanceof HTMLElement) {
      const tag = el.tagName;
      if (tag === "A" || tag === "BUTTON") return true;
      if (el.getAttribute("role") === "button") return true;
    }
    el = el.parentElement;
  }
  return false;
}

function gridBg(gridColor: string) {
  return [
    `linear-gradient(to right, ${gridColor} 1px, transparent 1px)`,
    `linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
  ].join(", ");
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("human");
  const isCoarse = useIsCoarse();

  if (isCoarse) {
    return <MobileShell mode={mode} setMode={setMode} />;
  }
  return <DesktopShell mode={mode} setMode={setMode} />;
}

function DesktopShell({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const t = THEME[mode];

  const scrollRef = useRef<HTMLDivElement>(null);
  const humanLayerRef = useRef<HTMLDivElement>(null);
  const agentLayerRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  const mouseClientRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);
  const isTouchRef = useRef(false);
  const hoveringClickableRef = useRef(false);

  // Ripple wipe state
  const [wipe, setWipe] = useState<{
    active: boolean;
    cx: number;
    cy: number;
    from: Mode;
    to: Mode;
  } | null>(null);
  const wipeLayerRef = useRef<HTMLDivElement>(null);
  const wipeActiveRef = useRef(false);

  // Spotlight ring (curved-text label + hold-to-swap)
  const ringRef = useRef<SpotlightRingHandle>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdRafRef = useRef(0);
  const holdStartRef = useRef(0);
  const isHoldingRef = useRef(false);
  const handleToggleRef = useRef<((m: Mode) => void) | null>(null);

  modeRef.current = mode;

  // ── Spotlight mask ──────────────────────────────────────────────────

  const getTopLayer = useCallback(() => {
    return modeRef.current === "human"
      ? humanLayerRef.current
      : agentLayerRef.current;
  }, []);

  const currentRadiusRef = useRef(SPOTLIGHT_RADIUS);
  const targetRadiusRef = useRef(SPOTLIGHT_RADIUS);
  const currentPosRef = useRef({ x: -9999, y: -9999 });
  const lerpRafRef = useRef(0);

  const POS_SMOOTHING = 0.05;
  const RADIUS_SMOOTHING = 0.08;

  const getTargetCoords = useCallback(() => {
    const { x, y } = mouseClientRef.current;
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    return { mx: x, my: y + scrollTop };
  }, []);

  const applyMaskAt = useCallback(
    (mx: number, my: number, r: number) => {
      const topEl = getTopLayer();
      if (!topEl) return;
      const mask = `radial-gradient(circle at ${mx}px ${my}px, transparent ${r}px, black ${r}px)`;
      topEl.style.maskImage = mask;
      topEl.style.setProperty("-webkit-mask-image", mask);
    },
    [getTopLayer],
  );

  const updateRingPosition = useCallback((layerX: number, layerY: number) => {
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    ringRef.current?.setTransform(layerX, layerY - scrollTop);
  }, []);

  const runLerp = useCallback(() => {
    const { mx: targetX, my: targetY } = getTargetCoords();
    const currentRadius = currentRadiusRef.current;
    const targetRadius = targetRadiusRef.current;

    // Initialize position on first frame to avoid snap from -9999
    if (currentPosRef.current.x === -9999) {
      currentPosRef.current = { x: targetX, y: targetY };
    }

    const dx = targetX - currentPosRef.current.x;
    const dy = targetY - currentPosRef.current.y;
    const dr = targetRadius - currentRadius;

    const posSettled = Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5;
    const radiusSettled = Math.abs(dr) < 0.5;

    if (posSettled && radiusSettled) {
      currentPosRef.current = { x: targetX, y: targetY };
      currentRadiusRef.current = targetRadius;
      applyMaskAt(targetX, targetY, targetRadius);
      updateRingPosition(targetX, targetY);
      return;
    }

    const nextX = posSettled ? targetX : currentPosRef.current.x + dx * POS_SMOOTHING;
    const nextY = posSettled ? targetY : currentPosRef.current.y + dy * POS_SMOOTHING;
    const nextR = radiusSettled ? targetRadius : currentRadius + dr * RADIUS_SMOOTHING;

    currentPosRef.current = { x: nextX, y: nextY };
    currentRadiusRef.current = nextR;
    applyMaskAt(nextX, nextY, nextR);
    updateRingPosition(nextX, nextY);
    lerpRafRef.current = requestAnimationFrame(runLerp);
  }, [applyMaskAt, getTargetCoords, updateRingPosition]);

  const applyMask = useCallback(
    (r?: number) => {
      const newTarget = r ?? SPOTLIGHT_RADIUS;
      targetRadiusRef.current = newTarget;
      cancelAnimationFrame(lerpRafRef.current);
      lerpRafRef.current = requestAnimationFrame(runLerp);
    },
    [runLerp],
  );

  const removeMask = useCallback(() => {
    [humanLayerRef, agentLayerRef].forEach((ref) => {
      if (ref.current) {
        ref.current.style.maskImage = "none";
        ref.current.style.setProperty("-webkit-mask-image", "none");
      }
    });
  }, []);

  // ── Mouse tracking ──────────────────────────────────────────────────

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdRafRef.current) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = 0;
    }
    const wasHolding = isHoldingRef.current;
    isHoldingRef.current = false;
    ringRef.current?.setProgress(0);
    ringRef.current?.setHolding(false);
    if (wasHolding && !hoveringClickableRef.current) {
      applyMask(SPOTLIGHT_RADIUS);
    }
  }, [applyMask]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isTouchRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        mouseClientRef.current = { x: e.clientX, y: e.clientY };
        hoveringClickableRef.current = isClickable(e.target as Element);
        const r = hoveringClickableRef.current
          ? SPOTLIGHT_RADIUS_HOVER
          : isHoldingRef.current
            ? SPOTLIGHT_HOLD_RADIUS
            : SPOTLIGHT_RADIUS;
        applyMask(r);
        ringRef.current?.setVisible(
          !hoveringClickableRef.current && !wipeActiveRef.current,
        );
      });
    },
    [applyMask],
  );

  const handleMouseLeave = useCallback(() => {
    mouseClientRef.current = { x: -9999, y: -9999 };
    removeMask();
    ringRef.current?.setVisible(false);
    cancelHold();
  }, [removeMask, cancelHold]);

  const lastScrollRef = useRef(0);
  const handleScroll = useCallback(() => {
    const newScroll = scrollRef.current?.scrollTop ?? 0;
    const delta = newScroll - lastScrollRef.current;
    lastScrollRef.current = newScroll;
    if (mouseClientRef.current.x === -9999 || isTouchRef.current) return;
    // Shift the smoothed position by the scroll delta so the mask stays under the cursor.
    if (currentPosRef.current.x !== -9999) {
      currentPosRef.current.y += delta;
      applyMaskAt(currentPosRef.current.x, currentPosRef.current.y, currentRadiusRef.current);
    }
  }, [applyMaskAt]);

  const tickHoldProgress = useCallback(() => {
    const elapsed = performance.now() - holdStartRef.current;
    const p = Math.min(1, elapsed / HOLD_DURATION_MS);
    ringRef.current?.setProgress(p);
    if (p < 1) {
      holdRafRef.current = requestAnimationFrame(tickHoldProgress);
    }
  }, []);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (isTouchRef.current) return;
      if (e.button !== 0) return;
      if (wipeActiveRef.current) return;
      if (isClickable(e.target as Element)) return;
      if (mouseClientRef.current.x === -9999) return;
      holdStartRef.current = performance.now();
      isHoldingRef.current = true;
      ringRef.current?.setHolding(true);
      applyMask(SPOTLIGHT_HOLD_RADIUS);
      holdRafRef.current = requestAnimationFrame(tickHoldProgress);
      holdTimerRef.current = setTimeout(() => {
        holdTimerRef.current = null;
        const nextMode = modeRef.current === "human" ? "agent" : "human";
        handleToggleRef.current?.(nextMode);
        cancelHold();
      }, HOLD_DURATION_MS);
    },
    [applyMask, tickHoldProgress, cancelHold],
  );

  const handleMouseUp = useCallback(() => {
    cancelHold();
  }, [cancelHold]);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      isTouchRef.current = true;
      return;
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelHold();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (lerpRafRef.current) cancelAnimationFrame(lerpRafRef.current);
    };
  }, [handleMouseMove, handleMouseLeave, handleMouseDown, handleMouseUp, cancelHold]);

  useLayoutEffect(() => {
    removeMask();
    if (mouseClientRef.current.x !== -9999 && !isTouchRef.current) {
      applyMask();
      if (!wipeActiveRef.current) {
        ringRef.current?.setVisible(!hoveringClickableRef.current);
      }
    }
  }, [mode, applyMask, removeMask]);

  // ── Ripple wipe transition ──────────────────────────────────────────

  function handleToggle(newMode: Mode) {
    if (newMode === mode || wipe?.active) return;
    const cx =
      mouseClientRef.current.x !== -9999
        ? mouseClientRef.current.x
        : window.innerWidth / 2;
    const cy =
      mouseClientRef.current.y !== -9999
        ? mouseClientRef.current.y
        : window.innerHeight / 2;
    removeMask();
    wipeActiveRef.current = true;
    ringRef.current?.setVisible(false);
    cancelHold();
    setWipe({ active: true, cx, cy, from: mode, to: newMode });
  }
  handleToggleRef.current = handleToggle;

  useEffect(() => {
    if (!wipe?.active) return;
    const el = wipeLayerRef.current;
    if (!el) return;

    const maxDist = Math.max(
      Math.hypot(wipe.cx, wipe.cy),
      Math.hypot(window.innerWidth - wipe.cx, wipe.cy),
      Math.hypot(wipe.cx, window.innerHeight - wipe.cy),
      Math.hypot(window.innerWidth - wipe.cx, window.innerHeight - wipe.cy),
    );

    el.style.clipPath = `circle(0px at ${wipe.cx}px ${wipe.cy}px)`;
    el.style.setProperty("-webkit-clip-path", `circle(0px at ${wipe.cx}px ${wipe.cy}px)`);
    el.getBoundingClientRect();

    el.style.transition =
      "clip-path 500ms cubic-bezier(0.4, 0, 0.2, 1), -webkit-clip-path 500ms cubic-bezier(0.4, 0, 0.2, 1)";
    el.style.clipPath = `circle(${maxDist}px at ${wipe.cx}px ${wipe.cy}px)`;
    el.style.setProperty("-webkit-clip-path", `circle(${maxDist}px at ${wipe.cx}px ${wipe.cy}px)`);

    const timer = setTimeout(() => {
      setMode(wipe.to);
      setWipe(null);
      wipeActiveRef.current = false;
      if (el) {
        el.style.transition = "none";
        el.style.clipPath = "none";
        el.style.setProperty("-webkit-clip-path", "none");
      }
    }, 520);
    return () => clearTimeout(timer);
  }, [wipe]);

  // ── Render ──────────────────────────────────────────────────────────

  const wipeTheme = wipe ? THEME[wipe.to] : null;

  return (
    <div
      className={`${mono.variable} ${display.variable} ${body.variable}`}
      style={{
        fontFamily: "var(--font-body)",
        ["--bg" as string]: t.bg,
        ["--fg" as string]: t.fg,
        ["--muted" as string]: t.muted,
        ["--grid" as string]: t.grid,
      }}
    >
      <style>{`
        body { margin: 0; background-color: ${t.bg}; transition: background-color 400ms ease-in-out; }
        .footer-link:hover { text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 600px) {
          .page-footer { flex-direction: column !important; align-items: center !important; text-align: center; }
          .prompt-text { word-break: break-word; }
        }
        @keyframes wipeInLayer {
          from { clip-path: circle(0px at 50vw 50vh); }
          to { clip-path: circle(9999px at 50vw 50vh); }
        }
      `}</style>

      {/* Toggle — fixed top-right where the cart count used to sit */}
      <div
        style={{
          position: "fixed",
          top: 8,
          right: 12,
          zIndex: 200,
        }}
      >
        <ViewerToggle mode={mode} onToggle={handleToggle} />
      </div>

      {/* Curved-text ring around the spotlight. Hides on touch devices. */}
      <SpotlightRing
        ref={ringRef}
        label={mode === "human" ? "AI AGENT VIEW" : "HUMAN VIEW"}
        color={t.fg}
      />

      {/* Full-page scroll container with grid-stacked layers */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          position: "fixed",
          inset: 0,
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "grid", minHeight: "100vh", position: "relative" }}>
          {/* Human layer — fades in on initial load so agent layer peeks through first */}
          <div
            ref={humanLayerRef}
            style={{
              gridRow: 1,
              gridColumn: 1,
              position: "relative",
              zIndex: mode === "human" ? 2 : 1,
              backgroundColor: THEME.human.bg,
              backgroundImage: gridBg(THEME.human.grid),
              backgroundSize: "24px 24px",
              animation: "wipeInLayer 2.4s cubic-bezier(0.4, 0, 0.2, 1) 500ms both",
            }}
          >
            <PageContent mode="human" />
          </div>

          {/* Agent layer — relative when active (contributes to page height), absolute when inactive (doesn't stretch the human page) */}
          <div
            ref={agentLayerRef}
            style={{
              gridRow: 1,
              gridColumn: 1,
              position: mode === "agent" ? "relative" : "absolute",
              inset: mode === "agent" ? undefined : 0,
              overflow: mode === "agent" ? "visible" : "hidden",
              zIndex: mode === "agent" ? 2 : 1,
              backgroundColor: THEME.agent.bg,
              backgroundImage: gridBg(THEME.agent.grid),
              backgroundSize: "24px 24px",
            }}
          >
            <PageContent mode="agent" />
          </div>

          {/* Ripple wipe overlay */}
          {wipe?.active && wipeTheme && (
            <div
              ref={wipeLayerRef}
              style={{
                gridRow: 1,
                gridColumn: 1,
                position: "relative",
                zIndex: 10,
                backgroundColor: wipeTheme.bg,
                backgroundImage: gridBg(wipeTheme.grid),
                backgroundSize: "24px 24px",
                pointerEvents: "none",
              }}
            >
              <PageContent mode={wipe.to} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mobile / coarse-pointer shell ─────────────────────────────────────
// Single-layer render. No spotlight, no grid stacking, no clip-path wipe —
// just a 200ms opacity crossfade between modes. Toggle stays fully functional.
function MobileShell({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const t = THEME[mode];
  const [visibleMode, setVisibleMode] = useState<Mode>(mode);
  const [fading, setFading] = useState(false);

  function handleToggle(newMode: Mode) {
    if (newMode === mode) return;
    setFading(true);
    setMode(newMode);
    setTimeout(() => {
      setVisibleMode(newMode);
      setFading(false);
    }, 200);
  }

  return (
    <div
      className={`${mono.variable} ${display.variable} ${body.variable}`}
      style={{
        fontFamily: "var(--font-body)",
        ["--bg" as string]: t.bg,
        ["--fg" as string]: t.fg,
        ["--muted" as string]: t.muted,
        ["--grid" as string]: t.grid,
        minHeight: "100vh",
        backgroundColor: t.bg,
        backgroundImage: gridBg(t.grid),
        backgroundSize: "24px 24px",
        transition: "background-color 200ms ease",
      }}
    >
      <style>{`
        body { margin: 0; background-color: ${t.bg}; overflow-x: hidden; transition: background-color 200ms ease; }
        .footer-link:hover { text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 600px) {
          .page-footer { flex-direction: column !important; align-items: center !important; text-align: center; }
          .prompt-text { word-break: break-word; }
        }
      `}</style>

      {/* Toggle — floats at top right */}
      <div
        style={{
          position: "fixed",
          top: 8,
          right: 12,
          zIndex: 200,
        }}
      >
        <ViewerToggle mode={mode} onToggle={handleToggle} />
      </div>

      {/* Single PageContent with opacity crossfade */}
      <div
        style={{
          opacity: fading ? 0 : 1,
          transition: "opacity 200ms ease",
        }}
      >
        <PageContent mode={visibleMode} />
      </div>
    </div>
  );
}
