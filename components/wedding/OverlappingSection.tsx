"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OverlappingSectionProps {
    /**
     * Section ID for navigation anchors (e.g., "hero", "itinerary", "rsvp").
     */
    id: string;
    /**
     * Section index in the list (0-based).
     * Used to determine overlap: index > 0 applies negative margin.
     */
    index: number;
    /**
     * Section content.
     */
    children: React.ReactNode;
    /**
     * Optional className for one-off styling adjustments.
     */
    className?: string;
}

/**
 * Reusable overlapping section component with subtle entrance animation.
 *
 * Behavior:
 * - Sections remain in normal document flow (no sticky, no scroll math)
 * - Overlap is achieved via negative top margin (layout-based, not transforms)
 * - Each section has a solid background, rounded top corners, and subtle depth
 * - Motion is used only for entrance animation (fade + slight upward motion)
 *
 * Usage:
 * ```tsx
 * {sections.map((section, index) => (
 *   <OverlappingSection key={section.id} id={section.id} index={index}>
 *     <SectionContent />
 *   </OverlappingSection>
 * ))}
 * ```
 */
export function OverlappingSection({
    id,
    index,
    children,
    className,
}: OverlappingSectionProps) {
    // Overlap only applies after the first section
    // Using -mt-20 (80px) for visible overlap effect
    const overlap = index > 0 ? "-mt-20" : "mt-0";
    // Add consistent bottom padding for overlap spacing.
    // Use half padding on the hero (first) section.
    const bottomPad = index === 0 ? "pb-10" : "pb-20";

    return (
        <motion.section
            id={id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
                "relative scroll-mt-16",
                overlap,
                bottomPad,
                "bg-card rounded-t-[3rem] shadow-sm ring-1 ring-border/20",
                className,
            )}
        >
            {children}
        </motion.section>
    );
}
