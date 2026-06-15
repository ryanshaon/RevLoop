import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

function Surface({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#1c2035] bg-[#0c0f1d] p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <Surface>
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="mt-6 h-11 w-28" />
      <Skeleton className="mt-4 h-5 w-16 rounded-full" />
    </Surface>
  );
}

export function MetricGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <MetricGridSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Surface className="lg:col-span-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-6 h-[260px] w-full rounded-xl" />
        </Surface>
        <Surface className="lg:col-span-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mx-auto mt-8 h-[200px] w-[200px] rounded-full" />
        </Surface>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Surface className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </Surface>
        <Surface>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-6 h-40 w-full rounded-xl" />
        </Surface>
      </div>
    </div>
  );
}

export function FunnelSkeleton() {
  return (
    <div className="space-y-6">
      <Surface className="space-y-3">
        <Skeleton className="h-4 w-40" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </Surface>
      <Surface>
        <Skeleton className="h-4 w-40" />
        <div className="mt-6">
          <TableSkeleton rows={6} cols={5} />
        </div>
      </Surface>
    </div>
  );
}

export function RetentionSkeleton() {
  return (
    <Surface>
      <Skeleton className="h-4 w-44" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[170px_repeat(5,1fr)] gap-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            {Array.from({ length: 5 }).map((_, c) => (
              <Skeleton key={c} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </Surface>
  );
}

export function ChannelsSkeleton() {
  return (
    <div className="space-y-6">
      <Surface>
        <Skeleton className="h-4 w-52" />
        <Skeleton className="mt-6 h-[300px] w-full rounded-xl" />
      </Surface>
      <Surface>
        <Skeleton className="h-4 w-40" />
        <div className="mt-6">
          <TableSkeleton rows={6} cols={10} />
        </div>
      </Surface>
    </div>
  );
}

export function ChurnSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <Surface>
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mx-auto mt-8 h-[240px] w-[240px] rounded-full" />
      </Surface>
      <Surface>
        <Skeleton className="h-4 w-40" />
        <div className="mt-6">
          <TableSkeleton rows={8} cols={7} />
        </div>
      </Surface>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      <Surface>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-11/12" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </Surface>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Surface key={i} className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </Surface>
        ))}
      </div>
    </div>
  );
}
