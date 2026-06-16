import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { Reveal } from "./Reveal";

export function FinalCTASection() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-[#1c2035] bg-[#0c0f1d] p-10 text-center sm:p-16">
            {/* Subtle radial glow */}
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,110,247,0.12),transparent)]"
              aria-hidden
            />
            {/* Border glow effect */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgba(79,110,247,0.06)]"
              aria-hidden
            />

            <div className="relative z-10">
              <h2
                id="cta-heading"
                className="mb-4 text-3xl font-black tracking-tight text-[#eef2ff] sm:text-4xl lg:text-5xl"
              >
                See RevLoop turn product data into decisions.
              </h2>
              <p className="mx-auto mb-10 max-w-xl text-base text-[#8892b0]">
                Explore the complete dashboard, churn model, insight engine,
                and experiment tracker - all running on the Campus Connect
                demo dataset.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-[#4f6ef7] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(79,110,247,0.4)] transition-all hover:bg-[#6b84f9] hover:shadow-[0_0_32px_rgba(79,110,247,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
                >
                  View Live Demo
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <a
                  href="https://github.com/ryanshaon/RevLoop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-[#1c2035] bg-[#111527] px-8 py-3.5 text-sm font-semibold text-[#8892b0] transition-all hover:border-[#4f6ef7]/40 hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
                >
                  <Github className="h-4 w-4" aria-hidden />
                  View Source on GitHub
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
