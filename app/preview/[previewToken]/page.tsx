"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WeddingRenderer } from "@/components/wedding/wedding-renderer";
import { Metadata } from "next";

interface PreviewPageProps {
    params: Promise<{ previewToken: string }>;
}

// Note: This metadata export doesn't work in client components
// We'll handle noindex via a meta tag in the component
// export const metadata: Metadata = {
//   robots: { index: false, follow: false },
// };

export default function PreviewPage({ params }: PreviewPageProps) {
    const { previewToken } = use(params);
    const wedding = useQuery(api.weddings.getByPreviewToken, { previewToken });

    // Loading state
    if (wedding === undefined) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-muted-foreground">Loading preview...</div>
            </main>
        );
    }

    // Not found
    if (wedding === null) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Preview Not Found</h1>
                    <p className="text-muted-foreground">
                        This preview link is invalid or has expired.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main>
            {/* NoIndex meta tag for preview pages */}
            <meta name="robots" content="noindex, nofollow" />

            {/* Preview banner */}
            <div className="sticky top-0 z-50 bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
                <span className="font-medium">Preview Mode</span> — RSVP and
                payment interactions are disabled
            </div>

            <WeddingRenderer wedding={wedding} renderMode="preview" />
        </main>
    );
}
