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

  // Prepare template props
  const templateProps: WeddingTemplateProps = {
    wedding: {
      _id: wedding._id,
      name: wedding.name,
      slug: wedding.slug,
      // Extract date from hero section if available
      date: (wedding.sectionContent as SectionContentMap)?.hero?.date,
      navbarLogoUrl: wedding.navbarLogoUrl,
    },
    theme: wedding.theme as WeddingTheme,
    sections: {
      enabled: wedding.enabledSections as SectionKey[],
      content: wedding.sectionContent as SectionContentMap,
    },
    isPreview,
  };

  return (
    <WeddingThemeWrapper theme={templateProps.theme}>
      {isPreview && <PreviewBanner />}
      <WeddingNavbar
        weddingName={wedding.name}
        navbarLogoUrl={wedding.navbarLogoUrl}
        isPreview={isPreview}
      />
      <TemplateComponent {...templateProps} />
    </WeddingThemeWrapper>
  );
}

