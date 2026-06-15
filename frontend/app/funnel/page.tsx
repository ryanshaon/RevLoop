"use client";

import { useCallback } from "react";
import { GlassCard } from "@/components/cards/GlassCard";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageContainer, Section } from "@/components/common/PageContainer";
import { PageHeading } from "@/components/common/PageHeading";
import { FunnelSkeleton } from "@/components/common/Skeletons";
import { useApi } from "@/components/common/useApi";
import { Badge } from "@/components/ui/Badge";
import { getFunnel } from "@/lib/api";
import { cn, formatNumber, formatPercent } from "@/lib/utils";

function dropBadgeClass(drop: number): string {
  if (drop > 0.4) return "border-[#f43f5e]/40 bg-[#f43f5e]/10 text-[#f43f5e]";
  if (drop >= 0.2) return "border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]";
  return "border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]";
}

export default function FunnelPage() {
  const { data, loading, error, reload } = useApi(
    useCallback(() => getFunnel(), []),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeading
          kicker="Acquisition"
          title="Conversion Funnel"
          description="Where prospects turn into activated, retained users — and where they leak."
        />
        <FunnelSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error ?? undefined} onRetry={reload} />;
  }

  const steps = data.steps;
  let worstIdx = -1;
  let worstDrop = -1;
  steps.forEach((s, i) => {
    if (i > 0 && s.drop_off_rate > worstDrop) {
      worstDrop = s.drop_off_rate;
      worstIdx = i;
    }
  });

  return (
    <PageContainer>
      <Section>
        <PageHeading
          kicker="Acquisition"
          title="Conversion Funnel"
          description="Where prospects turn into activated, retained users — and where they leak."
        />
      </Section>

      <Section>
        <GlassCard>
          <div className="mb-5">
            <h3 className="text-[13px] font-semibold text-[#eef2ff]">
              Funnel Flow
            </h3>
            <p className="text-xs text-[#4a5278]">
              Bar width is proportional to users reaching each step
            </p>
          </div>
          {steps.length > 0 ? (
            <FunnelChart steps={steps} />
          ) : (
            <EmptyState
              title="No funnel activity yet"
              description="Funnel stages will populate after product events are received."
            />
          )}
        </GlassCard>
      </Section>

      <Section>
        <GlassCard className="p-0">
          <div className="p-6 pb-2">
            <h3 className="text-[13px] font-semibold text-[#eef2ff]">
              Step Breakdown
            </h3>
          </div>
          {steps.length > 0 ? (
            <div className="overflow-x-auto scroll-thin">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-y border-[#1c2035] text-[10px] uppercase tracking-[0.15em] text-[#4a5278]">
                  <th className="px-6 py-3 font-semibold">Step</th>
                  <th className="px-6 py-3 font-semibold">Event</th>
                  <th className="px-6 py-3 text-right font-semibold">Users</th>
                  <th className="px-6 py-3 text-right font-semibold">
                    Conversion
                  </th>
                  <th className="px-6 py-3 text-right font-semibold">Drop-off</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step, i) => (
                  <tr
                    key={step.step}
                    className={cn(
                      "border-b border-[#141829] transition-colors hover:bg-[#111527]/60",
                      i === worstIdx && "bg-[#f43f5e]/[0.06]",
                    )}
                  >
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#1c2035] bg-[#111527] text-[11px] font-bold text-[#8892b0]">
                          {i + 1}
                        </span>
                        <span className="font-medium text-[#eef2ff]">
                          {step.step}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[12px] text-[#8892b0]">
                      {step.event}
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-[#c7d0e6]">
                      {formatNumber(step.users)}
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-[#c7d0e6]">
                      {formatPercent(step.conversion_rate)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {i === 0 ? (
                        <Badge className="border-[#1c2035] bg-[#111527] text-[#4a5278]">
                          Baseline
                        </Badge>
                      ) : (
                        <Badge className={dropBadgeClass(step.drop_off_rate)}>
                          {formatPercent(step.drop_off_rate)}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <div className="p-6 pt-2">
              <EmptyState
                compact
                title="No step breakdown available"
                description="There are no funnel actors to summarize for this organization."
              />
            </div>
          )}
        </GlassCard>
      </Section>
    </PageContainer>
  );
}
