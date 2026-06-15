import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RevLoop — Mission Control",
  description:
    "AI-powered revenue and retention cockpit for early-stage startups. See what's broken and what to do next.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <div className="relative min-h-screen">
          {/* Signature radial bloom */}
          <div
            className="page-bloom pointer-events-none fixed inset-0 z-0"
            aria-hidden
          />

          <Sidebar />

          <div className="relative z-10 flex min-h-screen flex-col pb-20 md:ml-60 md:pb-0">
            <TopBar />
            <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
