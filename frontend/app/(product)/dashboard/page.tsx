"use client";

import {
  RefreshCw,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { useCallback } from "react";
import { AlertCard } from "@/components/cards/AlertCard";
import { GlassCard } from "@/components/cards/GlassCard";
import { InsightCard, type InsightVariant } from "@/components/cards/InsightCard";
import { MetricCard } from "@/components/cards/MetricCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ChurnDonutChart } from "@/components/charts/ChurnDonutChart";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageContainer, Section } from "@/components/common/PageContainer";
import { PageHeading } from "@/components/common/PageHeading";
import { DashboardSkeleton } from "@/components/common/Skeletons";
import { useApi } from "@/components/common/useApi";
import {
  getChurnRisk,
  getDashboardSummary,
  getFunnel,
  getInsightsSummary,
  getRetention,
} from "@/lib/api";
import {
  formatNumber,
  formatPercent,
  formatSignedPercent,
  formatWeekLabel,
  normalizeRisk,
} from "@/lib/utils";

export default function DashboardPage() {
  const fetcher = useCallback(
    () =>
      Promise.all([
        getDashboardSummary(),
        getFunnel(),
        getRetention(),
        getChurnRisk(1, 500),
        getInsightsSummary(),
      ]).then(([summary, funnel, retention, churn, insights]) => ({
        summary,
        funnel,
        retention,
        churn,
        insights,
      })),
    [],
  );

  const { data, loading, error, reload } = useApi(fetcher);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeading
          kicker="Mission Control"
          title="Overview"
          description="A live read on what's working, what's breaking, and where to act next."
        />
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error ?? undefined} onRetry={reload} />;
  }

  const { summary, funnel, retention, churn, insights } = data;

  // Growth trend proxy: cohort sizes by signup week.
  const trendData = retention.cohorts.map((c) => ({
    label: formatWeekLabel(c.cohort_week),
    value: c.cohort_size,
  }));

  // Churn distribution from the returned users.
  const dist = churn.users.reduce(
    (acc, u) => {
      acc[normalizeRisk(u.risk_level)] += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 },
  );

  // Top 3 insights, risks prioritized first.
  const insightItems: { variant: InsightVariant; text: string }[] = [
    ...insights.risks.map((text) => ({ variant: "risk" as const, text })),
    ...insights.opportunities.map((text) => ({
      variant: "opportunity" as const,
      text,
    })),
    ...insights.recommended_experiments.map((text) => ({
      variant: "experiment" as const,
      text,
    })),
  ].slice(0, 3);

  // Critical alert: worst funnel transition (largest drop-off after step 1).
  const worstIdx = funnel.steps.slice(1).reduce<number>(
    (wIdx, _, i) => {
      const actualIdx = i + 1;
      return funnel.steps[actualIdx].drop_off_rate >
        funnel.steps[wIdx].drop_off_rate
        ? actualIdx
        : wIdx;
    },
    1,
  );
  const worstStep = funnel.steps.length > 1 ? funnel.steps[worstIdx] : undefined;
  const prevStep = worstStep ? funnel.steps[worstIdx - 1] : undefined;
  const transitionLabel =
    prevStep && worstStep
      ? `${prevStep.step} -> ${worstStep.step}`
      : "No funnel transition available";
  const alertAction =
    prevStep && worstStep
      ? `Users fall off hardest at the "${transitionLabel}" transition. Prioritize a focused experiment here to recover lost conversion before scaling spend.`
      : "Funnel data is not available yet. Once events arrive, this alert will identify the transition with the largest drop-off.";

  const growthPositive = summary.weekly_growth_percent >= 0;

  return (
    <PageContainer>
      <Section>
        <PageHeading
          kicker="Mission Control"
          title="Overview"
          description="A live read on what's working, what's breaking, and where to act next."
        />
      </Section>

      {/* Metric grid */}
      <Section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
        <MetricCard
          label="Total Users"
          value={summary.total_users}
          icon={Users}
          color="indigo"
          format={formatNumber}
        />
        <MetricCard
          label="New This Week"
          value={summary.new_users_this_week}
          icon={UserPlus}
          color="blue"
          format={formatNumber}
        />
        <MetricCard
          label="Activation Rate"
          value={summary.activation_rate}
          icon={Zap}
          color="emerald"
          format={(n) => formatPercent(n)}
          trend={summary.activation_rate >= 0.5 ? "up" : "down"}
          trendValue="vs 50% goal"
        />
        <MetricCard
          label="Retention Rate"
          value={summary.retention_rate}
          icon={RefreshCw}
          color="violet"
          format={(n) => formatPercent(n)}
          trend={summary.retention_rate >= 0.35 ? "up" : "down"}
          trendValue="vs 35% goal"
        />
        <MetricCard
          label="Best Channel"
          value={summary.best_channel}
          icon={Star}
          color="amber"
        />
        <MetricCard
          label="Weekly Growth"
          value={summary.weekly_growth_percent}
          icon={TrendingUp}
          color={growthPositive ? "green" : "red"}
          format={(n) => formatSignedPercent(n)}
          trend={growthPositive ? "up" : "down"}
          trendValue="week over week"
        />
      </Section>

      {/* Growth trend + churn donut */}
      <Section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <GlassCard className="lg:col-span-3">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold text-[#eef2ff]">
                Growth Trend
              </h3>
              <p className="text-xs text-[#4a5278]">
                Weekly signup cohort sizes
              </p>
            </div>
            <span className="rounded-full border border-[#1c2035] bg-[#111527] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8892b0]">
              {retention.cohorts.length} weeks
            </span>
          </div>
          {trendData.length > 0 ? (
            <TrendLineChart
              data={trendData}
              color="#4f6ef7"
              seriesName="Cohort size"
              valueFormatter={(n) => formatNumber(n)}
            />
          ) : (
            <EmptyState
              compact
              title="No growth history yet"
              description="Weekly signup cohorts will appear here as data arrives."
            />
          )}
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <div className="mb-2">
            <h3 className="text-[13px] font-semibold text-[#eef2ff]">
              Churn Risk Overview
            </h3>
            <p className="text-xs text-[#4a5278]">
              Distribution from {formatNumber(churn.users.length)} returned users
            </p>
          </div>
          {churn.users.length > 0 ? (
            <ChurnDonutChart
              high={dist.high}
              medium={dist.medium}
              low={dist.low}
              centerLabel="Scored"
              height={240}
            />
          ) : (
            <EmptyState
              compact
              title="No churn scores yet"
              description="Risk distribution will appear when users are available to score."
            />
          )}
        </GlassCard>
      </Section>

      {/* Top insights + critical alert */}
      <Section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 text-[13px] font-semibold text-[#eef2ff]">
            Top Insights
          </h3>
          <div className="space-y-3">
            {insightItems.length > 0 ? (
              insightItems.map((item, i) => (
                <InsightCard key={i} variant={item.variant} text={item.text} />
              ))
            ) : (
              <p className="text-sm text-[#8892b0]">
                No insights surfaced this week.
              </p>
            )}
          </div>
        </GlassCard>

        <AlertCard
          label="Critical Alert"
          metricLabel="Biggest funnel drop-off"
          title={transitionLabel}
          metricValue={worstStep ? formatPercent(worstStep.drop_off_rate) : "-"}
          action={alertAction}
        />
      </Section>
    </PageContainer>
  );
}
