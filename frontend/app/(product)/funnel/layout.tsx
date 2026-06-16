import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Funnel Analysis",
  description:
    "Conversion funnel from signup to activation, retention, and payment, with step-by-step drop-off rates.",
};

export default function FunnelLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
