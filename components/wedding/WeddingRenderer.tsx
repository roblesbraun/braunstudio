"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getDesign } from "@/designs/registry";
import { WeddingDesignProps } from "@/designs/types";
import { PreviewBanner } from "./PreviewBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo, useState } from "react";

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
  const [DesignComponent, setDesignComponent] =
    useState<React.ComponentType<WeddingDesignProps> | null>(null);
  const [designError, setDesignError] = useState<string | null>(null);

  const effectiveFeatures = useMemo(() => {
    if (!wedding) return null;
    if (isPreview) {
      return {
        rsvp: false,
        gifts: false,
        whatsapp: false,
      };
    }
    return wedding.features;
  }, [wedding, isPreview]);

  const mediaItems = useQuery(
    api.mediaLibrary.listPublicByWedding,
    wedding ? { weddingId: wedding._id } : "skip"
  );

  const rsvpConfig = useQuery(
    api.rsvp.getPublicConfig,
    wedding && effectiveFeatures?.rsvp
      ? { weddingId: wedding._id }
      : "skip"
  );

  const giftOptions = useQuery(
    api.gifts.listPublicOptions,
    wedding && effectiveFeatures?.gifts
      ? { weddingId: wedding._id }
      : "skip"
  );

  useEffect(() => {
    if (!wedding) return;

    let cancelled = false;

    async function loadDesign() {
      const design = await getDesign(wedding.designId);
      if (cancelled) return;
      if (design) {
        setDesignComponent(() => design);
        setDesignError(null);
      } else {
        setDesignComponent(null);
        setDesignError(`Design not found: ${wedding.designId}`);
      }
    }

    loadDesign();

    return () => {
      cancelled = true;
    };
  }, [wedding?.designId]);

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

  // Check if wedding is accessible (not live in production)
  if (!isPreview && wedding.deployment.state !== "live") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-semibold">Coming Soon</h1>
        <p className="mt-2 text-muted-foreground">
          This wedding page is not yet published.
        </p>
      </div>
    );
  }

  if (designError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-semibold text-destructive">
          Design Error
        </h1>
        <p className="mt-2 text-muted-foreground">{designError}</p>
      </div>
    );
  }

  if (!DesignComponent || !effectiveFeatures) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  const props: WeddingDesignProps = {
    wedding: {
      _id: wedding._id,
      name: wedding.name,
      slug: wedding.slug,
      weddingDate: wedding.weddingDate,
      navbarLogoLightUrl: wedding.navbarLogoLightUrl,
      navbarLogoDarkUrl: wedding.navbarLogoDarkUrl,
      heroImageUrl: wedding.heroImageUrl,
      venueName: wedding.venueName,
      venueLocation: wedding.venueLocation,
    },
    features: effectiveFeatures,
    media: mediaItems ?? [],
    rsvpConfig: rsvpConfig ?? null,
    giftOptions: giftOptions ?? [],
    isPreview,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isPreview && <PreviewBanner />}
      <DesignComponent {...props} />
    </div>
  );
}

