import { AlertTriangle, FlaskConical, type LucideIcon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type InsightVariant = "risk" | "opportunity" | "experiment";

const VARIANT_STYLES: Record<
  InsightVariant,
  { border: string; icon: string; iconColor: string; hover: string; defaultIcon: LucideIcon }
> = {
  risk: {
    border: "border-l-[#f43f5e]",
    icon: "border-[#f43f5e]/30 bg-[#f43f5e]/10",
    iconColor: "text-[#f43f5e]",
    hover: "hover:shadow-[0_0_22px_rgba(244,63,94,0.08)]",
    defaultIcon: AlertTriangle,
  },
  opportunity: {
    border: "border-l-[#10b981]",
    icon: "border-[#10b981]/30 bg-[#10b981]/10",
    iconColor: "text-[#10b981]",
    hover: "hover:shadow-[0_0_22px_rgba(16,185,129,0.08)]",
    defaultIcon: TrendingUp,
  },
  experiment: {
    border: "border-l-[#4f6ef7]",
    icon: "border-[#4f6ef7]/30 bg-[#4f6ef7]/10",
    iconColor: "text-[#4f6ef7]",
    hover: "hover:shadow-[0_0_22px_rgba(79,110,247,0.10)]",
    defaultIcon: FlaskConical,
  },
};

export function InsightCard({
  variant,
  text,
  icon,
  className,
}: {
  variant: InsightVariant;
  text: string;
  icon?: LucideIcon;
  className?: string;
}) {
  const styles = VARIANT_STYLES[variant];
  const Icon = icon ?? styles.defaultIcon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-[#1c2035] border-l-2 bg-[#0c0f1d] p-4 transition-all duration-200 hover:scale-[1.01] hover:border-[#3d4fd6]/30",
        styles.border,
        styles.hover,
        className,
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
          styles.icon,
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", styles.iconColor)} />
      </div>
      <p className="text-[13px] leading-relaxed text-[#c7d0e6]">{text}</p>
    </div>
  );
}
