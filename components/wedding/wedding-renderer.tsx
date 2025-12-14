"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { getTemplateComponent } from "@/templates/registry";
import { RenderMode } from "@/templates/types";
import { useMemo } from "react";

interface WeddingRendererProps {
    wedding: Doc<"weddings">;
    renderMode: RenderMode;
}

/**
 * Renders a wedding using the appropriate template based on wedding configuration.
 * Applies the theme palette via CSS variables.
 */
export function WeddingRenderer({ wedding, renderMode }: WeddingRendererProps) {
    const TemplateComponent = useMemo(() => {
        return getTemplateComponent(
            wedding.templateId,
            wedding.templateVersion
        );
    }, [wedding.templateId, wedding.templateVersion]);

    // Generate CSS variables from the palette
    const paletteStyles = useMemo(() => {
        const { palette } = wedding.theme;
        return {
            "--background": palette.background,
            "--foreground": palette.foreground,
            "--card": palette.card,
            "--card-foreground": palette.cardForeground,
            "--popover": palette.popover,
            "--popover-foreground": palette.popoverForeground,
            "--primary": palette.primary,
            "--primary-foreground": palette.primaryForeground,
            "--secondary": palette.secondary,
            "--secondary-foreground": palette.secondaryForeground,
            "--muted": palette.muted,
            "--muted-foreground": palette.mutedForeground,
            "--accent": palette.accent,
            "--accent-foreground": palette.accentForeground,
            "--destructive": palette.destructive,
            "--destructive-foreground": palette.destructiveForeground,
            "--border": palette.border,
            "--input": palette.input,
            "--ring": palette.ring,
        } as React.CSSProperties;
    }, [wedding.theme.palette]);

    if (!TemplateComponent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-destructive">
                        Template Error
                    </h1>
                    <p className="text-muted-foreground">
                        Template &quot;{wedding.templateId}/
                        {wedding.templateVersion}&quot; not found.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={paletteStyles} className="wedding-container">
            <TemplateComponent wedding={wedding} renderMode={renderMode} />
        </div>
    );
}
