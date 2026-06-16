"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

function useFadeUp(delay: number) {
  const shouldReduce = useReducedMotion();
  return {
    initial: shouldReduce ? undefined : { opacity: 0, y: 24 },
    animate: shouldReduce ? undefined : { opacity: 1, y: 0 },
    transition: shouldReduce
      ? undefined
      : { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
  };
}

function HeroText() {
  const eyebrow = useFadeUp(0);
  const headline = useFadeUp(0.08);
  const sub = useFadeUp(0.16);
  const ctas = useFadeUp(0.24);
  const cred = useFadeUp(0.3);

  return (
    <>
      <motion.p
        className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#4f6ef7]"
        {...eyebrow}
      >
        Product Analytics for Early-Stage Teams
      </motion.p>

      <motion.h1
        className="mx-auto mb-6 max-w-4xl text-center text-5xl font-black leading-[1.08] tracking-tight text-[#eef2ff] sm:text-6xl lg:text-7xl"
        {...headline}
      >
        Know what is breaking growth{" "}
        <span className="bg-gradient-to-r from-[#4f6ef7] to-[#a78bfa] bg-clip-text text-transparent">
          - and what to do next.
        </span>
      </motion.h1>

      <motion.p
        className="mx-auto mb-10 max-w-2xl text-center text-base text-[#8892b0] sm:text-lg"
        {...sub}
      >
        RevLoop brings funnels, retention, acquisition quality, churn risk,
        insights, and experiments into one decision layer for founders and
        product teams.
      </motion.p>

      <motion.div
        className="mb-5 flex flex-col items-center justify-center gap-3 sm:flex-row"
        {...ctas}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-[#4f6ef7] px-7 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(79,110,247,0.4)] transition-all hover:bg-[#6b84f9] hover:shadow-[0_0_32px_rgba(79,110,247,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
        >
          View Live Demo
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <a
          href="#how-it-works"
          className="flex items-center gap-2 rounded-xl border border-[#1c2035] bg-[#0c0f1d] px-7 py-3 text-sm font-semibold text-[#8892b0] transition-all hover:border-[#4f6ef7]/50 hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
        >
          See How It Works
          <ChevronRight className="h-4 w-4" aria-hidden />
        </a>
      </motion.div>

      <motion.p
        className="mb-16 text-center text-xs text-[#4a5278]"
        {...cred}
      >
        Built with Next.js, FastAPI, PostgreSQL, and scikit-learn.
      </motion.p>
    </>
  );
}

function DashboardPreview() {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      id="demo"
      className="relative mx-auto max-w-5xl scroll-mt-20"
      initial={shouldReduce ? undefined : { opacity: 0, scale: 0.97, y: 32 }}
      animate={shouldReduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
      transition={
        shouldReduce
          ? undefined
          : { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const, delay: 0.38 }
      }
    >
      {/* Indigo glow behind preview */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(79,110,247,0.18)_0%,transparent_70%)]"
        aria-hidden
      />

      {/* Browser chrome */}
      <div className="relative overflow-hidden rounded-xl border border-[#1c2035] bg-[#070a14] shadow-[0_0_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(79,110,247,0.15)]">
        {/* Browser bar */}
        <div className="flex h-10 items-center gap-2 border-b border-[#1c2035] bg-[#0c0f1d] px-4">
          <div className="flex gap-1.5" aria-hidden>
            <div className="h-2.5 w-2.5 rounded-full bg-[#f43f5e]/50" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]/50" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#10b981]/50" />
          </div>
          <div className="mx-auto flex h-5 w-52 items-center justify-center rounded bg-[#111527] px-3 text-[10px] text-[#4a5278]">
            RevLoop demo /dashboard
          </div>
        </div>

        {/* Screenshot */}
        <div className="relative aspect-[2492/1385] overflow-hidden">
          <Image
            src="/landing/dashboard-preview.png"
            alt="RevLoop dashboard showing funnel metrics, retention cohorts, acquisition channels, and churn risk scoring"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1280px) calc(100vw - 64px), 1024px"
          />
          {/* Subtle vignette */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,7,15,0.5)_100%)]"
            aria-hidden
          />
        </div>
      </div>

      {/* Floating callouts - hidden on smaller screens to avoid overflow */}
      <div
        className="pointer-events-none absolute -left-4 top-1/4 hidden rounded-xl border border-[#10b981]/30 bg-[#05070f]/90 px-3 py-2 shadow-[0_0_16px_rgba(16,185,129,0.15)] backdrop-blur-sm xl:block"
        aria-hidden
      >
        <p className="text-xs font-bold text-[#10b981]">52.5%</p>
        <p className="text-[10px] text-[#4a5278]">activation rate</p>
      </div>
      <div
        className="pointer-events-none absolute -right-4 top-1/3 hidden rounded-xl border border-[#f43f5e]/30 bg-[#05070f]/90 px-3 py-2 shadow-[0_0_16px_rgba(244,63,94,0.15)] backdrop-blur-sm xl:block"
        aria-hidden
      >
        <p className="text-xs font-bold text-[#f43f5e]">449</p>
        <p className="text-[10px] text-[#4a5278]">high-risk users</p>
      </div>
      <div
        className="pointer-events-none absolute -right-4 bottom-1/4 hidden rounded-xl border border-[#4f6ef7]/30 bg-[#05070f]/90 px-3 py-2 shadow-[0_0_16px_rgba(79,110,247,0.15)] backdrop-blur-sm xl:block"
        aria-hidden
      >
        <p className="text-xs font-bold text-[#4f6ef7]">Referral</p>
        <p className="text-[10px] text-[#4a5278]">leads retention</p>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden pb-24 pt-32 sm:pb-32 sm:pt-40"
      aria-label="RevLoop overview"
    >
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(79,110,247,0.12)_0%,transparent_70%)]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.07)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeroText />
        <DashboardPreview />
      </div>
    </section>
  );
}
