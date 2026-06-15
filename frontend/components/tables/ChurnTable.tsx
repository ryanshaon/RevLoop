"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import type { ChurnUser } from "@/lib/types";
import {
  cn,
  formatPercent,
  getChannelColor,
  getRiskMeta,
} from "@/lib/utils";

export function ChurnTable({
  users,
  limit,
}: {
  users: ChurnUser[];
  limit?: number;
}) {
  const sorted = [...users].sort((a, b) => b.risk_score - a.risk_score);
  const rows = limit ? sorted.slice(0, limit) : sorted;
  const truncated = limit !== undefined && sorted.length > limit;

  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full min-w-[920px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#1c2035] text-[10px] uppercase tracking-[0.15em] text-[#4a5278]">
            <th className="px-4 py-3 font-semibold">User</th>
            <th className="px-4 py-3 font-semibold">Channel</th>
            <th className="px-4 py-3 text-right font-semibold">Days Inactive</th>
            <th className="px-4 py-3 font-semibold">Risk Score</th>
            <th className="px-4 py-3 font-semibold">Level</th>
            <th className="px-4 py-3 font-semibold">Reason</th>
            <th className="px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u, i) => {
            const meta = getRiskMeta(u.risk_level);
            return (
              <tr
                key={u.user_id}
                className="border-b border-[#141829] transition-colors hover:bg-[#111527]/60"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-[13px] text-[#eef2ff]">
                    {u.external_user_id}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-[#8892b0]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: getChannelColor(u.acquisition_channel) }}
                    />
                    {u.acquisition_channel}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#c7d0e6]">
                  {u.days_since_last_active}d
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={u.risk_score}
                      colorClass={meta.bar}
                      className="w-20"
                      delay={Math.min(i * 0.02, 0.4)}
                    />
                    <span
                      className={cn(
                        "w-9 text-xs font-semibold tabular-nums",
                        meta.text,
                      )}
                    >
                      {formatPercent(u.risk_score, 0)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={cn(meta.bg, meta.border, meta.text)}>
                    {meta.label}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="max-w-[220px] text-[13px] leading-snug text-[#8892b0]">
                    {u.risk_reason}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="max-w-[220px] text-[13px] leading-snug text-[#c7d0e6]">
                    {u.suggested_action}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {truncated ? (
        <p className="px-4 py-3 text-xs text-[#4a5278]">
          Showing top {limit} of {sorted.length} scored users by risk score.
        </p>
      ) : null}
    </div>
  );
}
