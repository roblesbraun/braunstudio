"use client";

import { AlertTriangle } from "lucide-react";

/**
 * Banner shown at the top of wedding pages in preview mode.
 */
export function PreviewBanner() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
      <AlertTriangle className="h-4 w-4" />
      <span>Preview Mode – RSVP and payments are disabled</span>
    </div>
  );
}

