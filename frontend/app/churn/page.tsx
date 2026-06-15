"use client";

import { AlertCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { useCallback } from "react";
import { GlassCard } from "@/components/cards/GlassCard";
import { MetricCard } from "@/components/cards/MetricCard";
import { ChurnDonutChart } from "@/components/charts/ChurnDonutChart";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageContainer, Section } from "@/components/common/PageContainer";
import { PageHeading } from "@/components/common/PageHeading";
import { ChurnSkeleton } from "@/components/common/Skeletons";
import { useApi } from "@/components/common/useApi";
import { ChurnTable } from "@/components/tables/ChurnTable";
import { getChurnRisk } from "@/lib/api";
import { formatNumber, normalizeRisk } from "@/lib/utils";

export default function ChurnPage() {
  const { data, loading, error, reload } = useApi(
    useCallback(() => getChurnRisk(1, 500), []),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeading
          kicker="Retention Risk"
          title="Churn Risk"
          description="Rule-based scoring of which users are slipping away — and the play to win them back."
        />
        <ChurnSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error ?? undefined} onRetry={reload} />;
  }

  if (data.users.length === 0) {
    return (
      <PageContainer>
        <Section>
          <PageHeading
            kicker="Retention Risk"
            title="Churn Risk"
            description="Rule-based scoring of which users are slipping away — and the play to win them back."
          />
        </Section>
        <Section>
          <EmptyState
            title="No users available to score"
            description="Churn risk will appear after identified users generate product activity."
          />
        </Section>
      </PageContainer>
    );
  }

  const dist = data.users.reduce(
    (acc, u) => {
      acc[normalizeRisk(u.risk_level)] += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 },
  );

  return (
    <PageContainer>
      <Section>
        <PageHeading
          kicker="Retention Risk"
          title="Churn Risk"
          description="Rule-based scoring of which users are slipping away — and the play to win them back."
        />
      </Section>

      <Section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <MetricCard
            label="High Risk"
            value={dist.high}
            icon={AlertTriangle}
            color="red"
            format={formatNumber}
          />
        </div>
        <div>
          <MetricCard
            label="Medium Risk"
            value={dist.medium}
            icon={AlertCircle}
            color="amber"
            format={formatNumber}
          />
        </div>
        <div>
          <MetricCard
            label="Low Risk"
            value={dist.low}
            icon={ShieldCheck}
            color="emerald"
            format={formatNumber}
          />
        </div>
      </Section>

      <Section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1">
          <div className="mb-2">
            <h3 className="text-[13px] font-semibold text-[#eef2ff]">
              Risk Distribution
            </h3>
            <p className="text-xs text-[#4a5278]">
              API sample of {formatNumber(data.users.length)} scored users
            </p>
          </div>
          <ChurnDonutChart
            high={dist.high}
            medium={dist.medium}
            low={dist.low}
            centerLabel="Scored"
            height={280}
          />
        </GlassCard>

        <GlassCard className="p-0 lg:col-span-2">
          <div className="p-6 pb-4">
            <h3 className="text-[13px] font-semibold text-[#eef2ff]">
              At-Risk Users
            </h3>
            <p className="text-xs text-[#4a5278]">
              Sorted by risk score, highest first
            </p>
          </div>
          <ChurnTable users={data.users} limit={100} />
        </GlassCard>
      </Section>
    </PageContainer>
  );
}
