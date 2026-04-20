"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export type SpotlightRingHandle = {
  setTransform: (x: number, y: number) => void;
  setVisible: (visible: boolean) => void;
  setProgress: (progress: number) => void;
  setHolding: (holding: boolean) => void;
};

const RING_RADIUS = 168;
const STROKE_RADIUS = 174;
const SVG_SIZE = 460;
const HALF = SVG_SIZE / 2;
const STROKE_CIRC = 2 * Math.PI * STROKE_RADIUS;

function buildLabel(label: string) {
  const unit = `  ${label}  \u00B7  HOLD TO SWAP  \u00B7`;
  return unit.repeat(3);
}

const SpotlightRing = forwardRef<
  SpotlightRingHandle,
  { label: string; color: string }
>(function SpotlightRing({ label, color }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rotateRef = useRef<SVGGElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const visibleRef = useRef(false);

  useImperativeHandle(ref, () => ({
    setTransform(x, y) {
      const el = rootRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    },
    setVisible(v) {
      const el = rootRef.current;
      if (!el || visibleRef.current === v) return;
      visibleRef.current = v;
      el.style.opacity = v ? "1" : "0";
    },
    setProgress(p) {
      const el = progressRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(1, p));
      el.style.strokeDashoffset = String(STROKE_CIRC * (1 - clamped));
      el.style.opacity = clamped > 0 ? "1" : "0";
    },
    setHolding(h) {
      const el = rotateRef.current;
      if (!el) return;
      el.style.animationPlayState = h ? "paused" : "running";
    },
  }));

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: SVG_SIZE,
        height: SVG_SIZE,
        pointerEvents: "none",
        zIndex: 50,
        opacity: 0,
        transition: "opacity 180ms ease",
        willChange: "transform, opacity",
      }}
    >
      <style>{`
        @keyframes spotlightRingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <path
            id="spotlight-ring-path"
            d={`M ${HALF} ${HALF - RING_RADIUS} a ${RING_RADIUS} ${RING_RADIUS} 0 1 1 -0.01 0`}
            fill="none"
          />
        </defs>
        <circle
          cx={HALF}
          cy={HALF}
          r={STROKE_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.2}
        />
        <circle
          ref={progressRef}
          cx={HALF}
          cy={HALF}
          r={STROKE_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={STROKE_CIRC}
          strokeDashoffset={STROKE_CIRC}
          opacity={0}
          transform={`rotate(-90 ${HALF} ${HALF})`}
          style={{
            transition:
              "stroke-dashoffset 80ms linear, opacity 140ms ease",
          }}
        />
        <g
          ref={rotateRef}
          style={{
            transformOrigin: `${HALF}px ${HALF}px`,
            animation: "spotlightRingSpin 28s linear infinite",
          }}
        >
          <text
            fill={color}
            fontFamily="var(--font-mono)"
            fontSize={10}
            fontWeight={500}
            letterSpacing="0.28em"
            style={{ textTransform: "uppercase" }}
          >
            <textPath href="#spotlight-ring-path" startOffset="0">
              {buildLabel(label)}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
});

export default SpotlightRing;
