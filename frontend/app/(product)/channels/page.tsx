"use client";

import { useCallback } from "react";
import { GlassCard } from "@/components/cards/GlassCard";
import { ChannelChart } from "@/components/charts/ChannelChart";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageContainer, Section } from "@/components/common/PageContainer";
import { PageHeading } from "@/components/common/PageHeading";
import { ChannelsSkeleton } from "@/components/common/Skeletons";
import { useApi } from "@/components/common/useApi";
import { ChannelTable } from "@/components/tables/ChannelTable";
import { getChannelsPerformance } from "@/lib/api";

export default function ChannelsPage() {
  const { data, loading, error, reload } = useApi(
    useCallback(() => getChannelsPerformance(), []),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeading
          kicker="Acquisition"
          title="Channel Performance"
          description="Which acquisition channels deliver activated, retained, paying users — and at what cost."
        />
        <ChannelsSkeleton />
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
          kicker="Acquisition"
          title="Channel Performance"
          description="Which acquisition channels deliver activated, retained, paying users — and at what cost."
        />
      </Section>

      <Section>
        <GlassCard>
          <div className="mb-5">
            <h3 className="text-[13px] font-semibold text-[#eef2ff]">
              Activation vs Retention by Channel
            </h3>
            <p className="text-xs text-[#4a5278]">
              Solid = activation rate · translucent = retention rate
            </p>
          </div>
          {data.channels.length > 0 ? (
            <ChannelChart channels={data.channels} />
          ) : (
            <EmptyState
              title="No channel performance yet"
              description="Channel comparisons will appear after attributed signups and events arrive."
            />
          )}
        </GlassCard>
      </Section>

      <Section>
        <GlassCard className="p-0">
          <div className="p-6 pb-4">
            <h3 className="text-[13px] font-semibold text-[#eef2ff]">
              Channel Economics
            </h3>
            <p className="text-xs text-[#4a5278]">
              Ranked by quality score · emerald = best, red = worst
            </p>
          </div>
          {data.channels.length > 0 ? (
            <ChannelTable channels={data.channels} />
          ) : (
            <div className="p-6 pt-2">
              <EmptyState
                compact
                title="No channel economics available"
                description="There are no attributed channels to summarize."
              />
            </div>
          )}
        </GlassCard>
      </Section>
    </PageContainer>
  );
}
