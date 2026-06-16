import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Experiment Tracker",
  description:
    "Track every growth experiment: hypothesis, target metric, status, and result summary.",
};

export default function ExperimentsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
