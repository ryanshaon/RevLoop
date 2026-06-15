"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Thin animated progress bar. `value` is a 0..1 fraction. */
export function ProgressBar({
  value,
  colorClass = "bg-[#4f6ef7]",
  trackClass,
  className,
  delay = 0,
}: {
  value: number;
  colorClass?: string;
  trackClass?: string;
  className?: string;
  delay?: number;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-[#1c2035]",
        trackClass,
        className,
      )}
    >
      <motion.div
        className={cn("h-full rounded-full", colorClass)}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeOut", delay }}
      />
    </div>
  );
}
