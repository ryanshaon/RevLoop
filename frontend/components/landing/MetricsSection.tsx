"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { cn } from "@/lib/utils";

interface MetricDef {
  value: number;
  label: string;
  format: (n: number) => string;
  color: string;
  glowColor: string;
}

const METRICS: MetricDef[] = [
  {
    value: 800,
    label: "Users tracked",
    format: (n) => Math.round(n).toLocaleString(),
    color: "text-[#4f6ef7]",
    glowColor: "rgba(79,110,247,0.15)",
  },
  {
    value: 20478,
    label: "Events analyzed",
    format: (n) => Math.round(n).toLocaleString(),
    color: "text-[#a78bfa]",
    glowColor: "rgba(167,139,250,0.15)",
  },
  {
    value: 6,
    label: "Acquisition channels",
    format: (n) => Math.round(n).toString(),
    color: "text-[#10b981]",
    glowColor: "rgba(16,185,129,0.15)",
  },
  {
    value: 52.5,
    label: "Activation rate",
    format: (n) => `${n.toFixed(1)}%`,
    color: "text-[#f59e0b]",
    glowColor: "rgba(245,158,11,0.15)",
  },
  {
    value: 449,
    label: "High-risk users identified",
    format: (n) => Math.round(n).toLocaleString(),
    color: "text-[#f43f5e]",
    glowColor: "rgba(244,63,94,0.15)",
  },
  {
    value: 5,
    label: "Growth experiments tracked",
    format: (n) => Math.round(n).toString(),
    color: "text-[#4f6ef7]",
    glowColor: "rgba(79,110,247,0.15)",
  },
];

function MetricCard({
  metric,
  active,
  index,
  shouldReduce,
}: {
  metric: MetricDef;
  active: boolean;
  index: number;
  shouldReduce: boolean | null;
}) {
  return (
    <motion.div
      initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
      animate={
        shouldReduce
          ? undefined
          : active
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 20 }
      }
      transition={
        shouldReduce
          ? undefined
          : { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }
      }
      className="flex flex-col items-center justify-center rounded-xl border border-[#1c2035] bg-[#0c0f1d] p-6 text-center"
      style={{ boxShadow: active ? `0 0 24px ${metric.glowColor}` : "none" }}
    >
      <p className={cn("mb-1 text-3xl font-black tabular-nums", metric.color)}>
        {shouldReduce ? (
          metric.format(metric.value)
        ) : active ? (
          <AnimatedNumber
            value={metric.value}
            format={metric.format}
            duration={1.4}
          />
        ) : (
          metric.format(0)
        )}
      </p>
      <p className="text-sm text-[#8892b0]">{metric.label}</p>
    </motion.div>
  );
}

export function MetricsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduce = useReducedMotion();

  return (
    <section
      className="bg-[#070a14] py-24 sm:py-32"
      aria-labelledby="metrics-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduce ? undefined : { opacity: 0, y: 20 }}
          whileInView={shouldReduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2
            id="metrics-heading"
            className="mb-2 text-3xl font-bold tracking-tight text-[#eef2ff] sm:text-4xl"
          >
            Built on a realistic product dataset
          </h2>
          <p className="mb-1 text-sm font-semibold text-[#4f6ef7]">
            Campus Connect Demo dataset
          </p>
          <p className="mx-auto max-w-lg text-sm text-[#8892b0]">
            All numbers below come from demo data - not commercial customers
            or live production traffic.
          </p>
        </motion.div>

        <div
          ref={ref}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        >
          {METRICS.map((metric, i) => (
            <MetricCard
              key={metric.label}
              metric={metric}
              active={shouldReduce ? true : isInView}
              index={i}
              shouldReduce={shouldReduce}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
