"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { getTemplateComponent } from "@/templates/registry";
import {
    RenderMode,
    WeddingTemplateProps,
    WeddingTemplateViewModel,
} from "@/templates/types";
import { useMemo } from "react";

interface WeddingRendererProps {
    wedding: Doc<"weddings">;
    renderMode: RenderMode;
}

/**
 * Adapts a Convex wedding document to the template view-model format.
 */
function adaptWeddingToViewModel(
    wedding: Doc<"weddings">
): WeddingTemplateViewModel {
    // Derive name from partner names with fallback
    const name =
        wedding.partner1Name && wedding.partner2Name
            ? `${wedding.partner1Name} & ${wedding.partner2Name}`
            : wedding.partner1Name ||
              wedding.partner2Name ||
              "Our Wedding";

    // Map slug to subdomain (they're the same in this implementation)
    const subdomain = wedding.slug;

    return {
        name,
        subdomain,
        date: wedding.weddingDate,
    };
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

    // Adapt Convex doc to template view-model
    const templateProps = useMemo((): WeddingTemplateProps => {
        return {
            wedding: adaptWeddingToViewModel(wedding),
            theme: wedding.theme,
            sections: wedding.sections,
            renderMode,
        };
    }, [wedding, renderMode]);

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
            <TemplateComponent {...templateProps} />
        </div>
    );
}
