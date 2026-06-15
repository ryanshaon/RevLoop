import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/** Primary action button styled to the design system. */
export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg border border-[#3d4fd6]/40 bg-[#4f6ef7]/10 px-4 py-2 text-sm font-semibold text-[#eef2ff] transition-all duration-200 hover:border-[#3d4fd6] hover:bg-[#4f6ef7]/20 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/40 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));

Button.displayName = "Button";
