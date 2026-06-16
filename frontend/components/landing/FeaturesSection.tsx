import {
  BarChart2,
  RefreshCw,
  Layers,
  AlertTriangle,
  Sparkles,
  FlaskConical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  label: string;
  color: string;
  hoverBorder: string;
  hoverGlow: string;
}

const FEATURES: Feature[] = [
  {
    icon: BarChart2,
    title: "Funnel Analysis",
    description:
      "Track conversion between important user actions and identify the largest transition losses in your product flow.",
    label: "Conversion",
    color: "text-[#4f6ef7]",
    hoverBorder: "hover:border-[#4f6ef7]/40",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(79,110,247,0.12)]",
  },
  {
    icon: RefreshCw,
    title: "Retention Cohorts",
    description:
      "Understand whether users return after signup and how retention changes across acquisition cohorts over time.",
    label: "Engagement",
    color: "text-[#10b981]",
    hoverBorder: "hover:border-[#10b981]/40",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]",
  },
  {
    icon: Layers,
    title: "Channel Performance",
    description:
      "Compare acquisition quality using activation rate, retention, CAC, ROI, and a composite quality score per channel.",
    label: "Acquisition",
    color: "text-[#a78bfa]",
    hoverBorder: "hover:border-[#a78bfa]/40",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(167,139,250,0.12)]",
  },
  {
    icon: AlertTriangle,
    title: "ML Churn Risk",
    description:
      "Score users with a Logistic Regression model. Each prediction includes clear churn reasons and recommended actions.",
    label: "Prediction",
    color: "text-[#f43f5e]",
    hoverBorder: "hover:border-[#f43f5e]/40",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(244,63,94,0.12)]",
  },
  {
    icon: Sparkles,
    title: "Data-Driven Insights",
    description:
      "Prioritize risks, opportunities, and next experiments using real product metrics combined with ML output.",
    label: "Intelligence",
    color: "text-[#f59e0b]",
    hoverBorder: "hover:border-[#f59e0b]/40",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(245,158,11,0.12)]",
  },
  {
    icon: FlaskConical,
    title: "Experiment Tracker",
    description:
      "Create, run, complete, and evaluate growth experiments in one workflow - from hypothesis to measured result.",
    label: "Growth",
    color: "text-[#4f6ef7]",
    hoverBorder: "hover:border-[#4f6ef7]/40",
    hoverGlow: "hover:shadow-[0_0_24px_rgba(79,110,247,0.12)]",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-20 py-24 sm:py-32"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-14 text-center">
          <h2
            id="features-heading"
            className="mb-4 text-3xl font-bold tracking-tight text-[#eef2ff] sm:text-4xl"
          >
            Everything needed to move from metrics to action
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#8892b0]">
            Six interconnected modules that form a complete product decision
            system.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal
                key={feature.title}
                delay={i * 0.07}
                className={cn(
                  "group flex flex-col rounded-xl border border-[#1c2035] bg-[#0c0f1d] p-6 transition-all duration-300",
                  feature.hoverBorder,
                  feature.hoverGlow,
                )}
              >
                <div className="mb-4 flex items-start justify-between">
                  <Icon
                    className={cn("h-5 w-5", feature.color)}
                    aria-hidden
                  />
                  <span className="rounded-full border border-[#1c2035] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#4a5278]">
                    {feature.label}
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-[#eef2ff]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#8892b0]">
                  {feature.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
