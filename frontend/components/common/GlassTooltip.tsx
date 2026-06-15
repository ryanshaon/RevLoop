"use client";

import type { ReactNode } from "react";

export interface TipEntry {
  value?: number | string;
  name?: string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

interface GlassTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TipEntry[];
  renderValue?: (value: number | string | undefined, entry: TipEntry) => ReactNode;
  renderLabel?: (label: string | number | undefined) => ReactNode;
  hideLabel?: boolean;
}

/** Dark-glass, indigo-bordered tooltip shared by every Recharts chart. */
export function GlassTooltip({
  active,
  label,
  payload,
  renderValue,
  renderLabel,
  hideLabel = false,
}: GlassTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="min-w-[140px] rounded-xl border border-[#3d4fd6]/50 bg-[#0c0f1d]/95 px-3 py-2.5 shadow-[0_0_28px_rgba(79,110,247,0.20)] backdrop-blur-md">
      {!hideLabel && label !== undefined ? (
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-[#eef2ff]">
          {renderLabel ? renderLabel(label) : label}
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: entry.color ?? "#4f6ef7" }}
            />
            {entry.name ? (
              <span className="text-[#8892b0]">{entry.name}</span>
            ) : null}
            <span className="ml-auto font-semibold text-[#eef2ff]">
              {renderValue ? renderValue(entry.value, entry) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
