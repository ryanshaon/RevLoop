"use client";

import { motion } from "framer-motion";
import type { CohortRow } from "@/lib/types";
import { cn, formatNumber, formatPercentPoints } from "@/lib/utils";

const WEEK_KEYS = ["week_0", "week_1", "week_2", "week_3", "week_4"] as const;

/** Map a retention percentage (0..100) to a heatmap cell style. */
function cellStyle(pct: number): string {
  if (pct >= 100) return "bg-[#10b981] text-[#04130c]";
  if (pct >= 70) return "bg-[#10b981]/70 text-[#eef2ff]";
  if (pct >= 50) return "bg-[#10b981]/50 text-[#eef2ff]";
  if (pct >= 30) return "bg-[#f59e0b]/40 text-[#eef2ff]";
  if (pct >= 15) return "bg-[#f59e0b]/25 text-[#eef2ff]";
  if (pct > 0) return "bg-[#f43f5e]/35 text-[#eef2ff]";
  return "bg-[#0e1322] text-[#4a5278]";
}

export function RetentionHeatmap({ cohorts }: { cohorts: CohortRow[] }) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <div className="min-w-[680px]">
        {/* Header */}
        <div className="grid grid-cols-[170px_repeat(5,1fr)] gap-2 px-1 pb-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4a5278]">
            Cohort
          </div>
          {WEEK_KEYS.map((_, w) => (
            <div
              key={w}
              className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4a5278]"
            >
              Week {w}
            </div>
          ))}
        </div>

        {/* Rows */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
          className="space-y-2"
        >
          {cohorts.map((row) => (
            <motion.div
              key={row.cohort_week}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
              className="grid grid-cols-[170px_repeat(5,1fr)] gap-2"
            >
              <div className="flex flex-col justify-center rounded-lg border border-[#1c2035] bg-[#0c0f1d] px-3 py-2">
                <span className="text-[13px] font-semibold text-[#eef2ff]">
                  {row.cohort_week}
                </span>
                <span className="text-[11px] text-[#4a5278]">
                  {formatNumber(row.cohort_size)} users
                </span>
              </div>

              {WEEK_KEYS.map((key, w) => {
                const value = row[key];
                return (
                  <div key={key} className="group relative">
                    <div
                      className={cn(
                        "flex h-12 items-center justify-center rounded-lg text-xs font-bold transition-transform duration-150 group-hover:scale-[1.04]",
                        cellStyle(value),
                      )}
                    >
                      {value > 0 ? formatPercentPoints(value, 0) : "—"}
                    </div>

                    {/* Hover tooltip */}
                    <div className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-[#3d4fd6]/50 bg-[#0c0f1d] px-2.5 py-1.5 opacity-0 shadow-[0_0_24px_rgba(79,110,247,0.20)] transition-opacity duration-150 group-hover:opacity-100">
                      <p className="text-[11px] font-semibold text-white">
                        Week {w} · {formatPercentPoints(value)}
                      </p>
                      <p className="text-[10px] text-[#8892b0]">
                        {row.cohort_week} · {formatNumber(row.cohort_size)} users
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
