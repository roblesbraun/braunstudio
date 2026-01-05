"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CoupleSidebar } from "@/components/dashboard/CoupleSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Gift, Eye, ExternalLink } from "lucide-react";

export default function CoupleDashboardPage() {
  const weddings = useQuery(api.weddings.listForUser);

  // For now, show the first wedding the user has access to
  const wedding = weddings?.[0];

  const guestStats = useQuery(
    api.guests.getStats,
    wedding ? { weddingId: wedding._id } : "skip"
  );

  if (weddings === undefined) {
    return (
      <DashboardShell sidebar={<CoupleSidebar />}>
        <DashboardHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/app/couple" },
            { label: "Overview" },
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (!wedding) {
    return (
      <DashboardShell sidebar={<CoupleSidebar />}>
        <DashboardHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/app/couple" },
            { label: "Overview" },
          ]}
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <h2 className="text-xl font-semibold">No Wedding Found</h2>
          <p className="text-muted-foreground">
            You don&apos;t have access to any weddings yet. Please contact the
            platform administrator.
          </p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell sidebar={<CoupleSidebar />}>
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/app/couple" },
          { label: wedding.name },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Wedding Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{wedding.name}</span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  wedding.status === "live"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : wedding.status === "draft"
                      ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                }`}
              >
                {wedding.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" asChild>
                <a
                  href={`/preview/${wedding.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </a>
              </Button>
              {wedding.status === "live" && (
                <Button variant="outline" asChild>
                  <a
                    href={`https://${wedding.slug}.braunstud.io`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Live Site
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Guests
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {guestStats ? (
                <div className="text-2xl font-bold">{guestStats.total}</div>
              ) : (
                <Skeleton className="h-8 w-16" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {guestStats ? (
                <div className="text-2xl font-bold">{guestStats.confirmed}</div>
              ) : (
                <Skeleton className="h-8 w-16" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {guestStats ? (
                <div className="text-2xl font-bold">{guestStats.pending}</div>
              ) : (
                <Skeleton className="h-8 w-16" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stripe Connect Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Gift Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wedding.stripe.connected ? (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span>Stripe Connect is active</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Connect your Stripe account to receive gift payments directly.
                </p>
                <Button>Connect Stripe</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

