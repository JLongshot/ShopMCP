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
    <h1 aria-label={text} style={style}>
      {displayed}
    </h1>
  );
}
