import { Metadata } from "next";
import { WeddingRenderer } from "@/components/wedding/WeddingRenderer";

interface PreviewPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Preview page route.
 * Accessed via: braunstud.io/preview/{slug}
 * 
 * Preview rules:
 * - Uses same renderer as production
 * - RSVP disabled
 * - Payments disabled
 * - noindex meta tag
 * - Visible "Preview Mode" indicator
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;

  return <WeddingRenderer slug={slug} isPreview={true} />;
}

