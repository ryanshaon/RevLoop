import { DatabaseZap } from "lucide-react";

export function EmptyState({
  title = "No data available",
  description = "The API returned an empty dataset for this view.",
  compact = false,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1c2035] bg-[#090c17] px-6 text-center ${
        compact ? "min-h-40 py-8" : "min-h-64 py-12"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#4f6ef7]/30 bg-[#4f6ef7]/10">
        <DatabaseZap className="h-5 w-5 text-[#4f6ef7]" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[#eef2ff]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#8892b0]">
        {description}
      </p>
    </div>
  );
}
