"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import type { ChannelPerformance } from "@/lib/types";
import {
  cn,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatSignedPercent,
  getChannelColor,
} from "@/lib/utils";

function qualityColor(score: number): string {
  if (score >= 0.4) return "bg-[#10b981]";
  if (score >= 0.25) return "bg-[#f59e0b]";
  return "bg-[#f43f5e]";
}

export function ChannelTable({ channels }: { channels: ChannelPerformance[] }) {
  if (channels.length === 0) return null;

  const scores = channels.map((c) => c.channel_quality_score);
  const bestScore = Math.max(...scores);
  const worstScore = Math.min(...scores);

  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#1c2035] text-[10px] uppercase tracking-[0.15em] text-[#4a5278]">
            <th className="px-4 py-3 font-semibold">Channel</th>
            <th className="px-4 py-3 text-right font-semibold">Visitors</th>
            <th className="px-4 py-3 text-right font-semibold">Signups</th>
            <th className="px-4 py-3 text-right font-semibold">Activation</th>
            <th className="px-4 py-3 text-right font-semibold">Retention</th>
            <th className="px-4 py-3 text-right font-semibold">Revenue</th>
            <th className="px-4 py-3 text-right font-semibold">Spend</th>
            <th className="px-4 py-3 text-right font-semibold">CAC</th>
            <th className="px-4 py-3 text-right font-semibold">ROI</th>
            <th className="px-4 py-3 font-semibold">Quality Score</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((c, i) => {
            const isBest = c.channel_quality_score === bestScore;
            const isWorst = c.channel_quality_score === worstScore && !isBest;
            return (
              <tr
                key={c.channel}
                className={cn(
                  "border-b border-l-2 border-[#141829] transition-colors hover:bg-[#111527]/60",
                  isBest
                    ? "border-l-[#10b981]"
                    : isWorst
                      ? "border-l-[#f43f5e]"
                      : "border-l-transparent",
                )}
              >
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-medium text-[#eef2ff]">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: getChannelColor(c.channel) }}
                    />
                    {c.channel}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#c7d0e6]">
                  {formatNumber(c.visitors)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#c7d0e6]">
                  {formatNumber(c.signups)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#c7d0e6]">
                  {formatPercent(c.activation_rate)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#c7d0e6]">
                  {formatPercent(c.retention_rate)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#10b981]">
                  {formatCurrency(c.revenue)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#8892b0]">
                  {formatCurrency(c.spend)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#c7d0e6]">
                  {formatCurrency(c.cac)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span
                    className={cn(
                      c.roi >= 1
                        ? "text-[#10b981]"
                        : c.roi >= 0.5
                          ? "text-[#f59e0b]"
                          : "text-[#f43f5e]",
                    )}
                  >
                    {formatSignedPercent(c.roi * 100, 0)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <ProgressBar
                      value={c.channel_quality_score}
                      colorClass={qualityColor(c.channel_quality_score)}
                      className="w-16"
                      delay={i * 0.03}
                    />
                    <span className="w-8 text-xs font-semibold tabular-nums text-[#eef2ff]">
                      {c.channel_quality_score.toFixed(2)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
