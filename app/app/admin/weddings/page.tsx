"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, ExternalLink, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";

export default function WeddingsListPage() {
  const weddings = useQuery(api.weddings.list);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredWeddings = useMemo(() => {
    if (!weddings) return [];

    return weddings.filter((wedding) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        wedding.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wedding.slug.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || wedding.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [weddings, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Live
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="secondary">Draft</Badge>
        );
      case "pending_payment":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            Pending Payment
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardShell sidebar={<AdminSidebar />}>
      <DashboardHeader
        breadcrumbs={[
          { label: "Admin", href: "/app/admin" },
          { label: "Weddings" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weddings</CardTitle>
                <CardDescription>
                  Manage all wedding websites on the platform
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/app/admin/weddings/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Wedding
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "live" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("live")}
                >
                  Live
                </Button>
                <Button
                  variant={statusFilter === "draft" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("draft")}
                >
                  Draft
                </Button>
                <Button
                  variant={
                    statusFilter === "pending_payment" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setStatusFilter("pending_payment")}
                >
                  Pending
                </Button>
              </div>
            </div>

            {/* Table */}
            {weddings === undefined ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredWeddings.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "No weddings match your filters"
                  : "No weddings yet. Create your first wedding to get started."}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Stripe</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWeddings.map((wedding) => (
                      <TableRow key={wedding._id}>
                        <TableCell className="font-medium">
                          {wedding.name}
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            {wedding.slug}
                          </code>
                        </TableCell>
                        <TableCell>{getStatusBadge(wedding.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {wedding.templateId}@{wedding.templateVersion}
                        </TableCell>
                        <TableCell>
                          {wedding.stripe.connected ? (
                            <Badge variant="outline" className="text-green-600">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not connected</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="Preview"
                            >
                              <Link
                                href={`/preview/${wedding.slug}`}
                                target="_blank"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {wedding.status === "live" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                title="View live site"
                              >
                                <a
                                  href={`https://${wedding.slug}.braunstud.io`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/app/admin/weddings/${wedding._id}`}>
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
