"use client";

import { useEffect, useState } from "react";

export function useIsCoarse() {
  const [isCoarse, setIsCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const apply = () => setIsCoarse(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return isCoarse;
}
