"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";

const rsvpStatusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800",
    confirmed: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
};

export default function CoupleGuestsPage() {
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
    const exportData = useQuery(
        api.guests.getForExport,
        weddingId ? { weddingId } : "skip"
    );

    const addGuest = useMutation(api.guests.add);
    const updateGuest = useMutation(api.guests.update);
    const deleteGuest = useMutation(api.guests.remove);
    const bulkAddGuests = useMutation(api.guests.bulkAdd);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [plusOne, setPlusOne] = useState(false);
    const [dietary, setDietary] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Import state
    const [importData, setImportData] = useState("");
    const [importResult, setImportResult] = useState<{
        added: number;
        skipped: number;
        errors: string[];
    } | null>(null);

    const resetForm = () => {
        setName("");
        setPhone("");
        setEmail("");
        setPlusOne(false);
        setDietary("");
        setNotes("");
        setError(null);
        setEditingGuest(null);
    };

    const handleAddGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weddingId) return;

        setError(null);
        setIsSubmitting(true);

        try {
            if (editingGuest) {
                await updateGuest({
                    guestId: editingGuest as Id<"guests">,
                    name,
                    phone,
                    email: email || undefined,
                    plusOne,
                    dietaryRestrictions: dietary || undefined,
                    notes: notes || undefined,
                });
            } else {
                await addGuest({
                    weddingId,
                    name,
                    phone,
                    email: email || undefined,
                    plusOne,
                    dietaryRestrictions: dietary || undefined,
                    notes: notes || undefined,
                });
            }

            resetForm();
            setIsAddDialogOpen(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to save guest"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (guest: NonNullable<typeof guests>[number]) => {
        setEditingGuest(guest._id);
        setName(guest.name);
        setPhone(guest.phone);
        setEmail(guest.email || "");
        setPlusOne(guest.plusOne || false);
        setDietary(guest.dietaryRestrictions || "");
        setNotes(guest.notes || "");
        setIsAddDialogOpen(true);
    };

    const handleDelete = async (guestId: string) => {
        if (confirm("Are you sure you want to remove this guest?")) {
            await deleteGuest({ guestId: guestId as Id<"guests"> });
        }
    };

    const handleImport = async () => {
        if (!weddingId || !importData.trim()) return;

        setIsSubmitting(true);
        setImportResult(null);

        try {
            // Parse CSV data (simple format: name,phone,email)
            const lines = importData.trim().split("\n");
            const guests = lines
                .filter((line) => line.trim())
                .map((line) => {
                    const [name, phone, email] = line
                        .split(",")
                        .map((s) => s.trim());
                    return { name, phone, email: email || undefined };
                })
                .filter((g) => g.name && g.phone);

            const result = await bulkAddGuests({ weddingId, guests });
            setImportResult(result);

            if (result.added > 0) {
                setImportData("");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Import failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = () => {
        if (!exportData) return;

        const headers = [
            "Name",
            "Phone",
            "Email",
            "RSVP Status",
            "Plus One",
            "Dietary Restrictions",
            "Notes",
            "RSVP Date",
        ];
        const csvContent = [
            headers.join(","),
            ...exportData.map((g) =>
                [
                    `"${g.name}"`,
                    `"${g.phone}"`,
                    `"${g.email}"`,
                    g.rsvpStatus,
                    g.plusOne,
                    `"${g.dietaryRestrictions}"`,
                    `"${g.notes}"`,
                    g.rsvpAt,
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "guests.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!weddingId) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center text-muted-foreground">
                    <p>No wedding assigned to your account.</p>
                    <p className="text-sm">
                        Contact an administrator to set up your wedding.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Guests</h1>
                    <p className="text-muted-foreground">
                        Manage your guest list
                    </p>
                </div>
                <div className="flex gap-2">
                    <Dialog
                        open={isImportDialogOpen}
                        onOpenChange={setIsImportDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline">Import</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Import Guests</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>CSV Data</Label>
                                    <Textarea
                                        value={importData}
                                        onChange={(e) =>
                                            setImportData(e.target.value)
                                        }
                                        placeholder="name,phone,email&#10;John Doe,+1234567890,john@example.com&#10;Jane Smith,+0987654321,jane@example.com"
                                        rows={8}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Format: name,phone,email (one guest per
                                        line)
                                    </p>
                                </div>
                                {importResult && (
                                    <div className="p-3 bg-secondary rounded text-sm">
                                        <p>Added: {importResult.added}</p>
                                        <p>Skipped: {importResult.skipped}</p>
                                        {importResult.errors.length > 0 && (
                                            <div className="mt-2 text-destructive">
                                                {importResult.errors
                                                    .slice(0, 3)
                                                    .map((e, i) => (
                                                        <p key={i}>{e}</p>
                                                    ))}
                                                {importResult.errors.length >
                                                    3 && (
                                                    <p>
                                                        ...and{" "}
                                                        {importResult.errors
                                                            .length - 3}{" "}
                                                        more
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setIsImportDialogOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleImport}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? "Importing..."
                                            : "Import"}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={!exportData}
                    >
                        Export
                    </Button>

                    <Dialog
                        open={isAddDialogOpen}
                        onOpenChange={(open) => {
                            setIsAddDialogOpen(open);
                            if (!open) resetForm();
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button>Add Guest</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingGuest ? "Edit Guest" : "Add Guest"}
                                </DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={handleAddGuest}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        placeholder="+1234567890"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="plusOne"
                                        checked={plusOne}
                                        onChange={(e) =>
                                            setPlusOne(e.target.checked)
                                        }
                                        className="rounded border-input"
                                    />
                                    <Label htmlFor="plusOne">
                                        Plus One Allowed
                                    </Label>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dietary">
                                        Dietary Restrictions
                                    </Label>
                                    <Input
                                        id="dietary"
                                        value={dietary}
                                        onChange={(e) =>
                                            setDietary(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        rows={2}
                                    />
                                </div>
                                {error && (
                                    <div className="text-sm text-destructive">
                                        {error}
                                    </div>
                                )}
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddDialogOpen(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? "Saving..."
                                            : editingGuest
                                              ? "Save Changes"
                                              : "Add Guest"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">
                            Total Guests
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
                            Pending
                        </div>
                        <div className="text-2xl font-bold text-gray-600">
                            {stats.pending}
                        </div>
                    </div>
                </div>
            )}

            {/* Guest List */}
            {guests === undefined ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    Loading...
                </div>
            ) : guests.length === 0 ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    No guests yet. Add your first guest to get started.
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>RSVP</TableHead>
                                <TableHead>Plus One</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guests.map((guest) => (
                                <TableRow key={guest._id}>
                                    <TableCell className="font-medium">
                                        {guest.name}
                                    </TableCell>
                                    <TableCell>{guest.phone}</TableCell>
                                    <TableCell>{guest.email || "—"}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={
                                                rsvpStatusColors[
                                                    guest.rsvpStatus
                                                ]
                                            }
                                        >
                                            {guest.rsvpStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {guest.plusOne ? "Yes" : "No"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleEdit(guest)
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(guest._id)
                                                }
                                            >
                                                Remove
                                            </Button>
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
