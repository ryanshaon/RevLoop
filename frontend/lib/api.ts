/**
 * Typed API client for the RevLoop FastAPI backend.
 * All requests are no-store so the dashboard always reflects live backend data
 * during local development.
 */
import type {
  ChannelsResponse,
  ChurnResponse,
  DashboardSummary,
  Experiment,
  ExperimentCreate,
  ExperimentStats,
  ExperimentStatus,
  ExperimentsResponse,
  ExperimentUpdate,
  FunnelResponse,
  InsightsSummary,
  RetentionResponse,
} from "./types";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function getErrorDetail(res: Response): Promise<string> {
  const fallback = `Request failed with status ${res.status}`;
  try {
    const body = (await res.json()) as {
      detail?: string | Array<{ loc?: Array<string | number>; msg?: string }>;
    };
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      const messages = body.detail
        .map((item) => {
          const field = item.loc?.at(-1);
          return item.msg ? `${field ? `${field}: ` : ""}${item.msg}` : null;
        })
        .filter(Boolean);
      if (messages.length > 0) return messages.join("; ");
    }
  } catch {
    // The response did not contain a JSON error body.
  }
  return fallback;
}

async function getJson<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    // Network-level failure (backend down, CORS, DNS, etc.)
    throw new ApiError(
      err instanceof Error ? err.message : "Network request failed",
      0,
    );
  }

  if (!res.ok) {
    throw new ApiError(await getErrorDetail(res), res.status);
  }

  return (await res.json()) as T;
}

export function getDashboardSummary(orgId = 1): Promise<DashboardSummary> {
  return getJson<DashboardSummary>(`/api/dashboard/summary?org_id=${orgId}`);
}

export function getFunnel(orgId = 1): Promise<FunnelResponse> {
  return getJson<FunnelResponse>(`/api/funnel?org_id=${orgId}`);
}

export function getRetention(orgId = 1): Promise<RetentionResponse> {
  return getJson<RetentionResponse>(`/api/retention?org_id=${orgId}`);
}

export function getChannelsPerformance(orgId = 1): Promise<ChannelsResponse> {
  return getJson<ChannelsResponse>(`/api/channels/performance?org_id=${orgId}`);
}

export function getChurnRisk(orgId = 1, limit = 50): Promise<ChurnResponse> {
  return getJson<ChurnResponse>(
    `/api/churn-risk?org_id=${orgId}&limit=${limit}`,
  );
}

export function getInsightsSummary(orgId = 1): Promise<InsightsSummary> {
  return getJson<InsightsSummary>(
    `/api/insights/weekly-summary?org_id=${orgId}`,
  );
}

async function mutateJson<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : "Network request failed",
      0,
    );
  }

  if (!res.ok) {
    throw new ApiError(await getErrorDetail(res), res.status);
  }

  return (await res.json()) as T;
}

export function getExperiments(
  orgId = 1,
  status: ExperimentStatus | "all" = "all",
): Promise<ExperimentsResponse> {
  return getJson<ExperimentsResponse>(
    `/api/experiments?org_id=${orgId}&status=${status}`,
  );
}

export function getExperimentStats(orgId = 1): Promise<ExperimentStats> {
  return getJson<ExperimentStats>(`/api/experiments/stats?org_id=${orgId}`);
}

export function createExperiment(data: ExperimentCreate): Promise<Experiment> {
  return mutateJson<Experiment>("/api/experiments", "POST", data);
}

export function updateExperiment(
  id: number,
  data: ExperimentUpdate,
): Promise<Experiment> {
  return mutateJson<Experiment>(`/api/experiments/${id}`, "PATCH", data);
}

export function deleteExperiment(id: number): Promise<Experiment> {
  return mutateJson<Experiment>(`/api/experiments/${id}`, "DELETE");
}

export { API_BASE };
