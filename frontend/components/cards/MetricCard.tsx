"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon, Minus } from "lucide-react";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { cn } from "@/lib/utils";

export type Accent =
  | "indigo"
  | "blue"
  | "emerald"
  | "violet"
  | "amber"
  | "red"
  | "green";

/**
 * Static (JIT-safe) class strings per accent. Kept as full literals so Tailwind
 * detects them — no dynamic class construction.
 */
const ACCENT_STYLES: Record<
  Accent,
  { icon: string; number: string; glow: string }
> = {
  indigo: {
    icon: "border-[#4f6ef7]/30 bg-[#4f6ef7]/12 text-[#4f6ef7]",
    number: "from-[#6b8aff] to-[#a78bfa]",
    glow: "bg-[radial-gradient(circle_at_center,rgba(79,110,247,0.5),transparent_70%)]",
  },
  blue: {
    icon: "border-[#3b82f6]/30 bg-[#3b82f6]/12 text-[#3b82f6]",
    number: "from-[#60a5fa] to-[#6b8aff]",
    glow: "bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.5),transparent_70%)]",
  },
  emerald: {
    icon: "border-[#10b981]/30 bg-[#10b981]/12 text-[#10b981]",
    number: "from-[#34d399] to-[#10b981]",
    glow: "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.45),transparent_70%)]",
  },
  violet: {
    icon: "border-[#a78bfa]/30 bg-[#a78bfa]/12 text-[#a78bfa]",
    number: "from-[#c4b5fd] to-[#a78bfa]",
    glow: "bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.5),transparent_70%)]",
  },
  amber: {
    icon: "border-[#f59e0b]/30 bg-[#f59e0b]/12 text-[#f59e0b]",
    number: "from-[#fbbf24] to-[#f59e0b]",
    glow: "bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.45),transparent_70%)]",
  },
  red: {
    icon: "border-[#f43f5e]/30 bg-[#f43f5e]/12 text-[#f43f5e]",
    number: "from-[#fb7185] to-[#f43f5e]",
    glow: "bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.45),transparent_70%)]",
  },
  green: {
    icon: "border-[#10b981]/30 bg-[#10b981]/12 text-[#10b981]",
    number: "from-[#34d399] to-[#10b981]",
    glow: "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.45),transparent_70%)]",
  },
};

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: Accent;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  /** Formatter for numeric values (count-up). Ignored for string values. */
  format?: (n: number) => string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  color = "indigo",
  trend,
  trendValue,
  format,
}: MetricCardProps) {
  const styles = ACCENT_STYLES[color];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#1c2035] bg-[#0c0f1d] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3d4fd6]/40 hover:shadow-[0_0_28px_rgba(79,110,247,0.10)] h-full min-h-[170px] md:min-h-[180px] flex flex-col">
      {/* Signature: breathing radial glow behind the number */}
      <div
        className={cn(
          "pointer-events-none absolute left-2 top-16 h-32 w-32 rounded-full opacity-40 blur-2xl animate-pulse-glow",
          styles.glow,
        )}
        aria-hidden
      />

      <div className="relative flex flex-col flex-1">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border",
              styles.icon,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4a5278]">
            {label}
          </span>
        </div>

        <div className="mt-5 flex flex-1 items-center">
          <span
            className={cn(
              "inline-block bg-gradient-to-br bg-clip-text text-4xl font-black leading-none tracking-tight text-transparent md:text-5xl",
              styles.number,
            )}
          >
            {typeof value === "number" ? (
              <AnimatedNumber
                value={value}
                format={format ?? ((n) => String(Math.round(n)))}
              />
            ) : (
              value
            )}
          </span>
        </div>

        {/* Always render badge row so cards without a trend stay same height */}
        <div className="mt-4 h-[22px] flex items-center">
          {trend && trendValue ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                trend === "up" &&
                  "border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]",
                trend === "down" &&
                  "border-[#f43f5e]/30 bg-[#f43f5e]/10 text-[#f43f5e]",
                trend === "neutral" &&
                  "border-[#1c2035] bg-[#111527] text-[#8892b0]",
              )}
            >
              {trend === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {trendValue}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
