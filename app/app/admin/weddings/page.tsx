"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    pending_payment: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-orange-100 text-orange-800",
};

export default function AdminWeddingsPage() {
    const weddings = useQuery(api.weddings.list, {});

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Weddings</h1>
                    <p className="text-muted-foreground">
                        Manage all wedding sites
                    </p>
                </div>
                <Link href="/admin/weddings/new">
                    <Button>Create Wedding</Button>
                </Link>
            </div>

            {weddings === undefined ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    Loading...
                </div>
            ) : weddings.length === 0 ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    No weddings yet. Create your first wedding to get started.
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Slug</TableHead>
                                <TableHead>Couple</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Template</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {weddings.map((wedding) => (
                                <TableRow key={wedding._id}>
                                    <TableCell className="font-medium">
                                        {wedding.slug}
                                    </TableCell>
                                    <TableCell>
                                        {wedding.partner1Name &&
                                        wedding.partner2Name
                                            ? `${wedding.partner1Name} & ${wedding.partner2Name}`
                                            : wedding.partner1Name ||
                                              wedding.partner2Name ||
                                              "—"}
                                    </TableCell>
                                    <TableCell>
                                        {wedding.weddingDate || "—"}
                                    </TableCell>
                                    <TableCell>
                                        {wedding.templateId}/
                                        {wedding.templateVersion}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={
                                                statusColors[wedding.status]
                                            }
                                        >
                                            {wedding.status.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/weddings/${wedding._id}`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`/preview/${wedding.previewToken}`}
                                                target="_blank"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    Preview
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
