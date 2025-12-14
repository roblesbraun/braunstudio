"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CoupleSettingsPage() {
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

    const stripeStatusColors: Record<string, string> = {
        not_connected: "bg-gray-100 text-gray-800",
        pending: "bg-yellow-100 text-yellow-800",
        active: "bg-green-100 text-green-800",
        restricted: "bg-red-100 text-red-800",
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Account and payment settings
                </p>
            </div>

            {/* Account Info */}
            <div className="border rounded-lg p-6 space-y-4">
                <h2 className="font-semibold">Account</h2>
                <div className="grid gap-4">
                    <div>
                        <div className="text-sm text-muted-foreground">
                            Email
                        </div>
                        <div>{user?.email}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">
                            Name
                        </div>
                        <div>{user?.name || "Not set"}</div>
                    </div>
                </div>
            </div>

            {/* Wedding Info */}
            <div className="border rounded-lg p-6 space-y-4">
                <h2 className="font-semibold">Wedding</h2>
                <div className="grid gap-4">
                    <div>
                        <div className="text-sm text-muted-foreground">URL</div>
                        <div className="font-mono text-sm">
                            {wedding?.slug}.braunstud.io
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">
                            Status
                        </div>
                        <div className="capitalize">
                            {wedding?.status.replace("_", " ")}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">
                            Template
                        </div>
                        <div>
                            {wedding?.templateId} ({wedding?.templateVersion})
                        </div>
                    </div>
                </div>
            </div>

            {/* Stripe Connect */}
            <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Payment Settings</h2>
                    <Badge
                        variant="secondary"
                        className={
                            stripeStatusColors[
                                wedding?.stripeConnectStatus || "not_connected"
                            ]
                        }
                    >
                        {wedding?.stripeConnectStatus?.replace("_", " ") ||
                            "Not Connected"}
                    </Badge>
                </div>

                {wedding?.giftsMode === "internal" ? (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Connect your Stripe account to receive gift payments
                            directly.
                        </p>
                        {wedding.stripeConnectStatus === "not_connected" ? (
                            <Button disabled>
                                Connect Stripe (Coming Soon)
                            </Button>
                        ) : wedding.stripeConnectStatus === "active" ? (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-green-800">
                                    Your Stripe account is connected and ready
                                    to receive payments.
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <p className="text-yellow-800">
                                    Your Stripe account setup is pending. Please
                                    complete the onboarding process.
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        You&apos;re using an external gift registry. Switch to
                        internal gifts to enable payment collection through your
                        wedding site.
                    </p>
                )}
            </div>

            {/* Contact */}
            <div className="border rounded-lg p-6 space-y-4">
                <h2 className="font-semibold">Need Help?</h2>
                <p className="text-sm text-muted-foreground">
                    Contact your wedding administrator for help with content
                    changes, template updates, or any other questions.
                </p>
            </div>
        </div>
    );
}
