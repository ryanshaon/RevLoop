"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassTooltip } from "@/components/common/GlassTooltip";
import type { ChannelPerformance } from "@/lib/types";
import { getChannelColor } from "@/lib/utils";

export function ChannelChart({
  channels,
  height = 300,
}: {
  channels: ChannelPerformance[];
  height?: number;
}) {
  const data = channels.map((c) => ({
    channel: c.channel,
    activation: +(c.activation_rate * 100).toFixed(1),
    retention: +(c.retention_rate * 100).toFixed(1),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }} barGap={4}>
        <CartesianGrid stroke="#1c2035" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="channel"
          tick={{ fill: "#8892b0", fontSize: 11 }}
          axisLine={{ stroke: "#1c2035" }}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fill: "#4a5278", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={42}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          cursor={{ fill: "rgba(79,110,247,0.06)" }}
          content={
            <GlassTooltip renderValue={(val) => `${Number(val).toFixed(1)}%`} />
          }
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#8892b0", paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="activation"
          name="Activation"
          fill="#4f6ef7"
          radius={[4, 4, 0, 0]}
          maxBarSize={30}
        >
          {data.map((d) => (
            <Cell key={d.channel} fill={getChannelColor(d.channel)} />
          ))}
        </Bar>
        <Bar
          dataKey="retention"
          name="Retention"
          fill="#a78bfa"
          radius={[4, 4, 0, 0]}
          maxBarSize={30}
        >
          {data.map((d) => (
            <Cell
              key={d.channel}
              fill={getChannelColor(d.channel)}
              fillOpacity={0.4}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
