import Link from "next/link";
import { Activity, Github } from "lucide-react";

export function LandingFooter() {
  return (
    <footer
      className="border-t border-[#1c2035] bg-[#0c0f1d]"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="mb-3 flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f6ef7] to-[#a78bfa]">
                <Activity
                  className="h-3.5 w-3.5 text-white"
                  strokeWidth={2.75}
                  aria-hidden
                />
              </div>
              <span className="bg-gradient-to-r from-[#4f6ef7] to-[#a78bfa] bg-clip-text text-lg font-black text-transparent">
                RevLoop
              </span>
            </Link>
            <p className="max-w-xs text-xs text-[#4a5278]">
              Product analytics for early-stage teams. Funnels, retention, ML
              churn risk, and experiments in one decision layer.
            </p>
          </div>

          {/* Nav + credits */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-col gap-3 sm:items-end"
          >
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a
                href="#features"
                className="rounded text-xs text-[#8892b0] transition-colors hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="rounded text-xs text-[#8892b0] transition-colors hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
              >
                How It Works
              </a>
              <Link
                href="/dashboard"
                className="rounded text-xs text-[#8892b0] transition-colors hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
              >
                Live Demo
              </Link>
              <a
                href="https://github.com/ryanshaon/RevLoop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RevLoop on GitHub"
                className="flex items-center gap-1 rounded text-xs text-[#8892b0] transition-colors hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
              >
                <Github className="h-3.5 w-3.5" aria-hidden />
                GitHub
              </a>
            </div>
            <p className="text-[10px] text-[#4a5278]">
              Built by Ryan &middot; Portfolio project - not a commercial
              product &middot; &copy; {2026}
            </p>
          </nav>
        </div>
      </div>
    </footer>
  );
}
