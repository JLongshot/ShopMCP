"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";

export default function HeadlineTyper({
  text,
  style,
}: {
  text: string;
  style?: CSSProperties;
}) {
  // Start with full text so SSR and initial client render agree (no hydration mismatch).
  // useEffect immediately resets to "" and begins the interval.
  const [displayed, setDisplayed] = useState(text);
  const [cursorOn, setCursorOn] = useState(false);
  const [cursorFading, setCursorFading] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    setDisplayed("");
    setCursorOn(true);

    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        // Cursor keeps blinking for 2.5s then fades out over ~0.8s
        setTimeout(() => setCursorFading(true), 2500);
        setTimeout(() => setCursorOn(false), 3300);
      }
    }, 45);

    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <h1 aria-label={text} style={style}>
      {displayed}
      {cursorOn && (
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: "3px",
            background: "currentColor",
            marginLeft: "3px",
            verticalAlign: "text-bottom",
            height: "0.75em",
            opacity: cursorFading ? 0 : 1,
            transition: cursorFading ? "opacity 0.8s ease" : undefined,
            animation: !cursorFading ? "blink 0.7s step-end infinite" : undefined,
          }}
        />
      )}
    </h1>
  );
}
