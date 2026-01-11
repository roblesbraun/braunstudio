import { Id } from "@/convex/_generated/dataModel";

/**
 * Theme colors that can be customized per wedding.
 * These map to shadcn CSS variables.
 */
export interface ThemeColors {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
  destructive?: string;
  border?: string;
  input?: string;
  ring?: string;
}

/**
 * Wedding theme with light and dark mode colors.
 */
export interface WeddingTheme {
  light: ThemeColors;
  dark: ThemeColors;
}

/**
 * Section content types for each mandatory section.
 */
export interface HeroContent {
  title?: string;
  subtitle?: string;
  date?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface ItineraryItem {
  time: string;
  title: string;
  description?: string;
  location?: string;
}

export interface ItineraryContent {
  title?: string;
  items: ItineraryItem[];
}

export interface PhotosContent {
  title?: string;
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
}

export interface LocationContent {
  title?: string;
  venueName: string;
  address: string;
  mapUrl?: string;
  directions?: string;
}

export interface LodgingItem {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  notes?: string;
}

export interface LodgingContent {
  title?: string;
  items: LodgingItem[];
}

export interface DressCodeContent {
  title?: string;
  description: string;
  examples?: string[];
}

export interface GiftItem {
  id: string;
  name: string;
  description?: string;
  priceInCents: number;
  imageUrl?: string;
  externalUrl?: string; // For wishlist mode
}

export interface GiftsContent {
  title?: string;
  description?: string;
  mode: "wishlist" | "gifts";
  wishlistUrl?: string; // For external wishlist
  items?: GiftItem[]; // For internal gifts
}

export interface RsvpContent {
  title?: string;
  description?: string;
  deadline?: string;
}

/**
 * All section content types mapped by section key.
 */
export interface SectionContentMap {
  hero?: HeroContent;
  itinerary?: ItineraryContent;
  photos?: PhotosContent;
  location?: LocationContent;
  lodging?: LodgingContent;
  dressCode?: DressCodeContent;
  gifts?: GiftsContent;
  rsvp?: RsvpContent;
}

/**
 * Section keys for enabled sections.
 */
export type SectionKey = keyof SectionContentMap;

/**
 * Navigation item derived from wedding sections.
 */
export interface NavItem {
  key: SectionKey;
  label: string;
  href: string;
}

/**
 * All mandatory sections that templates must support.
 */
export const MANDATORY_SECTIONS: SectionKey[] = [
  "hero",
  "itinerary",
  "photos",
  "location",
  "lodging",
  "dressCode",
  "gifts",
  "rsvp",
];

/**
 * Wedding data passed to templates.
 */
export interface WeddingData {
  _id: Id<"weddings">;
  name: string;
  slug: string;
  date?: string;
  navbarLogoLightUrl?: string;
  navbarLogoDarkUrl?: string;
}

/**
 * Props contract for all wedding templates.
 * All templates receive the same props shape.
 */
export interface WeddingTemplateProps {
  wedding: WeddingData;
  theme: WeddingTheme;
  sections: {
    enabled: SectionKey[];
    content: SectionContentMap;
  };
  /**
   * Preview mode disables interactive features (RSVP, payments).
   */
  isPreview?: boolean;
}

/**
 * Template component type.
 */
export type WeddingTemplateComponent = React.ComponentType<WeddingTemplateProps>;

/**
 * Template metadata for registry.
 */
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  versions: string[];
}

