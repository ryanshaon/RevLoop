import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Base surface card. `glowColor` adds a colored hairline along the top edge.
 * Default padding is p-6 and can be overridden via className (tailwind-merge).
 */
export function GlassCard({
  children,
  className,
  glowColor,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[#1c2035] bg-[#0c0f1d] p-6 transition-all duration-200 hover:border-[#3d4fd6]/30 hover:shadow-[0_0_24px_rgba(79,110,247,0.08)]",
        className,
      )}
    >
      {glowColor ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
          }}
          aria-hidden
        />
      ) : null}
      {children}
    </div>
  );
}
