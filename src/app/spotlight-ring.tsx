"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export type SpotlightRingHandle = {
  setTransform: (x: number, y: number) => void;
  setVisible: (visible: boolean) => void;
  setProgress: (progress: number) => void;
  setHolding: (holding: boolean) => void;
};

const TEXT_RADIUS = 132;
const STROKE_RADIUS = 124;
const SVG_SIZE = 320;
const HALF = SVG_SIZE / 2;
const TEXT_CIRC = 2 * Math.PI * TEXT_RADIUS;
const STROKE_CIRC = 2 * Math.PI * STROKE_RADIUS;
const HOLD_SCALE = 0.94;

function buildLabel(label: string) {
  const unit = `${label} PREVIEW \u00B7 HOLD TO SWAP \u00B7 `;
  return unit.repeat(4);
}

const SpotlightRing = forwardRef<
  SpotlightRingHandle,
  { label: string; color: string }
>(function SpotlightRing({ label, color }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
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
      const rotate = rotateRef.current;
      if (rotate) rotate.style.animationPlayState = h ? "paused" : "running";
      const svg = svgRef.current;
      if (svg) svg.style.transform = h ? `scale(${HOLD_SCALE})` : "scale(1)";
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
        ref={svgRef}
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        style={{
          overflow: "visible",
          transformOrigin: "center",
          transition: "transform 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <defs>
          <path
            id="spotlight-ring-path"
            d={`M ${HALF} ${HALF - TEXT_RADIUS} a ${TEXT_RADIUS} ${TEXT_RADIUS} 0 1 1 -0.01 0`}
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
          opacity={0.22}
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
            transition: "stroke-dashoffset 80ms linear, opacity 140ms ease",
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
            letterSpacing="0.24em"
            style={{ textTransform: "uppercase" }}
          >
            <textPath
              href="#spotlight-ring-path"
              startOffset="0"
              textLength={TEXT_CIRC}
              lengthAdjust="spacing"
            >
              {buildLabel(label)}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
});

export default SpotlightRing;
