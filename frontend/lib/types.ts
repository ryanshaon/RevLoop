/**
 * TypeScript interfaces mirroring the FastAPI backend response schemas exactly.
 * Backend source of truth: revloop/backend/app/schemas/*.py
 */

export type RiskLevel = "high" | "medium" | "low";

// GET /api/dashboard/summary
export interface DashboardSummary {
  total_users: number;
  new_users_this_week: number;
  activation_rate: number; // 0..1
  retention_rate: number; // 0..1
  churn_risk_average: number; // 0..1 (currently 0.0 — ML model arrives in Step 7)
  best_channel: string;
  worst_funnel_step: string;
  weekly_growth_percent: number; // e.g. -21.88
}

// GET /api/funnel
export interface FunnelStep {
  step: string;
  event: string;
  users: number;
  conversion_rate: number; // 0..1, relative to the previous step
  drop_off_rate: number; // 0..1, relative to previous step
}

export interface FunnelResponse {
  steps: FunnelStep[];
}

// GET /api/retention
export interface CohortRow {
  cohort_week: string; // e.g. "2026-03-02"
  cohort_size: number;
  week_0: number; // percentages 0..100
  week_1: number;
  week_2: number;
  week_3: number;
  week_4: number;
}

export interface RetentionResponse {
  cohorts: CohortRow[];
}

// GET /api/channels/performance
export interface ChannelPerformance {
  channel: string;
  visitors: number;
  signups: number;
  activated_users: number;
  retained_users: number;
  paid_users: number;
  activation_rate: number; // 0..1
  retention_rate: number; // 0..1
  paid_conversion_rate: number; // 0..1
  revenue: number;
  spend: number;
  cac: number;
  roi: number;
  channel_quality_score: number; // 0..1
}

export interface ChannelsResponse {
  channels: ChannelPerformance[];
}

// GET /api/churn-risk
export interface ChurnUser {
  user_id: number;
  external_user_id: string;
  acquisition_channel: string;
  signup_date: string;
  last_active_at: string;
  days_since_last_active: number;
  total_events: number;
  risk_score: number; // 0..1
  risk_level: RiskLevel;
  risk_reason: string;
  suggested_action: string;
}

export interface ChurnResponse {
  model_version: "ml_v1" | "rule_based";
  users: ChurnUser[];
}

// GET /api/experiments/stats
export interface ExperimentStats {
  total: number;
  planned: number;
  running: number;
  completed: number;
  cancelled: number;
  win_rate: number; // 0..1
}

// GET /api/experiments, POST /api/experiments, PATCH /api/experiments/:id, DELETE /api/experiments/:id
export type ExperimentStatus = "planned" | "running" | "completed" | "cancelled";

export interface Experiment {
  id: number;
  org_id: number;
  experiment_name: string;
  hypothesis: string;
  target_metric: string;
  status: ExperimentStatus;
  start_date: string | null;
  end_date: string | null;
  result_summary: string | null;
  created_at: string;
}

export interface ExperimentsResponse {
  experiments: Experiment[];
}

export interface ExperimentCreate {
  org_id?: number;
  experiment_name: string;
  hypothesis: string;
  target_metric: string;
  status: ExperimentStatus;
  start_date?: string | null;
  end_date?: string | null;
  result_summary?: string | null;
}

export interface ExperimentUpdate {
  experiment_name?: string;
  hypothesis?: string;
  target_metric?: string;
  status?: ExperimentStatus;
  start_date?: string | null;
  end_date?: string | null;
  result_summary?: string | null;
}

// GET /api/insights/weekly-summary
export interface InsightsSummary {
  summary: string;
  risks: string[];
  opportunities: string[];
  recommended_experiments: string[];
}
