import { DesignMetadata, WeddingDesignComponent } from "./types";

type DesignLoader = () => Promise<{ default: WeddingDesignComponent }>;

interface DesignRegistry {
  [designId: string]: {
    metadata: DesignMetadata;
    loader: DesignLoader;
  };
}

export const designRegistry: DesignRegistry = {
  basic: {
    metadata: {
      id: "basic",
      name: "Basic Showcase",
      description: "Minimal layout for testing the shared platform data.",
    },
    loader: () => import("./basic/Design"),
  },
};

export async function getDesign(
  designId: string
): Promise<WeddingDesignComponent | null> {
  const entry = designRegistry[designId];
  if (!entry) {
    console.error(`Design not found: ${designId}`);
    return null;
  }

  try {
    const module = await entry.loader();
    return module.default;
  } catch (error) {
    console.error(`Failed to load design: ${designId}`, error);
    return null;
  }
}

export function getDesignList(): DesignMetadata[] {
  return Object.values(designRegistry).map((d) => d.metadata);
}
