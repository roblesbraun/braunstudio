"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CoupleDashboardPage() {
    const user = useCurrentUser();
    const weddingId = user?.weddingId;

    const wedding = useQuery(
        api.weddings.get,
        weddingId ? { weddingId } : "skip"
    );
    const guestStats = useQuery(
        api.guests.getStats,
        weddingId ? { weddingId } : "skip"
    );

    if (!weddingId) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center text-muted-foreground">
                    <p className="text-xl mb-2">No wedding assigned</p>
                    <p className="text-sm">
                        Contact an administrator to set up your wedding.
                    </p>
                </div>
            </div>
        );
    }

    if (wedding === undefined) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    const coupleNames =
        wedding?.partner1Name && wedding?.partner2Name
            ? `${wedding.partner1Name} & ${wedding.partner2Name}`
            : wedding?.partner1Name || wedding?.partner2Name || "Your Wedding";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{coupleNames}</h1>
                <p className="text-muted-foreground">
                    {wedding?.weddingDate
                        ? new Date(wedding.weddingDate).toLocaleDateString(
                              "en-US",
                              {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                              }
                          )
                        : "Wedding date not set"}
                </p>
            </div>

            {/* Status */}
            <div className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Website Status
                    </p>
                    <p className="font-medium capitalize">
                        {wedding?.status.replace("_", " ")}
                    </p>
                </div>
                {wedding?.status === "active" && (
                    <a
                        href={`https://${wedding.slug}.braunstud.io`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline" size="sm">
                            View Live Site
                        </Button>
                    </a>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">
                        Total Guests
                    </div>
                    <div className="text-2xl font-bold">
                        {guestStats?.total ?? "--"}
                    </div>
                    <Link
                        href="/couple/guests"
                        className="text-sm text-primary hover:underline"
                    >
                        Manage guests →
                    </Link>
                </div>
                <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">
                        RSVPs Received
                    </div>
                    <div className="text-2xl font-bold">
                        {guestStats
                            ? guestStats.confirmed + guestStats.declined
                            : "--"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {guestStats?.confirmed ?? 0} confirmed,{" "}
                        {guestStats?.declined ?? 0} declined
                    </p>
                </div>
                <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">
                        Awaiting Response
                    </div>
                    <div className="text-2xl font-bold">
                        {guestStats?.pending ?? "--"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {guestStats && guestStats.total > 0
                            ? `${Math.round((guestStats.pending / guestStats.total) * 100)}% pending`
                            : "No guests yet"}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="border rounded-lg p-6">
                <h2 className="font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/couple/guests">
                        <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                            <h3 className="font-medium">Manage Guest List</h3>
                            <p className="text-sm text-muted-foreground">
                                Add, edit, or import guests
                            </p>
                        </div>
                    </Link>
                    <Link href="/couple/rsvps">
                        <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                            <h3 className="font-medium">View RSVPs</h3>
                            <p className="text-sm text-muted-foreground">
                                See who&apos;s attending
                            </p>
                        </div>
                    </Link>
                    <Link href="/couple/gifts">
                        <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                            <h3 className="font-medium">Gift Registry</h3>
                            <p className="text-sm text-muted-foreground">
                                View contributions
                            </p>
                        </div>
                    </Link>
                    <Link href="/couple/settings">
                        <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                            <h3 className="font-medium">Settings</h3>
                            <p className="text-sm text-muted-foreground">
                                Payment settings & account
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
