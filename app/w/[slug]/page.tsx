"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WeddingRenderer } from "@/components/wedding/wedding-renderer";
import { notFound } from "next/navigation";

interface WeddingPageProps {
    params: Promise<{ slug: string }>;
}

export default function WeddingPage({ params }: WeddingPageProps) {
    const { slug } = use(params);
    const wedding = useQuery(api.weddings.getBySlug, { slug });

    // Loading state
    if (wedding === undefined) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </main>
        );
    }

    // Not found or not active
    if (wedding === null) {
        notFound();
    }

    return (
        <main>
            <WeddingRenderer wedding={wedding} renderMode="public" />
        </main>
    );
}
