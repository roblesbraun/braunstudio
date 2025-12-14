import { Doc } from "@/convex/_generated/dataModel";

export type RenderMode = "public" | "preview";

export interface WeddingTemplateProps {
    wedding: Doc<"weddings">;
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
