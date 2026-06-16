"use client";

import { Activity, Github, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Demo", href: "#demo" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[#1c2035] bg-[#05070f]/90 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f6ef7] to-[#a78bfa] shadow-[0_0_18px_rgba(79,110,247,0.45)]">
            <Activity
              className="h-4 w-4 text-white"
              strokeWidth={2.75}
              aria-hidden
            />
          </div>
          <span className="bg-gradient-to-r from-[#4f6ef7] to-[#a78bfa] bg-clip-text text-xl font-black tracking-tight text-transparent">
            RevLoop
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded text-sm font-medium text-[#8892b0] transition-colors hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="https://github.com/ryanshaon/RevLoop"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View RevLoop on GitHub"
            className="flex items-center justify-center rounded-lg p-2 text-[#8892b0] transition-colors hover:bg-[#111527] hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
          >
            <Github className="h-5 w-5" aria-hidden />
          </a>
          <Link
            href="/dashboard"
            className="rounded-lg bg-[#4f6ef7] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_16px_rgba(79,110,247,0.35)] transition-all hover:bg-[#6b84f9] hover:shadow-[0_0_24px_rgba(79,110,247,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
          >
            View Live Demo
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-[#8892b0] transition-colors hover:bg-[#111527] hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-nav-menu"
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-nav-menu"
          className="border-t border-[#1c2035] bg-[#05070f]/95 px-4 pb-4 pt-2 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#8892b0] transition-colors hover:bg-[#111527] hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[#1c2035] pt-3">
              <a
                href="https://github.com/ryanshaon/RevLoop"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#8892b0] transition-colors hover:bg-[#111527] hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
              >
                <Github className="h-4 w-4" aria-hidden />
                GitHub
              </a>
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="rounded-lg bg-[#4f6ef7] px-4 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-[#6b84f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
              >
                View Live Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
