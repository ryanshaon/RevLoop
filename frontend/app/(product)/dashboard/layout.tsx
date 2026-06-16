import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Live overview of total users, activation, retention, growth trend, churn distribution, and top insights.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
