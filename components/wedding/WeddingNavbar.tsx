"use client";

import { useState } from "react";

interface WeddingNavbarProps {
  weddingName: string;
  navbarLogoUrl?: string;
  isPreview?: boolean;
}

/**
 * Shared wedding navbar component.
 * Renders across all templates with logo/text fallback.
 * 
 * Behavior:
 * - If navbarLogoUrl exists and loads: show logo
 * - If missing or fails to load: show wedding name text
 * - In preview mode: offset from top to account for PreviewBanner
 */
export function WeddingNavbar({
  weddingName,
  navbarLogoUrl,
  isPreview = false,
}: WeddingNavbarProps) {
  const [imageError, setImageError] = useState(false);
  const showLogo = navbarLogoUrl && !imageError;

  return (
    <header
      className={`sticky ${isPreview ? "top-10" : "top-0"} z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60`}
    >
      <div className="container flex h-16 items-center justify-center px-4">
        {showLogo ? (
          <img
            src={navbarLogoUrl}
            alt={weddingName}
            onError={() => setImageError(true)}
            className="h-10 max-w-[200px] object-contain sm:max-w-[300px]"
          />
        ) : (
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {weddingName}
          </h1>
        )}
      </div>
    </header>
  );
}
