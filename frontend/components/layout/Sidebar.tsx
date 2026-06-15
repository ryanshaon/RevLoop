"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActive, NAV_ITEMS } from "./nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-[#1c2035] bg-[#070a14]/85 backdrop-blur-xl md:flex">
        <div className="px-5 pb-6 pt-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f6ef7] to-[#a78bfa] shadow-[0_0_18px_rgba(79,110,247,0.45)]">
              <Activity className="h-4 w-4 text-white" strokeWidth={2.75} />
            </div>
            <span className="bg-gradient-to-r from-[#4f6ef7] to-[#a78bfa] bg-clip-text text-xl font-black tracking-tight text-transparent">
              RevLoop
            </span>
          </Link>

          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1c2035] bg-[#0c0f1d] px-2.5 py-1 text-[11px] font-medium text-[#8892b0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_#10b981]" />
              Campus Connect Demo
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60",
                  active
                    ? "border-[#4f6ef7] bg-[#111527] text-white shadow-[inset_0_0_18px_rgba(79,110,247,0.10)]"
                    : "border-transparent text-[#8892b0] hover:bg-[#0f1322] hover:text-[#eef2ff]",
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-colors",
                    active
                      ? "text-[#4f6ef7]"
                      : "text-[#4a5278] group-hover:text-[#8892b0]",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-5">
          <div className="rounded-lg border border-[#1c2035] bg-[#0c0f1d] px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4a5278]">
            v0.1 — Alpha
          </div>
        </div>
      </aside>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 rounded-2xl border border-[#1c2035] bg-[#070a14]/95 p-1.5 shadow-[0_0_32px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60",
                active
                  ? "bg-[#111527] text-[#4f6ef7]"
                  : "text-[#4a5278] hover:bg-[#0f1322] hover:text-[#eef2ff]",
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
