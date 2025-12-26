"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    LayoutIcon,
    CalendarIcon,
    UserAddIcon,
    UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function AdminDashboardPage() {
    const weddings = useQuery(api.weddings.list, {});
    const leads = useQuery(api.leads.list, {});
    const users = useQuery(api.users.list, {});

    // Calculate stats
    const weddingStats = {
        total: weddings?.length ?? 0,
        active: weddings?.filter((w) => w.status === "active").length ?? 0,
        draft: weddings?.filter((w) => w.status === "draft").length ?? 0,
        pending_payment:
            weddings?.filter((w) => w.status === "pending_payment").length ?? 0,
        paused: weddings?.filter((w) => w.status === "paused").length ?? 0,
    };

    const leadStats = {
        total: leads?.length ?? 0,
        new: leads?.filter((l) => l.status === "new" || !l.status).length ?? 0,
        contacted: leads?.filter((l) => l.status === "contacted").length ?? 0,
        converted: leads?.filter((l) => l.status === "converted").length ?? 0,
        closed: leads?.filter((l) => l.status === "closed").length ?? 0,
    };

    const userStats = {
        total: users?.length ?? 0,
        admin: users?.filter((u) => u.role === "platform_admin").length ?? 0,
        couple: users?.filter((u) => u.role === "couple").length ?? 0,
    };

    // Get recent weddings (last 5)
    const recentWeddings =
        weddings
            ?.sort((a, b) => {
                // Sort by creation or status priority
                if (a.status === "active" && b.status !== "active") return -1;
                if (a.status !== "active" && b.status === "active") return 1;
                return 0;
            })
            .slice(0, 5) ?? [];

    // Get recent leads (last 5)
    const recentLeads =
        leads?.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5) ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of your platform statistics
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Weddings
                        </CardTitle>
                        <HugeiconsIcon
                            icon={CalendarIcon}
                            className="h-4 w-4 text-muted-foreground"
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {weddingStats.total}
                        </div>
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{weddingStats.active} active</span>
                            <span>•</span>
                            <span>{weddingStats.draft} draft</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Leads
                        </CardTitle>
                        <HugeiconsIcon
                            icon={UserAddIcon}
                            className="h-4 w-4 text-muted-foreground"
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {leadStats.total}
                        </div>
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{leadStats.new} new</span>
                            <span>•</span>
                            <span>{leadStats.contacted} contacted</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                        <HugeiconsIcon
                            icon={UserGroupIcon}
                            className="h-4 w-4 text-muted-foreground"
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {userStats.total}
                        </div>
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{userStats.admin} admin</span>
                            <span>•</span>
                            <span>{userStats.couple} couples</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Weddings
                        </CardTitle>
                        <HugeiconsIcon
                            icon={LayoutIcon}
                            className="h-4 w-4 text-muted-foreground"
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {weddingStats.active}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Currently live
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Wedding Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Wedding Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Active</span>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-800"
                                    >
                                        {weddingStats.active}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Draft</span>
                                <Badge
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-800"
                                >
                                    {weddingStats.draft}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Pending Payment</span>
                                <Badge
                                    variant="secondary"
                                    className="bg-yellow-100 text-yellow-800"
                                >
                                    {weddingStats.pending_payment}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Paused</span>
                                <Badge
                                    variant="secondary"
                                    className="bg-orange-100 text-orange-800"
                                >
                                    {weddingStats.paused}
                                </Badge>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <Link
                                href="/app/admin/weddings"
                                className="text-sm text-primary hover:underline"
                            >
                                View all weddings →
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Lead Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">New</span>
                                <Badge
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800"
                                >
                                    {leadStats.new}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Contacted</span>
                                <Badge
                                    variant="secondary"
                                    className="bg-yellow-100 text-yellow-800"
                                >
                                    {leadStats.contacted}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Converted</span>
                                <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-800"
                                >
                                    {leadStats.converted}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Closed</span>
                                <Badge
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-800"
                                >
                                    {leadStats.closed}
                                </Badge>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <Link
                                href="/app/admin/leads"
                                className="text-sm text-primary hover:underline"
                            >
                                View all leads →
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Weddings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Weddings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentWeddings.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No weddings yet
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentWeddings.map((wedding) => (
                                    <div
                                        key={wedding._id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {wedding.slug}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {wedding.partner1Name &&
                                                wedding.partner2Name
                                                    ? `${wedding.partner1Name} & ${wedding.partner2Name}`
                                                    : wedding.partner1Name ||
                                                      wedding.partner2Name ||
                                                      "—"}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="ml-2"
                                        >
                                            {wedding.status.replace("_", " ")}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t">
                            <Link
                                href="/app/admin/weddings"
                                className="text-sm text-primary hover:underline"
                            >
                                View all →
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Leads */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentLeads.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No leads yet
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentLeads.map((lead) => (
                                    <div
                                        key={lead._id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {lead.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {lead.email}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="ml-2"
                                        >
                                            {lead.status || "new"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t">
                            <Link
                                href="/app/admin/leads"
                                className="text-sm text-primary hover:underline"
                            >
                                View all →
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
