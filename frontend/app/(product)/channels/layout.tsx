import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Channel Performance",
  description:
    "Compare acquisition channels by activation rate, retention rate, spend, CAC, ROI, and overall quality score.",
};

export default function ChannelsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
