"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Count-up number. Animates from the previous value (0 on mount) to `value`
 * and formats every frame through `format`.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 1.2,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }

    const controls = animate(fromRef.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
      onComplete: () => setDisplay(value),
    });
    fromRef.current = value;
    return () => controls.stop();
  }, [value, duration, reduceMotion]);

  return <>{format(display)}</>;
}
