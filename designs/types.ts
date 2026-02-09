import { Id } from "@/convex/_generated/dataModel";
import { ComponentType } from "react";

export interface WeddingDesignData {
  _id: Id<"weddings">;
  name: string;
  slug: string;
  weddingDate?: string;
  venueName?: string;
  venueLocation?: string;
  navbarLogoLightUrl?: string;
  navbarLogoDarkUrl?: string;
  heroImageUrl?: string;
}

export interface WeddingFeatureFlags {
  rsvp: boolean;
  gifts: boolean;
  whatsapp: boolean;
}

export interface MediaItem {
  _id: Id<"mediaItems">;
  storageId: string;
  mediaType: "image" | "video" | "audio";
  order: number;
  tags: string[];
  metadata: {
    alt?: string;
    caption?: string;
    durationSeconds?: number;
  };
  url?: string;
}

export interface RsvpConfig {
  questions: Array<{
    id: string;
    order: number;
    prompt: string;
    options: Array<{
      id: string;
      order: number;
      label: string;
    }>;
  }>;
}

export interface GiftOption {
  _id: Id<"giftOptions">;
  label: string;
  amountCents: number;
  order: number;
  active: boolean;
}

export interface WeddingDesignProps {
  wedding: WeddingDesignData;
  features: WeddingFeatureFlags;
  media: MediaItem[];
  rsvpConfig: RsvpConfig | null;
  giftOptions: GiftOption[];
  isPreview?: boolean;
}

export type WeddingDesignComponent = ComponentType<WeddingDesignProps>;

export interface DesignMetadata {
  id: string;
  name: string;
  description: string;
}
