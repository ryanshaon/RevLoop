"use client";

import { useCallback } from "react";
import { GlassCard } from "@/components/cards/GlassCard";
import { RetentionHeatmap } from "@/components/charts/RetentionHeatmap";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageContainer, Section } from "@/components/common/PageContainer";
import { PageHeading } from "@/components/common/PageHeading";
import { RetentionSkeleton } from "@/components/common/Skeletons";
import { useApi } from "@/components/common/useApi";
import { getRetention } from "@/lib/api";

const LEGEND = [
  { label: "100%", cls: "bg-[#10b981]" },
  { label: "70%+", cls: "bg-[#10b981]/70" },
  { label: "50%+", cls: "bg-[#10b981]/50" },
  { label: "30%+", cls: "bg-[#f59e0b]/40" },
  { label: "15%+", cls: "bg-[#f59e0b]/25" },
  { label: "<15%", cls: "bg-[#f43f5e]/35" },
];

export default function RetentionPage() {
  const { data, loading, error, reload } = useApi(
    useCallback(() => getRetention(), []),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeading
          kicker="Engagement"
          title="Retention Cohorts"
          description="How well each weekly signup cohort keeps coming back over its first month."
        />
        <RetentionSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error ?? undefined} onRetry={reload} />;
  }

  return (
    <PageContainer>
      <Section>
        <PageHeading
          kicker="Engagement"
          title="Retention Cohorts"
          description="How well each weekly signup cohort keeps coming back over its first month."
        />
      </Section>

      <Section>
        <GlassCard>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[#eef2ff]">
                Weekly Retention Heatmap
              </h3>
              <p className="text-xs text-[#4a5278]">
                {data.cohorts.length} cohorts · % of cohort active each week
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4a5278]">
                Lower
              </span>
              <div className="flex items-center gap-1.5">
                {LEGEND.slice()
                  .reverse()
                  .map((l) => (
                    <div key={l.label} className="flex items-center gap-1">
                      <span className={`h-3 w-3 rounded-sm ${l.cls}`} />
                    </div>
                  ))}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4a5278]">
                Higher
              </span>
            </div>
          </div>

          {data.cohorts.length > 0 ? (
            <RetentionHeatmap cohorts={data.cohorts} />
          ) : (
            <EmptyState
              title="No retention cohorts yet"
              description="Cohorts will appear after users sign up and generate meaningful activity."
            />
          )}
        </GlassCard>
      </Section>
    </PageContainer>
  );
}
