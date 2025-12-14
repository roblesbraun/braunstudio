import { TemplateComponent, TemplateRegistryEntry } from "./types";
import ClassicV1 from "./classic/v1/Template";
import ModernV1 from "./modern/v1/Template";

// Template registry - maps templateId -> versions -> component
export const templateRegistry: Record<string, TemplateRegistryEntry> = {
    classic: {
        id: "classic",
        name: "Classic",
        versions: {
            v1: ClassicV1,
        },
    },
    modern: {
        id: "modern",
        name: "Modern",
        versions: {
            v1: ModernV1,
        },
    },
};

// Get template component by ID and version
export function getTemplateComponent(
    templateId: string,
    templateVersion: string
): TemplateComponent | null {
    const template = templateRegistry[templateId];
    if (!template) return null;

    const versionedComponent = template.versions[templateVersion];
    if (!versionedComponent) return null;

    return versionedComponent;
}

// Get available templates (for admin UI)
export function getAvailableTemplates(): Array<{
    id: string;
    name: string;
    versions: string[];
}> {
    return Object.values(templateRegistry).map((entry) => ({
        id: entry.id,
        name: entry.name,
        versions: Object.keys(entry.versions),
    }));
}

// Check if a template/version combination is valid
export function isValidTemplate(
    templateId: string,
    templateVersion: string
): boolean {
    return getTemplateComponent(templateId, templateVersion) !== null;
}
