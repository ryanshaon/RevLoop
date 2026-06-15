"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassTooltip } from "@/components/common/GlassTooltip";

export interface TrendPoint {
  label: string;
  value: number;
}

export function TrendLineChart({
  data,
  color = "#4f6ef7",
  height = 280,
  seriesName = "Users",
  valueFormatter = (n) => String(Math.round(n)),
}: {
  data: TrendPoint[];
  color?: string;
  height?: number;
  seriesName?: string;
  valueFormatter?: (n: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1c2035" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#4a5278", fontSize: 11 }}
          axisLine={{ stroke: "#1c2035" }}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fill: "#4a5278", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={46}
          tickFormatter={(v) => valueFormatter(Number(v))}
        />
        <Tooltip
          cursor={{ stroke: "#3d4fd6", strokeWidth: 1, strokeDasharray: "4 4" }}
          content={
            <GlassTooltip
              renderValue={(val) => valueFormatter(Number(val))}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="value"
          name={seriesName}
          stroke={color}
          strokeWidth={2.5}
          fill="url(#trendFill)"
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: "#0c0f1d", strokeWidth: 2 }}
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
