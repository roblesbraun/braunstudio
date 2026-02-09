"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
    heroImageUrl?: string;
    weddingDate?: string;
    venueName?: string;
    venueLocation?: string;
    /**
     * Optional className for the outer section element.
     */
    className?: string;
    /**
     * Optional className for the internal "frame" that contains the background,
     * overlays, and center content. If omitted, the frame is full-bleed.
     *
     * Templates can use this to create a rounded, inset hero without baking
     * that styling into the shared component.
     */
    frameClassName?: string;
    /**
     * Shows a small decorative dash at the top-right (as in the classic mock).
     */
    showTopRightDash?: boolean;
    /**
     * Element type to render as (section or div). Defaults to "section".
     * Use "div" when wrapping with a motion.section in templates.
     */
    as?: "section" | "div";
    children?: ReactNode;
}

/**
 * Reusable hero section component with full-bleed background image
 * and positioned metadata overlays.
 *
 * Displays:
 * - Top-left: wedding date
 * - Bottom-left: venue name
 * - Bottom-right: venue location
 * - Center: children (for template-specific content like title/CTA)
 */
export function HeroSection({
    heroImageUrl,
    weddingDate,
    venueName,
    venueLocation,
    className,
    frameClassName,
    showTopRightDash = false,
    as: Component = "section",
    children,
}: HeroSectionProps) {
    return (
        <Component
            className={cn(
                "relative flex min-h-svh items-center justify-center overflow-hidden",
                className,
            )}
        >
            {/* Frame: contains background, overlays, and center content */}
            <div
                className={cn(
                    frameClassName ? "relative" : "absolute inset-0",
                    "overflow-hidden",
                    frameClassName,
                )}
            >
                {/* Background Image */}
                {heroImageUrl && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={heroImageUrl}
                            alt="Wedding hero background"
                            className="h-full w-full object-cover"
                        />
                        {/* Theme-adaptive overlay for readability (light: paper wash, dark: darker wash) */}
                        <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/35 to-background/70 dark:from-background/55 dark:via-background/25 dark:to-background/55" />
                    </div>
                )}

                {/* Fallback gradient background if no image */}
                {!heroImageUrl && (
                    <div className="absolute inset-0 z-0 bg-linear-to-b from-background to-muted/20" />
                )}

                {/* Foreground layout (flex; no absolute positioning for metadata) */}
                <div className="relative z-10 min-h-svh flex flex-col justify-between px-6 md:px-10 pt-20 md:pt-24 pb-24 md:pb-32">
                    {/* Top row: Wedding Date + Decorative dash */}
                    <div className="pointer-events-none flex items-start justify-between gap-6">
                        <div className="min-w-0">
                            {weddingDate && (
                                <p className="text-xs md:text-sm font-medium tracking-wide text-foreground/80">
                                    {weddingDate}
                                </p>
                            )}
                        </div>

                        {showTopRightDash && (
                            <div className="shrink-0">
                                <div className="mt-2 h-px w-10 bg-foreground/60" />
                            </div>
                        )}
                    </div>

                    {/* Center Content (template-specific: title/subtitle/etc) */}
                    <div className="pointer-events-auto flex-1 flex items-center justify-center">
                        <div className="w-full">{children}</div>
                    </div>

                    {/* Bottom row: Venue Name + Venue Location */}
                    {(venueName || venueLocation) && (
                        <div className="pointer-events-none flex items-end justify-between gap-6">
                            <div className="min-w-0">
                                {venueName && (
                                    <p className="text-xs md:text-sm font-medium text-foreground/80">
                                        {venueName}
                                    </p>
                                )}
                            </div>
                            <div className="min-w-0 text-right">
                                {venueLocation && (
                                    <p className="text-xs md:text-sm font-medium text-foreground/80">
                                        {venueLocation}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Component>
    );
}
