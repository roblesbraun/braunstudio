import { Doc } from "@/convex/_generated/dataModel";

export type RenderMode = "public" | "preview";

// Shared sections configuration type matching Convex schema
export interface SectionsConfig {
    hero: {
        enabled: boolean;
        title?: string;
        subtitle?: string;
        date?: string;
        imageUrl?: string;
    };
    location: {
        enabled: boolean;
        venueName?: string;
        address?: string;
        mapUrl?: string;
        notes?: string;
    };
    lodging: {
        enabled: boolean;
        hotels?: Array<{
            name: string;
            address?: string;
            url?: string;
            notes?: string;
        }>;
    };
    gifts: {
        enabled: boolean;
        message?: string;
        externalUrl?: string;
    };
    dressCode: {
        enabled: boolean;
        code?: string;
        description?: string;
    };
    rsvp: {
        enabled: boolean;
        deadline?: string;
        message?: string;
    };
    itinerary: {
        enabled: boolean;
        events?: Array<{
            time: string;
            title: string;
            description?: string;
        }>;
    };
}

// Theme configuration matching Convex schema
export interface ThemeConfig {
    palette: {
        background: string;
        foreground: string;
        card: string;
        cardForeground: string;
        popover: string;
        popoverForeground: string;
        primary: string;
        primaryForeground: string;
        secondary: string;
        secondaryForeground: string;
        muted: string;
        mutedForeground: string;
        accent: string;
        accentForeground: string;
        destructive: string;
        destructiveForeground: string;
        border: string;
        input: string;
        ring: string;
    };
    fontFamily?: string;
}

// View-model for templates - decoupled from Convex doc structure
export interface WeddingTemplateViewModel {
    name: string;
    subdomain: string;
    date?: string;
}

// Template props contract - all templates must accept this shape
export interface WeddingTemplateProps {
    wedding: WeddingTemplateViewModel;
    theme: ThemeConfig;
    sections: SectionsConfig;
    renderMode: RenderMode;
}

export interface TemplateComponent {
    (props: WeddingTemplateProps): React.ReactNode;
}

export interface TemplateRegistryEntry {
    id: string;
    name: string;
    versions: {
        [version: string]: TemplateComponent;
    };
}
