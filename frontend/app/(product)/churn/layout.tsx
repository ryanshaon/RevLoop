import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Churn Risk",
  description:
    "ML churn risk scoring for every identified user: risk score, level, reason, and recommended action.",
};

export default function ChurnLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
