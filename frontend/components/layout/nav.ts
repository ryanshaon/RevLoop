import {
  AlertTriangle,
  FlaskConical,
  Layers,
  LayoutDashboard,
  type LucideIcon,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/funnel", label: "Funnel", icon: TrendingUp },
  { href: "/retention", label: "Retention", icon: RefreshCw },
  { href: "/channels", label: "Channels", icon: Layers },
  { href: "/churn", label: "Churn Risk", icon: AlertTriangle },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/insights", label: "Insights", icon: Sparkles },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPageTitle(pathname: string): string {
  const match = NAV_ITEMS.find((item) => isActive(pathname, item.href));
  return match?.label ?? "Overview";
}
