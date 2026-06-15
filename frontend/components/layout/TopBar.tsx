"use client";

import { usePathname } from "next/navigation";
import { getPageTitle } from "./nav";

export function TopBar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#1c2035] bg-[#05070f]/70 px-6 backdrop-blur-xl md:px-8">
      <h1 className="bg-gradient-to-r from-[#eef2ff] to-[#a5b4fc] bg-clip-text text-lg font-bold tracking-tight text-transparent">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 px-2.5 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-live-ping rounded-full bg-[#10b981]" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]" />
          </span>
          <span className="text-[11px] font-semibold text-[#10b981]">Live</span>
        </div>
        <span className="hidden text-xs text-[#4a5278] sm:inline">
          Fresh on page load
        </span>
      </div>
    </header>
  );
}
