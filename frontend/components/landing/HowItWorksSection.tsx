import { Database, LineChart, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    icon: Database,
    title: "Connect product data",
    description:
      "The demo models users, events, campaigns, revenue, and experiment data in one PostgreSQL-backed data layer.",
  },
  {
    number: "02",
    icon: LineChart,
    title: "Analyze product health",
    description:
      "RevLoop calculates funnels, cohorts, channel quality scores, churn probability via ML, and cross-module business signals automatically on each page load.",
  },
  {
    number: "03",
    icon: Target,
    title: "Act on prioritized insights",
    description:
      "Teams receive specific risks, opportunities, and experiments ordered by impact - so the next action is clear without manual analysis.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 py-24 sm:py-32"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-16 text-center">
            <h2
              id="how-it-works-heading"
              className="mb-4 text-3xl font-bold tracking-tight text-[#eef2ff] sm:text-4xl"
            >
              From product events to the next decision
            </h2>
            <p className="mx-auto max-w-xl text-base text-[#8892b0]">
              Three steps, one system, zero guesswork.
            </p>
          </div>
        </Reveal>

        <div className="relative mx-auto max-w-3xl">
          {/* Vertical timeline line - desktop */}
          <div
            className="absolute left-7 top-7 hidden h-[calc(100%-56px)] w-px bg-gradient-to-b from-[#4f6ef7]/50 via-[#a78bfa]/30 to-transparent sm:block"
            aria-hidden
          />

          <div className="space-y-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.number} delay={i * 0.12}>
                  <div className="flex gap-6">
                    {/* Step indicator */}
                    <div className="relative flex flex-shrink-0 flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#4f6ef7]/40 bg-[#111527] shadow-[0_0_20px_rgba(79,110,247,0.2)]">
                        <Icon className="h-5 w-5 text-[#4f6ef7]" aria-hidden />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2 pt-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="text-xs font-bold text-[#4a5278]">
                          {step.number}
                        </span>
                        <h3 className="text-base font-semibold text-[#eef2ff]">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-[#8892b0]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
