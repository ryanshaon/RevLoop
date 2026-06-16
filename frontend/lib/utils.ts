import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** clsx + tailwind-merge: conditional classes with conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

/** Format a 0..1 fraction as a percentage string, e.g. 0.525 -> "52.5%". */
export function formatPercent(fraction: number, digits = 1): string {
  if (!Number.isFinite(fraction)) return "-";
  return `${(fraction * 100).toFixed(digits)}%`;
}

/** Format a value that is already in percentage points, e.g. 26.3 -> "26.3%". */
export function formatPercentPoints(points: number, digits = 1): string {
  if (!Number.isFinite(points)) return "-";
  return `${points.toFixed(digits)}%`;
}

/** Signed percentage points, e.g. 12.3 -> "+12.3%", -21.88 -> "-21.9%". */
export function formatSignedPercent(points: number, digits = 1): string {
  if (!Number.isFinite(points)) return "-";
  const sign = points > 0 ? "+" : "";
  return `${sign}${points.toFixed(digits)}%`;
}

/** Backend currency is USD; retain cents for the small demo values. */
export function formatCurrency(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Compact USD for tight chart axes. */
export function formatCompactCurrency(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Thousands-separated integer, e.g. 20478 -> "20,478". */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

/** Parse date-only or timestamped API values without local-time day shifts. */
export function parseApiDateUtc(iso: string): Date | null {
  const value = iso.trim();
  if (!value) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** ISO date -> short label, e.g. "2026-03-02" -> "Mar 2". Always uses UTC. */
export function formatWeekLabel(iso: string): string {
  const d = parseApiDateUtc(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** ISO date -> readable date with year, e.g. "2026-03-02" -> "Mar 2, 2026". */
export function formatDateLabel(iso: string): string {
  const d = parseApiDateUtc(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* ------------------------------------------------------------------ */
/* Risk styling                                                        */
/* ------------------------------------------------------------------ */

export interface RiskMeta {
  label: string;
  hex: string;
  text: string;
  bg: string;
  border: string;
  bar: string;
}

export const RISK_META: Record<"high" | "medium" | "low", RiskMeta> = {
  high: {
    label: "High",
    hex: "#f43f5e",
    text: "text-[#f43f5e]",
    bg: "bg-[#f43f5e]/10",
    border: "border-[#f43f5e]/40",
    bar: "bg-[#f43f5e]",
  },
  medium: {
    label: "Medium",
    hex: "#f59e0b",
    text: "text-[#f59e0b]",
    bg: "bg-[#f59e0b]/10",
    border: "border-[#f59e0b]/40",
    bar: "bg-[#f59e0b]",
  },
  low: {
    label: "Low",
    hex: "#10b981",
    text: "text-[#10b981]",
    bg: "bg-[#10b981]/10",
    border: "border-[#10b981]/40",
    bar: "bg-[#10b981]",
  },
};

export function normalizeRisk(level: string): "high" | "medium" | "low" {
  const l = level.toLowerCase();
  if (l.startsWith("h")) return "high";
  if (l.startsWith("l")) return "low";
  return "medium";
}

/** Tailwind text-color class for a risk level. */
export function getRiskColor(level: string): string {
  return RISK_META[normalizeRisk(level)].text;
}

export function getRiskMeta(level: string): RiskMeta {
  return RISK_META[normalizeRisk(level)];
}

/* ------------------------------------------------------------------ */
/* Channel colors - consistent hue per acquisition channel             */
/* ------------------------------------------------------------------ */

const CHANNEL_COLORS: Record<string, string> = {
  Referral: "#10b981",
  Organic: "#4f6ef7",
  Instagram: "#a78bfa",
  "Paid Ads": "#f43f5e",
  WhatsApp: "#3b82f6",
  LinkedIn: "#f59e0b",
};

const CHANNEL_FALLBACK = [
  "#4f6ef7",
  "#a78bfa",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#3b82f6",
];

/** Deterministic, consistent color for any channel name. */
export function getChannelColor(channel: string): string {
  if (CHANNEL_COLORS[channel]) return CHANNEL_COLORS[channel];
  let hash = 0;
  for (let i = 0; i < channel.length; i++) {
    hash = (hash * 31 + channel.charCodeAt(i)) >>> 0;
  }
  return CHANNEL_FALLBACK[hash % CHANNEL_FALLBACK.length];
}
