import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ProductLoopSection } from "@/components/landing/ProductLoopSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: {
    absolute: "RevLoop | Product Analytics for Early-Stage Teams",
  },
  description:
    "RevLoop helps founders and product teams understand funnels, retention, acquisition quality, ML churn risk, and the experiments they should run next.",
  openGraph: {
    title: "RevLoop | Product Analytics for Early-Stage Teams",
    description:
      "RevLoop helps founders and product teams understand funnels, retention, acquisition quality, ML churn risk, and the experiments they should run next.",
  },
  twitter: {
    card: "summary",
    title: "RevLoop | Product Analytics for Early-Stage Teams",
    description:
      "RevLoop helps founders and product teams understand funnels, retention, acquisition quality, ML churn risk, and the experiments they should run next.",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05070f] text-[#eef2ff]">
      <LandingNavbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <MetricsSection />
        <HowItWorksSection />
        <ProductLoopSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
