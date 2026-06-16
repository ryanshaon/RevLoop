import { Activity, ArrowLeft, LayoutDashboard } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "Page Not Found | RevLoop",
  },
  description:
    "The requested RevLoop route could not be found. Return to the landing page or product dashboard.",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#05070f] px-6 text-[#eef2ff]">
      {/* Background bloom */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(79,110,247,0.12)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {/* Logo */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f6ef7] to-[#a78bfa] shadow-[0_0_32px_rgba(79,110,247,0.40)]">
          <Activity
            className="h-7 w-7 text-white"
            strokeWidth={2.5}
            aria-hidden
          />
        </div>

        {/* 404 number */}
        <p className="mt-8 bg-gradient-to-r from-[#4f6ef7] to-[#a78bfa] bg-clip-text text-8xl font-black tracking-tight text-transparent">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#eef2ff]">
          Page not found
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#8892b0]">
          The route you&apos;re looking for doesn&apos;t exist. Head back to the
          dashboard or the landing page.
        </p>

        {/* Navigation links */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-[#4f6ef7] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_rgba(79,110,247,0.35)] transition-all hover:bg-[#6b8aff] hover:shadow-[0_0_24px_rgba(79,110,247,0.50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-[#1c2035] bg-[#0c0f1d] px-5 py-2.5 text-sm font-semibold text-[#8892b0] transition-colors hover:border-[#4f6ef7]/30 hover:text-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/60"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
