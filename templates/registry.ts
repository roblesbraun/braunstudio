import { TemplateMetadata, WeddingTemplateComponent } from "./types";

/**
 * Registry of all available templates.
 * Templates are code-based React components, not CMS layouts.
 * Each template version is immutable once released.
 */

// Lazy-load templates to avoid bundling all templates on every page
type TemplateLoader = () => Promise<{ default: WeddingTemplateComponent }>;

interface TemplateRegistry {
  [templateId: string]: {
    metadata: TemplateMetadata;
    versions: {
      [version: string]: TemplateLoader;
    };
  };
}

/**
 * Template registry with all available templates and versions.
 * 
 * Folder structure:
 *   /templates/{templateId}/{version}/Template.tsx
 * 
 * To add a new template:
 * 1. Create folder: /templates/{templateId}/{version}/
 * 2. Create Template.tsx implementing WeddingTemplateProps
 * 3. Add entry to this registry
 * 
 * To add a new version:
 * 1. Copy existing version folder to new version
 * 2. Make changes (original is immutable)
 * 3. Add version to registry
 */
export const templateRegistry: TemplateRegistry = {
  classic: {
    metadata: {
      id: "classic",
      name: "Classic Elegance",
      description:
        "A timeless, elegant design with clean typography and subtle animations.",
      versions: ["v1"],
    },
    versions: {
      v1: () => import("./classic/v1/Template"),
    },
  },
};

/**
 * Get a template component by ID and version.
 * Returns null if template or version doesn't exist.
 */
export async function getTemplate(
  templateId: string,
  version: string
): Promise<WeddingTemplateComponent | null> {
  const template = templateRegistry[templateId];
  if (!template) {
    console.error(`Template not found: ${templateId}`);
    return null;
  }

  const loader = template.versions[version];
  if (!loader) {
    console.error(`Template version not found: ${templateId}@${version}`);
    return null;
  }

  try {
    const module = await loader();
    return module.default;
  } catch (error) {
    console.error(`Failed to load template: ${templateId}@${version}`, error);
    return null;
  }
}

/**
 * Get metadata for all available templates.
 */
export function getTemplateList(): TemplateMetadata[] {
  return Object.values(templateRegistry).map((t) => t.metadata);
}

/**
 * Get metadata for a specific template.
 */
export function getTemplateMetadata(
  templateId: string
): TemplateMetadata | null {
  return templateRegistry[templateId]?.metadata ?? null;
}

/**
 * Check if a template and version combination is valid.
 */
export function isValidTemplate(templateId: string, version: string): boolean {
  return !!templateRegistry[templateId]?.versions[version];
}

/**
 * Get the latest version for a template.
 */
export function getLatestVersion(templateId: string): string | null {
  const template = templateRegistry[templateId];
  if (!template) return null;
  
  const versions = template.metadata.versions;
  return versions[versions.length - 1] ?? null;
}

