"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  FlaskConical,
  Loader2,
  Pencil,
  Play,
  Plus,
  Target,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/cards/GlassCard";
import { MetricCard } from "@/components/cards/MetricCard";
import { ErrorState } from "@/components/common/ErrorState";
import { PageContainer, Section } from "@/components/common/PageContainer";
import { PageHeading } from "@/components/common/PageHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  createExperiment,
  deleteExperiment,
  getExperimentStats,
  getExperiments,
  updateExperiment,
} from "@/lib/api";
import type {
  Experiment,
  ExperimentCreate,
  ExperimentStats,
  ExperimentStatus,
  ExperimentUpdate,
} from "@/lib/types";
import { cn, formatPercent } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Status helpers                                                       */
/* ------------------------------------------------------------------ */

const STATUS_LABELS: Record<ExperimentStatus, string> = {
  planned: "Planned",
  running: "Running",
  completed: "Completed",
  cancelled: "Cancelled",
};

function StatusBadge({ status }: { status: ExperimentStatus }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4f6ef7]/30 bg-[#4f6ef7]/10 px-2.5 py-1 text-[11px] font-semibold text-[#4f6ef7]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4f6ef7] shadow-[0_0_6px_#4f6ef7]" />
        Running
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 px-2.5 py-1 text-[11px] font-semibold text-[#10b981]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_#10b981]" />
        Completed
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f43f5e]/20 bg-[#f43f5e]/8 px-2.5 py-1 text-[11px] font-semibold text-[#f43f5e]/70">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]/70" />
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1c2035] bg-[#111527] px-2.5 py-1 text-[11px] font-semibold text-[#8892b0]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#8892b0]" />
      Planned
    </span>
  );
}

function PriorityDot({ status }: { status: ExperimentStatus }) {
  if (status === "running") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#f43f5e]">
        <span className="h-2 w-2 rounded-full bg-[#f43f5e] shadow-[0_0_6px_#f43f5e]" />
        High
      </span>
    );
  }
  if (status === "planned") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#f59e0b]">
        <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
        Medium
      </span>
    );
  }
  return null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* ------------------------------------------------------------------ */
/* Experiment Card                                                      */
/* ------------------------------------------------------------------ */

interface ExperimentCardProps {
  experiment: Experiment;
  onEdit: (exp: Experiment) => void;
  onMarkRunning: (exp: Experiment) => void;
  onMarkComplete: (exp: Experiment) => void;
  onCancel: (exp: Experiment) => void;
  isUpdating: boolean;
}

function ExperimentCard({
  experiment: exp,
  onEdit,
  onMarkRunning,
  onMarkComplete,
  onCancel,
  isUpdating,
}: ExperimentCardProps) {
  const isCancelled = exp.status === "cancelled";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative rounded-2xl border bg-[#0c0f1d] p-5 transition-all duration-200",
        isCancelled
          ? "border-[#1c2035] opacity-60"
          : "border-[#1c2035] hover:border-[#3d4fd6]/40 hover:shadow-[0_0_24px_rgba(79,110,247,0.08)]",
      )}
    >
      {/* Top row: status badge + priority */}
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={exp.status} />
        <PriorityDot status={exp.status} />
      </div>

      {/* Name */}
      <h3 className="mt-3 text-[15px] font-semibold leading-snug text-[#eef2ff]">
        {exp.experiment_name}
      </h3>

      {/* Hypothesis */}
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#8892b0]">
        {exp.hypothesis}
      </p>

      {/* Target metric */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#4f6ef7]/20 bg-[#4f6ef7]/8 px-2.5 py-1 text-[11px] font-semibold text-[#6b8aff]">
          <Target className="h-3 w-3" />
          {exp.target_metric}
        </span>

        {/* Date range */}
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1c2035] bg-[#111527] px-2.5 py-1 text-[11px] text-[#4a5278]">
          <Calendar className="h-3 w-3" />
          {exp.start_date ? formatDate(exp.start_date) : "No start"} to{" "}
          {exp.end_date ? formatDate(exp.end_date) : "Ongoing"}
        </span>
      </div>

      {/* Result summary (completed only) */}
      {exp.status === "completed" && exp.result_summary && (
        <div className="mt-3 rounded-xl border border-[#10b981]/20 bg-[#10b981]/6 p-3">
          <p className="text-[12px] leading-relaxed text-[#10b981]">
            {exp.result_summary}
          </p>
        </div>
      )}

      {/* Hover actions */}
      {!isCancelled && (
        <div className="mt-4 flex flex-wrap items-center gap-2 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          <button
            onClick={() => onEdit(exp)}
            disabled={isUpdating}
            className="flex items-center gap-1.5 rounded-lg border border-[#1c2035] bg-[#111527] px-3 py-1.5 text-[11px] font-semibold text-[#8892b0] transition-colors hover:border-[#4f6ef7]/30 hover:text-[#4f6ef7] disabled:opacity-50"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
          {exp.status === "planned" && (
            <button
              onClick={() => onMarkRunning(exp)}
              disabled={isUpdating}
              className="flex items-center gap-1.5 rounded-lg border border-[#4f6ef7]/30 bg-[#4f6ef7]/10 px-3 py-1.5 text-[11px] font-semibold text-[#4f6ef7] transition-colors hover:bg-[#4f6ef7]/20 disabled:opacity-50"
            >
              <Play className="h-3 w-3" />
              Mark Running
            </button>
          )}
          {exp.status === "running" && (
            <button
              onClick={() => onMarkComplete(exp)}
              disabled={isUpdating}
              className="flex items-center gap-1.5 rounded-lg border border-[#10b981]/30 bg-[#10b981]/10 px-3 py-1.5 text-[11px] font-semibold text-[#10b981] transition-colors hover:bg-[#10b981]/20 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3 w-3" />
              Mark Complete
            </button>
          )}
          <button
            onClick={() => onCancel(exp)}
            disabled={isUpdating}
            className="flex items-center gap-1.5 rounded-lg border border-[#f43f5e]/20 bg-[#f43f5e]/6 px-3 py-1.5 text-[11px] font-semibold text-[#f43f5e]/80 transition-colors hover:bg-[#f43f5e]/15 disabled:opacity-50"
          >
            <XCircle className="h-3 w-3" />
            Cancel
          </button>
        </div>
      )}

      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#0c0f1d]/70">
          <Loader2 className="h-5 w-5 animate-spin text-[#4f6ef7]" />
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Create/Edit Modal                                                    */
/* ------------------------------------------------------------------ */

interface ModalProps {
  initial?: Experiment | null;
  onClose: () => void;
  onSave: (data: ExperimentCreate | ExperimentUpdate, id?: number) => Promise<void>;
}

const EMPTY_FORM: ExperimentCreate = {
  experiment_name: "",
  hypothesis: "",
  target_metric: "",
  status: "planned",
  start_date: null,
  end_date: null,
  result_summary: null,
};

function ExperimentModal({ initial, onClose, onSave }: ModalProps) {
  const isEdit = !!initial;
  const [form, setForm] = useState<ExperimentCreate>(
    initial
      ? {
          experiment_name: initial.experiment_name,
          hypothesis: initial.hypothesis,
          target_metric: initial.target_metric,
          status: initial.status,
          start_date: initial.start_date,
          end_date: initial.end_date,
          result_summary: initial.result_summary,
        }
      : EMPTY_FORM,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  function set<K extends keyof ExperimentCreate>(k: K, v: ExperimentCreate[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.experiment_name.trim() || !form.hypothesis.trim() || !form.target_metric.trim()) {
      setError("Name, hypothesis, and target metric are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSave(form, initial?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save experiment.");
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={backdropRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(5,7,15,0.75)", backdropFilter: "blur(8px)" }}
        onClick={(e) => {
          if (e.target === backdropRef.current) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="experiment-modal-title"
          className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#1c2035] bg-[#111527] p-6 shadow-[0_0_64px_rgba(79,110,247,0.15)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#4f6ef7]/30 bg-[#4f6ef7]/12">
                <FlaskConical className="h-4 w-4 text-[#4f6ef7]" />
              </div>
              <h2
                id="experiment-modal-title"
                className="text-[15px] font-semibold text-[#eef2ff]"
              >
                {isEdit ? "Edit Experiment" : "New Experiment"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close experiment dialog"
              className="rounded-lg p-1.5 text-[#4a5278] transition-colors hover:bg-[#1c2035] hover:text-[#eef2ff]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Experiment name */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#4a5278]">
                Experiment Name *
              </label>
              <input
                type="text"
                value={form.experiment_name}
                onChange={(e) => set("experiment_name", e.target.value)}
                placeholder="e.g. Onboarding email A/B test"
                className="w-full rounded-xl border border-[#1c2035] bg-[#0c0f1d] px-3.5 py-2.5 text-[13px] text-[#eef2ff] placeholder-[#4a5278] outline-none transition-colors focus:border-[#4f6ef7]/50 focus:ring-1 focus:ring-[#4f6ef7]/20"
              />
            </div>

            {/* Hypothesis */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#4a5278]">
                Hypothesis *
              </label>
              <textarea
                rows={3}
                value={form.hypothesis}
                onChange={(e) => set("hypothesis", e.target.value)}
                placeholder="We believe that... will result in... because..."
                className="w-full resize-none rounded-xl border border-[#1c2035] bg-[#0c0f1d] px-3.5 py-2.5 text-[13px] text-[#eef2ff] placeholder-[#4a5278] outline-none transition-colors focus:border-[#4f6ef7]/50 focus:ring-1 focus:ring-[#4f6ef7]/20"
              />
            </div>

            {/* Target metric */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#4a5278]">
                Target Metric *
              </label>
              <input
                type="text"
                value={form.target_metric}
                onChange={(e) => set("target_metric", e.target.value)}
                placeholder="e.g. Activation rate, Day-7 retention"
                className="w-full rounded-xl border border-[#1c2035] bg-[#0c0f1d] px-3.5 py-2.5 text-[13px] text-[#eef2ff] placeholder-[#4a5278] outline-none transition-colors focus:border-[#4f6ef7]/50 focus:ring-1 focus:ring-[#4f6ef7]/20"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#4a5278]">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as ExperimentStatus)}
                className="w-full rounded-xl border border-[#1c2035] bg-[#0c0f1d] px-3.5 py-2.5 text-[13px] text-[#eef2ff] outline-none transition-colors focus:border-[#4f6ef7]/50 focus:ring-1 focus:ring-[#4f6ef7]/20"
              >
                <option value="planned">Planned</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#4a5278]">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.start_date ?? ""}
                  onChange={(e) => set("start_date", e.target.value || null)}
                  className="w-full rounded-xl border border-[#1c2035] bg-[#0c0f1d] px-3.5 py-2.5 text-[13px] text-[#eef2ff] outline-none transition-colors focus:border-[#4f6ef7]/50 focus:ring-1 focus:ring-[#4f6ef7]/20 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#4a5278]">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.end_date ?? ""}
                  onChange={(e) => set("end_date", e.target.value || null)}
                  className="w-full rounded-xl border border-[#1c2035] bg-[#0c0f1d] px-3.5 py-2.5 text-[13px] text-[#eef2ff] outline-none transition-colors focus:border-[#4f6ef7]/50 focus:ring-1 focus:ring-[#4f6ef7]/20 [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Result summary is always visible and highlighted when completed. */}
            <div>
              <label className={cn(
                "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em]",
                form.status === "completed" ? "text-[#10b981]" : "text-[#4a5278]",
              )}>
                Result Summary{form.status === "completed" ? " (recommended)" : " (optional)"}
              </label>
              <textarea
                rows={form.status === "completed" ? 3 : 2}
                value={form.result_summary ?? ""}
                onChange={(e) => set("result_summary", e.target.value || null)}
                placeholder={
                  form.status === "completed"
                    ? "What happened? Did it win or lose?"
                    : "Fill in once the experiment concludes"
                }
                className={cn(
                  "w-full resize-none rounded-xl border px-3.5 py-2.5 text-[13px] text-[#eef2ff] placeholder-[#4a5278] outline-none transition-colors focus:ring-1",
                  form.status === "completed"
                    ? "border-[#10b981]/30 bg-[#10b981]/5 focus:border-[#10b981]/50 focus:ring-[#10b981]/20"
                    : "border-[#1c2035] bg-[#0c0f1d] focus:border-[#4f6ef7]/50 focus:ring-[#4f6ef7]/20",
                )}
              />
            </div>

            {error && (
              <p className="rounded-xl border border-[#f43f5e]/30 bg-[#f43f5e]/8 px-3.5 py-2.5 text-[13px] text-[#f43f5e]">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#1c2035] px-4 py-2 text-[13px] font-semibold text-[#8892b0] transition-colors hover:bg-[#1c2035] hover:text-[#eef2ff]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-[#4f6ef7] px-5 py-2 text-[13px] font-semibold text-white shadow-[0_0_18px_rgba(79,110,247,0.35)] transition-all hover:bg-[#6b8aff] hover:shadow-[0_0_24px_rgba(79,110,247,0.45)] disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEdit ? "Save Changes" : "Create Experiment"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                             */
/* ------------------------------------------------------------------ */

function ExperimentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#1c2035] bg-[#0c0f1d] p-6">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="mt-6 h-10 w-20" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#1c2035] bg-[#0c0f1d] p-5 space-y-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filter tabs                                                          */
/* ------------------------------------------------------------------ */

type ExperimentFilter = ExperimentStatus | "all";

const FILTER_OPTIONS: { value: ExperimentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "planned", label: "Planned" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function ExperimentsPage() {
  const [stats, setStats] = useState<ExperimentStats | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ExperimentFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Experiment | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, expData] = await Promise.all([
        getExperimentStats(),
        getExperiments(1, filter),
      ]);
      setStats(statsData);
      setExperiments(expData.experiments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load experiments.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function refreshAll() {
    try {
      const [statsData, expData] = await Promise.all([
        getExperimentStats(),
        getExperiments(1, filter),
      ]);
      setStats(statsData);
      setExperiments(expData.experiments);
    } catch {
      setActionError(
        "The change was saved, but the refreshed data could not be loaded.",
      );
    }
  }

  function openCreate() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(exp: Experiment) {
    setEditTarget(exp);
    setModalOpen(true);
  }

  async function handleSave(
    data: ExperimentCreate | ExperimentUpdate,
    id?: number,
  ) {
    if (id !== undefined) {
      await updateExperiment(id, data as ExperimentUpdate);
    } else {
      await createExperiment(data as ExperimentCreate);
    }
    await refreshAll();
  }

  async function handleOptimisticStatusChange(
    exp: Experiment,
    newStatus: ExperimentStatus,
  ) {
    setActionError(null);
    setUpdatingIds((prev) => new Set(prev).add(exp.id));
    setExperiments((prev) =>
      prev.map((e) => (e.id === exp.id ? { ...e, status: newStatus } : e)),
    );
    try {
      await updateExperiment(exp.id, { status: newStatus });
      await refreshAll();
    } catch (err) {
      setExperiments((prev) =>
        prev.map((e) => (e.id === exp.id ? exp : e)),
      );
      setActionError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(exp.id);
        return next;
      });
    }
  }

  async function handleCancel(exp: Experiment) {
    setActionError(null);
    setUpdatingIds((prev) => new Set(prev).add(exp.id));
    setExperiments((prev) =>
      prev.map((e) =>
        e.id === exp.id ? { ...e, status: "cancelled" } : e,
      ),
    );
    try {
      await deleteExperiment(exp.id);
      await refreshAll();
    } catch (err) {
      setExperiments((prev) =>
        prev.map((e) => (e.id === exp.id ? exp : e)),
      );
      setActionError(err instanceof Error ? err.message : "Failed to cancel.");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(exp.id);
        return next;
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeading
          kicker="Growth Lab"
          title="Experiments"
          description="Track every hypothesis, measure what moved, and double down on what worked."
        />
        <ExperimentsSkeleton />
      </div>
    );
  }

  if (error || !stats) {
    return <ErrorState message={error ?? undefined} onRetry={load} />;
  }

  const visibleExperiments =
    filter === "all"
      ? experiments
      : experiments.filter((e) => e.status === filter);

  return (
    <>
      <PageContainer>
        {/* Heading */}
        <Section>
          <PageHeading
            kicker="Growth Lab"
            title="Experiments"
            description="Track every hypothesis, measure what moved, and double down on what worked."
          />
        </Section>

        {/* Stats row */}
        <Section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard
            label="Total Experiments"
            value={stats.total}
            icon={FlaskConical}
            color="indigo"
          />
          <MetricCard
            label="Running Now"
            value={stats.running}
            icon={Play}
            color="blue"
          />
          <MetricCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            color="emerald"
          />
          <MetricCard
            label="Win Rate"
            value={stats.win_rate}
            icon={Trophy}
            color="amber"
            format={(n) => formatPercent(n)}
          />
        </Section>

        {/* Filter bar + new button */}
        <Section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-all",
                    filter === opt.value
                      ? "border-[#4f6ef7]/50 bg-[#4f6ef7]/15 text-[#4f6ef7] shadow-[0_0_12px_rgba(79,110,247,0.20)]"
                      : "border-[#1c2035] bg-[#0c0f1d] text-[#8892b0] hover:border-[#4f6ef7]/20 hover:text-[#eef2ff]",
                  )}
                >
                  {opt.label}
                  {opt.value !== "all" && stats[opt.value as keyof ExperimentStats] !== undefined && (
                    <span className="ml-1.5 rounded-full bg-current/20 px-1.5 py-0.5 text-[10px]">
                      {stats[opt.value as keyof ExperimentStats]}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-[#4f6ef7] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_18px_rgba(79,110,247,0.30)] transition-all hover:bg-[#6b8aff] hover:shadow-[0_0_24px_rgba(79,110,247,0.45)]"
            >
              <Plus className="h-4 w-4" />
              New Experiment
            </button>
          </div>
          {actionError && (
            <p className="mt-3 rounded-xl border border-[#f43f5e]/30 bg-[#f43f5e]/8 px-3.5 py-2.5 text-[13px] text-[#f43f5e]">
              {actionError}
            </p>
          )}
        </Section>

        {/* Experiment cards grid */}
        <Section>
          {visibleExperiments.length === 0 ? (
            <GlassCard className="flex flex-col items-center gap-3 py-16 text-center">
              <FlaskConical className="h-10 w-10 text-[#1c2035]" />
              <p className="text-[15px] font-semibold text-[#4a5278]">
                No experiments here yet
              </p>
              <p className="max-w-sm text-[13px] text-[#4a5278]">
                {filter === "all"
                  ? "Create your first experiment to start tracking what moves the needle."
                  : `No ${filter} experiments. Switch filters or create a new one.`}
              </p>
              <button
                onClick={openCreate}
                className="mt-2 flex items-center gap-2 rounded-xl bg-[#4f6ef7] px-4 py-2 text-[13px] font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                New Experiment
              </button>
            </GlassCard>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {visibleExperiments.map((exp) => (
                  <ExperimentCard
                    key={exp.id}
                    experiment={exp}
                    onEdit={openEdit}
                    onMarkRunning={(e) => handleOptimisticStatusChange(e, "running")}
                    onMarkComplete={(e) => handleOptimisticStatusChange(e, "completed")}
                    onCancel={handleCancel}
                    isUpdating={updatingIds.has(exp.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </Section>
      </PageContainer>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <ExperimentModal
          initial={editTarget}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
