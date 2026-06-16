import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Data-driven weekly summary of key risks, growth opportunities, and recommended experiments.",
};

export default function InsightsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
