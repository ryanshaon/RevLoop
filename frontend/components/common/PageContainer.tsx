"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { fadeUp, pageContainer } from "./motion";

/** Page-entry wrapper: fades in and staggers its <Section> children upward. */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={pageContainer}
      initial="hidden"
      animate="show"
      className={cn("space-y-6", className)}
    >
      {children}
    </motion.div>
  );
}

/** A staggered child of PageContainer (fade + slide up). */
export function Section({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}
