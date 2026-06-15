import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small pill badge. Color via className (border/bg/text). */
export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none",
        className,
      )}
    >
      {children}
    </span>
  );
}
