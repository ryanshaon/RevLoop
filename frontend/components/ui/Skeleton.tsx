import { cn } from "@/lib/utils";

/** Pulse skeleton block. Compose these to mirror real content shape. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-[#111527]", className)} />
  );
}
