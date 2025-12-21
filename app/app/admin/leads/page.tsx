"use client";

import { useQuery, useMutation } from "convex/react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";

const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    converted: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
};

export default function AdminLeadsPage() {
    const leads = useQuery(api.leads.list, {});
    const updateStatus = useMutation(api.leads.updateStatus);
    const deleteLead = useMutation(api.leads.remove);

    const handleStatusChange = async (leadId: string, status: string) => {
        await updateStatus({
            leadId: leadId as Id<"leads">,
            status: status as "new" | "contacted" | "converted" | "closed",
        });
    };

    const handleDelete = async (leadId: string) => {
        if (confirm("Are you sure you want to delete this lead?")) {
            await deleteLead({ leadId: leadId as Id<"leads"> });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Leads</h1>
                <p className="text-muted-foreground">
                    Contact form submissions from the website
                </p>
            </div>

            {leads === undefined ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    Loading...
                </div>
            ) : leads.length === 0 ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    No leads yet. Leads will appear here when visitors submit
                    the contact form.
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leads.map((lead) => (
                                <TableRow key={lead._id}>
                                    <TableCell className="whitespace-nowrap">
                                        {new Date(
                                            lead.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {lead.name}
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={`mailto:${lead.email}`}
                                            className="text-primary hover:underline"
                                        >
                                            {lead.email}
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {lead.phone ? (
                                            <a
                                                href={`tel:${lead.phone}`}
                                                className="text-primary hover:underline"
                                            >
                                                {lead.phone}
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <p
                                            className="truncate"
                                            title={lead.message}
                                        >
                                            {lead.message}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={lead.status || "new"}
                                            onValueChange={(value) =>
                                                handleStatusChange(
                                                    lead._id,
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            statusColors[
                                                                lead.status ||
                                                                    "new"
                                                            ]
                                                        }
                                                    >
                                                        {lead.status || "new"}
                                                    </Badge>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">
                                                    New
                                                </SelectItem>
                                                <SelectItem value="contacted">
                                                    Contacted
                                                </SelectItem>
                                                <SelectItem value="converted">
                                                    Converted
                                                </SelectItem>
                                                <SelectItem value="closed">
                                                    Closed
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(lead._id)
                                            }
                                        >
                                            Delete
                                        </Button>
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
