import { Link2, Lightbulb, RefreshCw } from "lucide-react";
import { Reveal } from "./Reveal";

const SOLUTIONS: {
  icon: typeof Link2;
  title: string;
  description: string;
}[] = [
  {
    icon: Link2,
    title: "One product-health view",
    description:
      "Connect acquisition, activation, retention, revenue, and churn into a single coherent picture in one schema-backed view.",
  },
  {
    icon: Lightbulb,
    title: "Prioritized decision signals",
    description:
      "Turn raw metrics into risks, opportunities, and recommended experiments ordered by impact, not by recency or chart position.",
  },
  {
    icon: RefreshCw,
    title: "Closed growth loop",
    description:
      "Move from insight to experiment, measure the result, and feed it into the next decision without losing context.",
  },
];

const FLOW_STEPS = [
  "Product Data",
  "Analytics",
  "ML Churn Risk",
  "Prioritized Insights",
  "Experiments",
  "Better Decisions",
];

export function SolutionSection() {
  return (
    <section
      className="bg-[#070a14] py-24 sm:py-32"
      aria-labelledby="solution-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-14 text-center">
            <h2
              id="solution-heading"
              className="mb-4 text-3xl font-bold tracking-tight text-[#eef2ff] sm:text-4xl"
            >
              RevLoop connects the dots
            </h2>
            <p className="mx-auto max-w-xl text-base text-[#8892b0]">
              One system that takes product data from raw events to the next
              decision.
            </p>
          </div>
        </Reveal>

        <div className="mb-16 grid gap-8 sm:grid-cols-3">
          {SOLUTIONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="flex flex-col gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#4f6ef7]/30 bg-[#4f6ef7]/10">
                    <Icon className="h-5 w-5 text-[#4f6ef7]" aria-hidden />
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-base font-semibold text-[#eef2ff]">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#8892b0]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Flow visualization */}
        <Reveal>
          <div className="rounded-xl border border-[#1c2035] bg-[#0c0f1d] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {FLOW_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-lg border border-[#1c2035] bg-[#111527] px-3 py-1.5 text-xs font-medium text-[#eef2ff]">
                    {step}
                  </span>
                  {i < FLOW_STEPS.length - 1 && (
                    <span className="text-lg text-[#4f6ef7]" aria-hidden>
                      -&gt;
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
