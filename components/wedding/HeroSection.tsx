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
    children,
}: HeroSectionProps) {
    return (
        <section
            className={cn(
                "relative flex min-h-svh items-center justify-center overflow-hidden",
                className,
            )}
        >
            {/* Frame: contains background, overlays, and center content */}
            <div
                className={cn(
                    frameClassName ? "relative" : "absolute inset-0",
                    "flex items-center justify-center overflow-hidden",
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

                {/* Metadata Overlays */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Top-left: Wedding Date */}
                    {weddingDate && (
                        <div className="absolute top-20 left-6 md:top-24 md:left-10">
                            <p className="text-xs md:text-sm font-medium tracking-wide text-foreground/80">
                                {weddingDate}
                            </p>
                        </div>
                    )}

                    {/* Top-right: Decorative dash */}
                    {showTopRightDash && (
                        <div className="absolute top-20 right-6 md:top-24 md:right-10">
                            <div className="h-px w-10 bg-foreground/60" />
                        </div>
                    )}

                    {/* Bottom-left: Venue Name */}
                    {venueName && (
                        <div className="absolute bottom-24 left-6 md:bottom-32 md:left-10">
                            <p className="text-xs md:text-sm font-medium text-foreground/80">
                                {venueName}
                            </p>
                        </div>
                    )}

                    {/* Bottom-right: Venue Location */}
                    {venueLocation && (
                        <div className="absolute bottom-24 right-6 md:bottom-32 md:right-10">
                            <p className="text-xs md:text-sm font-medium text-foreground/80">
                                {venueLocation}
                            </p>
                        </div>
                    )}
                </div>

                {/* Center Content (template-specific: title/subtitle/etc) */}
                <div className="relative z-20 pointer-events-auto">
                    {children}
                </div>
            </div>
        </section>
    );
}
