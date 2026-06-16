import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

const LOOP_STEPS = ["Measure", "Understand", "Predict", "Experiment", "Learn"];

export function ProductLoopSection() {
  return (
    <section className="bg-[#070a14] py-16 sm:py-20" aria-labelledby="loop-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-2xl border border-[#1c2035] bg-[#0c0f1d] p-8 text-center sm:p-12">
            <h2
              id="loop-heading"
              className="mb-3 text-2xl font-bold tracking-tight text-[#eef2ff] sm:text-3xl"
            >
              The RevLoop
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-sm text-[#8892b0]">
              RevLoop doesn&apos;t stop at charts. It connects analytics to
              action and tracks whether the action worked.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {LOOP_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-xl border border-[#4f6ef7]/30 bg-[#4f6ef7]/10 px-4 py-2 text-sm font-semibold text-[#eef2ff]">
                    {step}
                  </span>
                  {i < LOOP_STEPS.length - 1 ? (
                    <ArrowRight
                      className="h-4 w-4 text-[#4f6ef7]/60"
                      aria-hidden
                    />
                  ) : (
                    <span className="text-sm text-[#4f6ef7]/60" aria-hidden>
                      loop
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
