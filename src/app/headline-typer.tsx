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
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    setDisplayed("");

    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 45);

    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: "relative" }}>
      {/* Invisible full text holds the final height from the start */}
      <h1 aria-hidden="true" style={{ ...style, visibility: "hidden" }}>
        {text}
      </h1>
      {/* Animated text overlaid — doesn't affect layout */}
      <h1 aria-label={text} style={{ ...style, position: "absolute", top: 0, left: 0, right: 0 }}>
        {displayed}
      </h1>
    </div>
  );
}
