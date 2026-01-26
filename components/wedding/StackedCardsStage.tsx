"use client";

import { useRef, useEffect, useState } from "react";
import {
    motion,
    useScroll,
    useMotionValue,
    useMotionValueEvent,
} from "framer-motion";

interface Card {
    id: string;
    node: React.ReactNode;
}

interface StackedCardsStageProps {
    cards: Card[];
    compressScaleTo?: number;
    compressYTo?: number;
}

/**
 * Stacked cards scroll stage with pinning.
 *
 * Mental model:
 * - ONE sticky "stack stage" that pins at the top
 * - Cards are absolutely positioned inside it, overlapping
 * - ONE global useScroll() drives all animations
 * - Cards animate based on global scroll position
 * - Older cards scale down and shift up as new cards enter
 * - Long cards reveal their content via inner translate
 */
export function StackedCardsStage({
    cards,
    compressScaleTo = 0.9,
    compressYTo = -48,
}: StackedCardsStageProps) {
    const stageWrapperRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Global scroll position
    const { scrollY } = useScroll();

    // Stage position in document (measured once, updated on resize)
    const stackTopRef = useRef(0);

    // Local scroll position relative to stage start
    const localY = useMotionValue(0);

    // Card measurements
    const [cardHeights, setCardHeights] = useState<number[]>([]);
    const [segmentHeights, setSegmentHeights] = useState<number[]>([]);
    const [segmentStarts, setSegmentStarts] = useState<number[]>([]);
    const [totalScrollHeight, setTotalScrollHeight] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);

    // Measure stage position
    useEffect(() => {
        const measureStageTop = () => {
            if (stageWrapperRef.current) {
                const rect = stageWrapperRef.current.getBoundingClientRect();
                stackTopRef.current = rect.top + window.scrollY;
            }

            // Update viewport height (use window.innerHeight for iOS Safari compatibility)
            // This accounts for the dynamic address bar on mobile browsers
            setViewportHeight(window.innerHeight);
        };

        measureStageTop();

        // Re-measure on resize and orientation change (critical for iOS)
        window.addEventListener("resize", measureStageTop);
        window.addEventListener("orientationchange", measureStageTop);

        // Initial measurement after a brief delay to ensure layout is stable
        const timer = setTimeout(measureStageTop, 100);

        return () => {
            window.removeEventListener("resize", measureStageTop);
            window.removeEventListener("orientationchange", measureStageTop);
            clearTimeout(timer);
        };
    }, []);

    // Measure card heights with ResizeObserver
    useEffect(() => {
        const observers: ResizeObserver[] = [];
        const heights: number[] = [];

        cardRefs.current.forEach((ref, index) => {
            if (ref) {
                const observer = new ResizeObserver((entries) => {
                    for (const entry of entries) {
                        heights[index] = entry.contentRect.height;

                        // Once all cards measured, compute segments
                        if (
                            heights.length === cards.length &&
                            heights.every((h) => h > 0)
                        ) {
                            setCardHeights([...heights]);
                        }
                    }
                });

                observer.observe(ref);
                observers.push(observer);
            }
        });

        return () => {
            observers.forEach((o) => o.disconnect());
        };
    }, [cards.length]);

    // Compute segment heights and positions when card heights or viewport changes
    useEffect(() => {
        if (cardHeights.length !== cards.length || viewportHeight === 0) return;

        const segments: number[] = [];
        const starts: number[] = [];
        let cumulative = 0;

        cardHeights.forEach((cardHeight, i) => {
            // Each segment is at least 1 viewport, or taller if card is taller
            const segmentHeight = Math.max(viewportHeight, cardHeight);
            segments.push(segmentHeight);
            starts.push(cumulative);
            cumulative += segmentHeight;
        });

        setSegmentHeights(segments);
        setSegmentStarts(starts);
        setTotalScrollHeight(cumulative);
    }, [cardHeights, viewportHeight, cards.length]);

    // Update local scroll position
    useMotionValueEvent(scrollY, "change", (latest) => {
        const local = latest - stackTopRef.current;
        localY.set(Math.max(0, local));
    });

    return (
        <div ref={stageWrapperRef} className="relative">
            {/* Sticky stage - pins at top (below navbar z-50) */}
            <div
                className="sticky top-0 min-h-svh overflow-hidden"
                style={{ zIndex: 1 }}
            >
                {cards.map((card, index) => (
                    <StackedCard
                        key={card.id}
                        ref={(el) => (cardRefs.current[index] = el)}
                        index={index}
                        totalCards={cards.length}
                        localY={localY}
                        segmentStarts={segmentStarts}
                        segmentHeights={segmentHeights}
                        cardHeight={cardHeights[index] || 0}
                        viewportHeight={viewportHeight}
                        compressScaleTo={compressScaleTo}
                        compressYTo={compressYTo}
                    >
                        {card.node}
                    </StackedCard>
                ))}
            </div>

            {/* Scroll spacer with anchor markers */}
            <div
                style={{ height: totalScrollHeight }}
                className="pointer-events-none"
                aria-hidden="true"
            >
                {cards.map((card, index) => (
                    <div
                        key={`anchor-${card.id}`}
                        id={card.id}
                        style={{ height: segmentHeights[index] || 0 }}
                        className="scroll-mt-16"
                    />
                ))}
            </div>
        </div>
    );
}

interface StackedCardProps {
    index: number;
    totalCards: number;
    localY: any; // MotionValue<number>
    segmentStarts: number[];
    segmentHeights: number[];
    cardHeight: number;
    viewportHeight: number;
    compressScaleTo: number;
    compressYTo: number;
    children: React.ReactNode;
}

const StackedCard = React.forwardRef<HTMLDivElement, StackedCardProps>(
    (
        {
            index,
            totalCards,
            localY,
            segmentStarts,
            segmentHeights,
            cardHeight,
            viewportHeight,
            compressScaleTo,
            compressYTo,
            children,
        },
        ref,
    ) => {
        const scale = useMotionValue(1);
        const y = useMotionValue(0);
        const contentY = useMotionValue(0);

        const start = segmentStarts[index] || 0;
        const end = start + (segmentHeights[index] || viewportHeight);

        // Compute transforms on scroll
        useMotionValueEvent(localY, "change", (local) => {
            // Compression: earlier cards compress as we scroll past them
            if (local >= start && local < end) {
                // We're in this card's range - animate from 1 to compressed
                const progress = (local - start) / viewportHeight;
                const clampedProgress = Math.max(0, Math.min(1, progress));
                scale.set(1 - (1 - compressScaleTo) * clampedProgress);
                y.set(compressYTo * clampedProgress);
            } else if (local >= end) {
                // Past this card - stay compressed
                scale.set(compressScaleTo);
                y.set(compressYTo);
            } else {
                // Before this card - not compressed
                scale.set(1);
                y.set(0);
            }

            // Content reveal for tall cards
            if (cardHeight > viewportHeight && local >= start && local < end) {
                const overflow = cardHeight - viewportHeight;
                const segmentHeight = segmentHeights[index] || viewportHeight;
                const extraScrollDistance = segmentHeight - viewportHeight;

                if (extraScrollDistance > 0) {
                    const revealProgress = Math.max(
                        0,
                        Math.min(1, (local - start) / extraScrollDistance),
                    );
                    contentY.set(-overflow * revealProgress);
                } else {
                    contentY.set(0);
                }
            } else {
                contentY.set(0);
            }
        });

        // Z-index: later cards on top
        const zIndex = 10 + index * 5;

        return (
            <motion.div
                className="absolute inset-x-0 top-0"
                style={{ scale, y, zIndex }}
            >
                <motion.div
                    ref={ref}
                    style={{ y: contentY }}
                    className="will-change-transform origin-top"
                >
                    {children}
                </motion.div>
            </motion.div>
        );
    },
);

StackedCard.displayName = "StackedCard";

// Need to import React for forwardRef
import React from "react";
