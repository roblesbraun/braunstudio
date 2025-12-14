"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/auth";

export default function CoupleGiftsPage() {
    const user = useCurrentUser();
    const weddingId = user?.weddingId;

    const wedding = useQuery(
        api.weddings.get,
        weddingId ? { weddingId } : "skip"
    );

    if (!weddingId) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center text-muted-foreground">
                    No wedding assigned to your account.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Gifts</h1>
                <p className="text-muted-foreground">View gift contributions</p>
            </div>

            {wedding?.giftsMode === "external" ? (
                <div className="border rounded-lg p-8 text-center space-y-4">
                    <p className="text-muted-foreground">
                        Your wedding is using an external gift registry.
                    </p>
                    {wedding.sections.gifts.externalUrl && (
                        <a
                            href={wedding.sections.gifts.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            View your external registry →
                        </a>
                    )}
                </div>
            ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    <p className="mb-4">Internal gift registry coming soon.</p>
                    <p className="text-sm">
                        When enabled, you&apos;ll be able to see gift
                        contributions and connect your Stripe account to receive
                        payments.
                    </p>
                </div>
            )}
        </div>
    );
}
