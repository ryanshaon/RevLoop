import { AlertOctagon, ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/utils";

/**
 * High-emphasis alert with a gradient border glow. Used for the dashboard's
 * "Critical Alert" callout (worst funnel step).
 */
export function AlertCard({
  label,
  title,
  metricValue,
  metricLabel,
  action,
  tone = "critical",
}: {
  label: string;
  title: string;
  metricValue: string;
  metricLabel: string;
  action: string;
  tone?: "critical" | "warning";
}) {
  const gradient =
    tone === "critical"
      ? "from-[#f59e0b]/50 via-[#f43f5e]/50 to-[#f43f5e]/40"
      : "from-[#f59e0b]/50 via-[#f59e0b]/40 to-[#fbbf24]/30";
  const metricColor = tone === "critical" ? "text-[#f43f5e]" : "text-[#f59e0b]";
  const shadow =
    tone === "critical"
      ? "shadow-[0_0_40px_rgba(244,63,94,0.12)]"
      : "shadow-[0_0_40px_rgba(245,158,11,0.12)]";

  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br p-px",
        gradient,
        shadow,
      )}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#0c0f1d] p-6">
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.18),transparent_70%)] blur-2xl" />

        <div className="relative flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#f43f5e]/30 bg-[#f43f5e]/10">
            <AlertOctagon className="h-4 w-4 text-[#f43f5e]" />
          </div>
          <SectionLabel className="text-[#f43f5e]/80">{label}</SectionLabel>
        </div>

        <div className="relative mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4a5278]">
            {metricLabel}
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-black tracking-tight text-[#eef2ff]">
              {title}
            </span>
            <span className={cn("text-2xl font-black", metricColor)}>
              {metricValue}
            </span>
          </div>
        </div>

        <div className="relative mt-auto flex items-start gap-2 pt-6">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#a78bfa]" />
          <p className="text-[13px] leading-relaxed text-[#c7d0e6]">{action}</p>
        </div>
      </div>
    </div>
  );
}
