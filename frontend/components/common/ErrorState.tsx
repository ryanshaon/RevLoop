"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Centered failure card with a retry action. */
export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#f43f5e]/40 bg-[#0c0f1d] p-8 text-center shadow-[0_0_44px_rgba(244,63,94,0.10)]">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#f43f5e]/40 bg-[#f43f5e]/10">
          <AlertCircle className="h-6 w-6 text-[#f43f5e]" />
        </div>
        <h3 className="mb-2 text-[15px] font-semibold text-[#eef2ff]">
          Could not load data
        </h3>
        <p className="text-sm text-[#8892b0]">
          Make sure the backend is running on port 8000.
        </p>
        {message ? (
          <p className="mt-2 break-words font-mono text-xs text-[#4a5278]">
            {message}
          </p>
        ) : null}
        <div className="mt-6 flex justify-center">
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
