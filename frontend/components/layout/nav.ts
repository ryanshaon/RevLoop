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

export interface NavGroup {
  id: string;
  items: NavItem[];
}

/** Primary analytics group, then action layer - rendered with a divider between. */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "analytics",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/funnel", label: "Funnel", icon: TrendingUp },
      { href: "/retention", label: "Retention", icon: RefreshCw },
      { href: "/channels", label: "Channels", icon: Layers },
      { href: "/churn", label: "Churn Risk", icon: AlertTriangle },
    ],
  },
  {
    id: "action",
    items: [
      { href: "/insights", label: "Insights", icon: Sparkles },
      { href: "/experiments", label: "Experiments", icon: FlaskConical },
    ],
  },
];

/** Flat list for helpers that only need all items. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPageTitle(pathname: string): string {
  const match = NAV_ITEMS.find((item) => isActive(pathname, item.href));
  return match?.label ?? "Overview";
}
