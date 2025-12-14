"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/auth";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const rsvpStatusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800",
    confirmed: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
};

export default function CoupleRsvpsPage() {
    const user = useCurrentUser();
    const weddingId = user?.weddingId;

    const guests = useQuery(
        api.guests.list,
        weddingId ? { weddingId } : "skip"
    );
    const stats = useQuery(
        api.guests.getStats,
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

    // Filter to only responded guests
    const respondedGuests =
        guests?.filter((g) => g.rsvpStatus !== "pending") || [];
    const confirmedGuests =
        guests?.filter((g) => g.rsvpStatus === "confirmed") || [];
    const declinedGuests =
        guests?.filter((g) => g.rsvpStatus === "declined") || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">RSVPs</h1>
                <p className="text-muted-foreground">Track guest responses</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">
                            Total Invited
                        </div>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </div>
                    <div className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">
                            Confirmed
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.confirmed}
                        </div>
                    </div>
                    <div className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">
                            Declined
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.declined}
                        </div>
                    </div>
                    <div className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">
                            Response Rate
                        </div>
                        <div className="text-2xl font-bold">
                            {stats.total > 0
                                ? Math.round(
                                      ((stats.confirmed + stats.declined) /
                                          stats.total) *
                                          100
                                  )
                                : 0}
                            %
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmed Guests */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                    Confirmed ({confirmedGuests.length})
                </h2>
                {confirmedGuests.length === 0 ? (
                    <div className="border rounded-lg p-4 text-center text-muted-foreground">
                        No confirmed guests yet
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Plus One</TableHead>
                                    <TableHead>Dietary Restrictions</TableHead>
                                    <TableHead>Responded</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {confirmedGuests.map((guest) => (
                                    <TableRow key={guest._id}>
                                        <TableCell className="font-medium">
                                            {guest.name}
                                        </TableCell>
                                        <TableCell>{guest.phone}</TableCell>
                                        <TableCell>
                                            {guest.plusOne ? "Yes" : "No"}
                                        </TableCell>
                                        <TableCell>
                                            {guest.dietaryRestrictions || "—"}
                                        </TableCell>
                                        <TableCell>
                                            {guest.rsvpAt
                                                ? new Date(
                                                      guest.rsvpAt
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Declined Guests */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                    Declined ({declinedGuests.length})
                </h2>
                {declinedGuests.length === 0 ? (
                    <div className="border rounded-lg p-4 text-center text-muted-foreground">
                        No declined guests
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Responded</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {declinedGuests.map((guest) => (
                                    <TableRow key={guest._id}>
                                        <TableCell className="font-medium">
                                            {guest.name}
                                        </TableCell>
                                        <TableCell>{guest.phone}</TableCell>
                                        <TableCell>
                                            {guest.rsvpAt
                                                ? new Date(
                                                      guest.rsvpAt
                                                  ).toLocaleDateString()
                                                : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Pending */}
            {stats && stats.pending > 0 && (
                <div className="text-sm text-muted-foreground">
                    {stats.pending} guest{stats.pending !== 1 ? "s" : ""}{" "}
                    haven&apos;t responded yet
                </div>
            )}
        </div>
    );
}
