"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getTemplate } from "@/templates/registry";
import {
  WeddingTemplateProps,
  SectionContentMap,
  SectionKey,
  WeddingTheme,
} from "@/templates/types";
import { WeddingThemeWrapper } from "./WeddingThemeWrapper";
import { PreviewBanner } from "./PreviewBanner";
import { WeddingNavbar } from "./WeddingNavbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface WeddingRendererProps {
  slug: string;
  isPreview?: boolean;
}

/**
 * Shared wedding renderer component.
 * Used by both /w/[slug] (subdomain) and /preview/[slug] routes.
 * 
 * Responsibilities:
 * - Load wedding data via Convex
 * - Apply per-wedding CSS variable overrides
 * - Render selected template version from registry
 * - In preview mode: show banner, disable RSVP/payments
 */
export function WeddingRenderer({ slug, isPreview = false }: WeddingRendererProps) {
  const wedding = useQuery(api.weddings.getBySlug, { slug });
  const [TemplateComponent, setTemplateComponent] =
    useState<React.ComponentType<WeddingTemplateProps> | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);

  // Load template when wedding data is available
  useEffect(() => {
    if (!wedding) return;

    async function loadTemplate() {
      const template = await getTemplate(
        wedding!.templateId,
        wedding!.templateVersion
      );
      if (template) {
        setTemplateComponent(() => template);
      } else {
        setTemplateError(
          `Template not found: ${wedding!.templateId}@${wedding!.templateVersion}`
        );
      }
    }

    loadTemplate();
  }, [wedding?.templateId, wedding?.templateVersion]);

  // Loading state
  if (wedding === undefined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  // Wedding not found
  if (wedding === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-semibold">Wedding Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The wedding you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
      </div>
    );
  }

  // Check if wedding is accessible (not draft in production)
  if (!isPreview && wedding.status === "draft") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-semibold">Coming Soon</h1>
        <p className="mt-2 text-muted-foreground">
          This wedding page is not yet published.
        </p>
      </div>
    );
  }

  // Template loading/error
  if (templateError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-semibold text-destructive">
          Template Error
        </h1>
        <p className="mt-2 text-muted-foreground">{templateError}</p>
      </div>
    );
  }

  if (!TemplateComponent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  // Helper to format yyyy-MM-dd to "Month DD, YYYY"
  const formatWeddingDate = (dateString: string): string => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const [year, month, day] = dateString.split("-");
    const monthName = months[parseInt(month, 10) - 1];
    return `${monthName} ${parseInt(day, 10)}, ${year}`;
  };

  // Prepare template props
  const templateProps: WeddingTemplateProps = {
    wedding: {
      _id: wedding._id,
      name: wedding.name,
      slug: wedding.slug,
      // Use canonical weddingDate field, formatted for display
      date: wedding.weddingDate ? formatWeddingDate(wedding.weddingDate) : undefined,
      // Pass canonical yyyy-MM-dd format for countdown computation
      weddingDate: wedding.weddingDate,
      navbarLogoLightUrl: wedding.navbarLogoLightUrl,
      navbarLogoDarkUrl: wedding.navbarLogoDarkUrl,
      heroImageUrl: wedding.heroImageUrl,
      venueName: wedding.venueName,
      venueLocation: wedding.venueLocation,
    },
    theme: wedding.theme as WeddingTheme,
    sections: {
      enabled: wedding.enabledSections as SectionKey[],
      content: wedding.sectionContent as SectionContentMap,
    },
    isPreview,
  };

  // Derive navigation items from enabled sections
  // Labels come from section content titles with sensible fallbacks
  const sectionLabelDefaults: Record<SectionKey, string> = {
    hero: "Home",
    countdown: "Countdown",
    itinerary: "Itinerary",
    photos: "Photos",
    location: "Location",
    lodging: "Lodging",
    dressCode: "Dress Code",
    gifts: "Gifts",
    rsvp: "RSVP",
  };

  // Define the desired navbar order (excluding hero, countdown, and photos)
  const navbarOrder: SectionKey[] = [
    "itinerary",
    "location",
    "lodging",
    "dressCode",
    "gifts",
    "rsvp",
  ];

  // Build nav items in the specified order, only including enabled sections
  const enabledSet = new Set(templateProps.sections.enabled);
  const navItems = navbarOrder
    .filter((key) => enabledSet.has(key))
    .map((key) => {
      const sectionContent = templateProps.sections.content[key];
      const title = sectionContent && 'title' in sectionContent ? sectionContent.title : undefined;
      return {
        key,
        label: title || sectionLabelDefaults[key],
        href: `#${key}`,
      };
    });

  return (
    <WeddingThemeWrapper theme={templateProps.theme}>
      {isPreview && <PreviewBanner />}
      <WeddingNavbar
        weddingName={wedding.name}
        navbarLogoLightUrl={wedding.navbarLogoLightUrl}
        navbarLogoDarkUrl={wedding.navbarLogoDarkUrl}
        isPreview={isPreview}
        navItems={navItems}
      />
      <TemplateComponent {...templateProps} />
    </WeddingThemeWrapper>
  );
}

