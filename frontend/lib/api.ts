/**
 * Typed API client for the RevLoop FastAPI backend.
 * All requests are no-store so the dashboard always reflects live backend data
 * during local development.
 */
import type {
  ChannelsResponse,
  ChurnResponse,
  DashboardSummary,
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
    let detail = `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body?.detail) detail = body.detail;
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(detail, res.status);
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

export { API_BASE };
