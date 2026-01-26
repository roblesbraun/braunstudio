"use client";

import { useRef, useEffect } from "react";
import {
    motion,
    useScroll,
    useMotionValue,
    useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface StackedSectionProps {
    /**
     * Section ID for navigation anchors.
     */
    id: string;
    /**
     * Section index in the stack (0-based).
     */
    index: number;
    /**
     * Total number of sections.
     */
    totalSections: number;
    /**
     * Optional z-index for layering (later sections on top).
     */
    zIndex?: number;
    /**
     * Callback to register this section's offsetTop after mount.
     */
    onOffsetMeasured?: (index: number, offsetTop: number) => void;
    /**
     * Array of all section offsetTops (used to compute transforms).
     */
    sectionOffsets: number[];
    /**
     * Optional className for the outer section.
     */
    className?: string;
    /**
     * Section content.
     */
    children: React.ReactNode;
}

/**
 * Stacked section component using global scroll timeline.
 *
 * Mental model:
 * - Uses ONE global scroll position (scrollY)
 * - Each section measures its offsetTop after mount
 * - Section[i] transforms based on when section[i+1] enters viewport
 * - Earlier sections get "pushed back" as later sections scroll in
 * - Current and future sections remain untransformed
 */
export function StackedSection({
    id,
    index,
    totalSections,
    zIndex,
    onOffsetMeasured,
    sectionOffsets,
    className,
    children,
}: StackedSectionProps) {
    const ref = useRef<HTMLElement>(null);

    // Global scroll position
    const { scrollY } = useScroll();

    // Motion values (avoid React state updates on scroll)
    const scale = useMotionValue(1);
    const y = useMotionValue(0);

    // Measure and report this section's offsetTop after mount and on resize
    useEffect(() => {
        const measure = () => {
            if (ref.current && onOffsetMeasured) {
                // Measure in document space (accounts for overlap/negative margins)
                const rect = ref.current.getBoundingClientRect();
                const offsetTop = rect.top + window.scrollY;
                onOffsetMeasured(index, offsetTop);
            }
        };

        // Measure immediately
        measure();

        // Re-measure on resize and load (images/content might change layout)
        window.addEventListener("resize", measure);
        window.addEventListener("load", measure);

        return () => {
            window.removeEventListener("resize", measure);
            window.removeEventListener("load", measure);
        };
    }, [index, onOffsetMeasured]);

    // Compute transform range based on next section's position
    const nextSectionOffset = sectionOffsets[index + 1];
    const hasNextSection =
        index < totalSections - 1 &&
        sectionOffsets.length > 0 &&
        typeof nextSectionOffset === "number" &&
        nextSectionOffset > 0;

    // Listen to scroll and compute transforms manually
    useMotionValueEvent(scrollY, "change", (latestScrollY) => {
        if (!hasNextSection) {
            // Reset to identity if no next section or offsets not ready
            if (scale.get() !== 1) scale.set(1);
            if (y.get() !== 0) y.set(0);
            return;
        }

        // Full stacking effect: section completely slides under the next one
        // Transform starts when next section enters viewport
        // Transform completes when next section reaches the top
        const viewportHeight = window.innerHeight;
        const start = nextSectionOffset - viewportHeight;
        const end = nextSectionOffset;

        // Avoid division by zero
        if (end <= start) {
            scale.set(1);
            y.set(0);
            return;
        }

        const raw = (latestScrollY - start) / (end - start);
        const progress = Math.max(0, Math.min(1, raw));

        // Aggressive transforms for full stacking:
        // scale: 1 -> 0.85 (15% reduction - very visible)
        // y:     0 -> -80 (slide up significantly)
        scale.set(1 - progress * 0.15);
        y.set(-progress * 80);
    });

    // Calculate z-index: later sections above earlier ones
    const computedZIndex =
        typeof zIndex === "number" ? zIndex : totalSections - index;

    return (
        <motion.section
            ref={ref}
            id={id}
            // Aggressive overlap for full stacking effect
            // Each section overlaps previous by 30vh for more visible stacking
            className={cn(
                "relative scroll-mt-16",
                index === 0 ? "mt-0" : "-mt-[30vh]",
                className,
            )}
            style={{ zIndex: computedZIndex }}
        >
            <motion.div
                // Transforms apply to the card wrapper, not the section
                style={{
                    scale,
                    y,
                }}
                className="relative will-change-transform origin-top"
            >
                {children}
            </motion.div>
        </motion.section>
    );
}
