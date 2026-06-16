import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Retention Cohorts",
  description:
    "Weekly cohort retention heatmap showing how each signup week keeps returning over its first four weeks.",
};

export default function RetentionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
