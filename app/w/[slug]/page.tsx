import { WeddingRenderer } from "@/components/wedding/WeddingRenderer";

interface WeddingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Wedding page route.
 * Accessed via subdomain: {slug}.braunstud.io
 * Middleware rewrites subdomain requests to /w/[slug]
 */
export default async function WeddingPage({ params }: WeddingPageProps) {
  const { slug } = await params;

  return <WeddingRenderer slug={slug} isPreview={false} />;
}

