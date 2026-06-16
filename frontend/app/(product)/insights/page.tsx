"use client";

import {
  AlertTriangle,
  FlaskConical,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback } from "react";
import { InsightCard, type InsightVariant } from "@/components/cards/InsightCard";
import { ErrorState } from "@/components/common/ErrorState";
import { PageContainer, Section } from "@/components/common/PageContainer";
import { PageHeading } from "@/components/common/PageHeading";
import { InsightsSkeleton } from "@/components/common/Skeletons";
import { useApi } from "@/components/common/useApi";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getInsightsSummary } from "@/lib/api";

function Column({
  icon: Icon,
  title,
  colorClass,
  variant,
  items,
}: {
  icon: LucideIcon;
  title: string;
  colorClass: string;
  variant: InsightVariant;
  items: string[];
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${colorClass}`} />
        <h3 className={`text-sm font-semibold ${colorClass}`}>{title}</h3>
        <span className="ml-auto rounded-full border border-[#1c2035] bg-[#111527] px-2 py-0.5 text-[11px] font-semibold text-[#8892b0]">
          {items.length}
        </span>
      </div>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((text, i) => (
            <InsightCard key={i} variant={variant} text={text} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[#1c2035] bg-[#0c0f1d] p-4 text-[13px] text-[#4a5278]">
            Nothing flagged this week.
          </div>
        )}
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { data, loading, error, reload } = useApi(
    useCallback(() => getInsightsSummary(), []),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeading
          kicker="Intelligence"
          title="Insights"
          description="The weekly read on risks to fix, opportunities to press, and experiments to run."
        />
        <InsightsSkeleton />
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
          kicker="Intelligence"
          title="Insights"
          description="The weekly read on risks to fix, opportunities to press, and experiments to run."
        />
      </Section>

      {/* Hero summary */}
      <Section>
        <div className="relative">
          <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#4f6ef7]/15 to-[#a78bfa]/15 blur-2xl" />
          <div className="relative rounded-2xl bg-gradient-to-r from-[#4f6ef7] to-[#a78bfa] p-px shadow-[0_0_44px_rgba(79,110,247,0.14)]">
            <div className="relative overflow-hidden rounded-2xl bg-[#0c0f1d] p-7">
              <div className="pointer-events-none absolute -left-10 -top-12 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,110,247,0.20),transparent_70%)] blur-2xl" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f6ef7] to-[#a78bfa] shadow-[0_0_18px_rgba(79,110,247,0.45)]">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <SectionLabel>Weekly Summary</SectionLabel>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#c7d0e6]">
                    {data.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Three columns */}
      <Section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Column
          icon={AlertTriangle}
          title="Risks"
          colorClass="text-[#f43f5e]"
          variant="risk"
          items={data.risks}
        />
        <Column
          icon={TrendingUp}
          title="Opportunities"
          colorClass="text-[#10b981]"
          variant="opportunity"
          items={data.opportunities}
        />
        <Column
          icon={FlaskConical}
          title="Experiments"
          colorClass="text-[#4f6ef7]"
          variant="experiment"
          items={data.recommended_experiments}
        />
      </Section>
    </PageContainer>
  );
}
