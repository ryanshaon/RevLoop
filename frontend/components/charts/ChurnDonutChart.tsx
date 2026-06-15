"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { GlassTooltip } from "@/components/common/GlassTooltip";
import { formatNumber } from "@/lib/utils";

export function ChurnDonutChart({
  high,
  medium,
  low,
  centerLabel = "Users",
  height = 260,
}: {
  high: number;
  medium: number;
  low: number;
  centerLabel?: string;
  height?: number;
}) {
  const total = high + medium + low;
  const data = [
    { name: "High", value: high, color: "#f43f5e" },
    { name: "Medium", value: medium, color: "#f59e0b" },
    { name: "Low", value: low, color: "#10b981" },
  ];

  return (
    <div>
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              animationDuration={900}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={
                <GlassTooltip
                  hideLabel
                  renderValue={(val, entry) =>
                    `${entry.name}: ${formatNumber(Number(val))}`
                  }
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tight text-[#eef2ff]">
            {formatNumber(total)}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4a5278]">
            {centerLabel}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: d.color }}
            />
            <span className="text-xs text-[#8892b0]">{d.name}</span>
            <span className="text-xs font-bold text-[#eef2ff]">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
