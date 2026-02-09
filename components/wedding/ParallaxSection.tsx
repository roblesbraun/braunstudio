"use client";

import { useRef, ReactNode, useEffect, useState } from "react";
import {
    motion,
    useScroll,
    useTransform,
    MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
    /**
     * Section ID for navigation anchors (e.g., "hero", "itinerary", "rsvp").
     */
    id: string;
    /**
     * Section content.
     */
    children: ReactNode;
    /**
     * Optional className for the outer section element.
     */
    className?: string;
    /**
     * Optional className for the inner motion wrapper.
     */
    motionClassName?: string;
    /**
     * Parallax distance in pixels. Defaults to 150.
     * The content will move from +distance to -distance as the section scrolls through viewport.
     */
    distance?: number;
}

/**
 * Reusable parallax section component using Motion.
 *
 * Behavior:
 * - Section container remains in normal document flow (no transforms)
 * - Inner content wrapper moves subtly with parallax effect
 * - Uses per-section viewport-relative scroll tracking
 * - Opacity fades slightly at entry/exit for premium feel
 *
 * Usage:
 * ```tsx
 * <ParallaxSection id="rsvp">
 *   <RsvpContent />
 * </ParallaxSection>
 * ```
 */
export function ParallaxSection({
    id,
    children,
    className,
    motionClassName,
    distance = 150,
}: ParallaxSectionProps) {
    const ref = useRef(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // Track scroll progress relative to viewport
    // Following the exact pattern from Motion docs
    const { scrollYProgress } = useScroll({ target: ref });

    // Map scroll progress to parallax motion (disabled if user prefers reduced motion)
    // Content moves from +distance (below) to -distance (above)
    const y = useTransform(
        scrollYProgress,
        [0, 1],
        prefersReducedMotion ? [0, 0] : [-distance, distance],
    );

    return (
        <section
            id={id}
            className={cn(
                "relative min-h-screen flex items-center justify-center overflow-visible scroll-mt-16",
                className,
            )}
        >
            <div ref={ref} className="w-full">
                <motion.div
                    style={{ y }}
                    className={cn(
                        "relative w-full",
                        motionClassName,
                    )}
                >
                    {children}
                </motion.div>
            </div>
        </section>
    );
}
