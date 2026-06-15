import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 10px uppercase tracked label used above sections and cards. */
export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4a5278]",
        className,
      )}
    >
      {children}
    </p>
  );
}
