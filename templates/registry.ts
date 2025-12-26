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

// Get template component by ID and version (throws if invalid)
export function getTemplate(
    templateId: string,
    templateVersion: string
): TemplateComponent {
    const template = templateRegistry[templateId];
    if (!template) {
        throw new Error(
            `Template "${templateId}" not found in registry. Available templates: ${Object.keys(templateRegistry).join(", ")}`
        );
    }

    const versionedComponent = template.versions[templateVersion];
    if (!versionedComponent) {
        throw new Error(
            `Template "${templateId}" version "${templateVersion}" not found. Available versions: ${Object.keys(template.versions).join(", ")}`
        );
    }

    return versionedComponent;
}

// Get the latest version for a template
export function getLatestTemplateVersion(templateId: string): string {
    const template = templateRegistry[templateId];
    if (!template) {
        throw new Error(
            `Template "${templateId}" not found in registry. Available templates: ${Object.keys(templateRegistry).join(", ")}`
        );
    }

    const versions = Object.keys(template.versions);
    if (versions.length === 0) {
        throw new Error(`Template "${templateId}" has no versions available`);
    }

    // Sort versions (v1, v2, v3, etc.) and return the highest
    // This assumes version strings follow semantic versioning or simple vN pattern
    const sortedVersions = versions.sort((a, b) => {
        // Extract numeric part if it exists (e.g., "v1" -> 1, "v2" -> 2)
        const aNum = parseInt(a.replace(/^v/i, "")) || 0;
        const bNum = parseInt(b.replace(/^v/i, "")) || 0;
        return bNum - aNum; // Descending order
    });

    return sortedVersions[0];
}
