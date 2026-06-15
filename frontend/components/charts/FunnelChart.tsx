"use client";

import { motion } from "framer-motion";
import type { FunnelStep } from "@/lib/types";
import { formatNumber, formatPercent } from "@/lib/utils";

/** Warmer color as drop-off worsens: indigo -> violet -> amber -> red. */
function stepColor(dropOff: number): string {
  if (dropOff >= 0.45) return "#f43f5e";
  if (dropOff >= 0.3) return "#f59e0b";
  if (dropOff >= 0.18) return "#a78bfa";
  return "#4f6ef7";
}

export function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const max = steps[0]?.users || 1;

  let worstIdx = -1;
  let worstDrop = -1;
  steps.forEach((s, i) => {
    if (i > 0 && s.drop_off_rate > worstDrop) {
      worstDrop = s.drop_off_rate;
      worstIdx = i;
    }
  });

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const widthPct = Math.max((step.users / max) * 100, 8);
        const color = stepColor(step.drop_off_rate);
        const isWorst = i === worstIdx;

        return (
          <div key={step.step} className="relative">
            <div className="relative h-16 w-full overflow-hidden rounded-xl border border-[#1c2035] bg-[#0a0d18]">
              <motion.div
                className="h-full rounded-xl"
                style={{
                  background: `linear-gradient(90deg, ${color}, ${color}99)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.08,
                }}
              />

              {isWorst ? (
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-[#f43f5e]/70 animate-pulse-glow" />
              ) : null}

              <div className="absolute inset-0 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-black/35 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white drop-shadow">
                      {step.step}
                    </p>
                    <p className="font-mono text-[11px] text-white/70">
                      {step.event}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-right">
                  {i > 0 ? (
                    <div className="hidden sm:block">
                      <p className="text-[11px] uppercase tracking-wide text-white/60">
                        Drop-off
                      </p>
                      <p className="text-sm font-bold text-white">
                        {formatPercent(step.drop_off_rate)}
                      </p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-sm font-bold text-white">
                      {formatNumber(step.users)}
                    </p>
                    <p className="text-[11px] text-white/70">
                      {formatPercent(step.conversion_rate)} conv.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
