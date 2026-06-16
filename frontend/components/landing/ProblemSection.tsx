import { AlertCircle, BarChart2, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

const PAIN_POINTS: {
  icon: typeof AlertCircle;
  title: string;
  description: string;
  accent: string;
  iconColor: string;
}[] = [
  {
    icon: AlertCircle,
    title: "Data is scattered",
    description:
      "Product events, campaigns, revenue, and experiments live in separate systems with no shared context or consistent definitions.",
    accent: "border-[#f43f5e]/30 bg-[#f43f5e]/5",
    iconColor: "text-[#f43f5e]",
  },
  {
    icon: BarChart2,
    title: "Charts don't explain decisions",
    description:
      "Teams can see what happened but not why it matters or which metric to fix first - so meetings end without a clear next action.",
    accent: "border-[#f59e0b]/30 bg-[#f59e0b]/5",
    iconColor: "text-[#f59e0b]",
  },
  {
    icon: TrendingDown,
    title: "Vanity metrics hide product health",
    description:
      "Traffic and signups can grow while activation, retention, and user quality quietly decline - invisible until it's too late.",
    accent: "border-[#f43f5e]/30 bg-[#f43f5e]/5",
    iconColor: "text-[#f43f5e]",
  },
];

export function ProblemSection() {
  return (
    <section
      className="py-24 sm:py-32"
      aria-labelledby="problem-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-14 text-center">
            <h2
              id="problem-heading"
              className="mb-4 text-3xl font-bold tracking-tight text-[#eef2ff] sm:text-4xl"
            >
              The problem with early-stage analytics
            </h2>
            <p className="mx-auto max-w-xl text-base text-[#8892b0]">
              Early-stage teams collect data, build dashboards, and still
              struggle to determine which action to take next.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-3">
          {PAIN_POINTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 0.1}>
                <div
                  className={cn(
                    "h-full rounded-xl border p-6",
                    item.accent,
                  )}
                >
                  <Icon
                    className={cn("mb-4 h-6 w-6", item.iconColor)}
                    aria-hidden
                  />
                  <h3 className="mb-2 text-base font-semibold text-[#eef2ff]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#8892b0]">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
