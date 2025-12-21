"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminUsersPage() {
    const users = useQuery(api.users.list, {});
    const createCouple = useMutation(api.users.createCouple);
    const updateRole = useMutation(api.users.updateRole);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newName, setNewName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateCouple = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsCreating(true);

        try {
            await createCouple({ email: newEmail, name: newName });
            setNewEmail("");
            setNewName("");
            setIsDialogOpen(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create user"
            );
        } finally {
            setIsCreating(false);
        }
    };

    const handleRoleChange = async (userId: string, role: string) => {
        await updateRole({
            userId: userId as Id<"users">,
            role: role as "platform_admin" | "couple",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Users</h1>
                    <p className="text-muted-foreground">
                        Manage platform users
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Couple</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Couple User</DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={handleCreateCouple}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="John & Jane"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) =>
                                        setNewEmail(e.target.value)
                                    }
                                    placeholder="couple@example.com"
                                    required
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
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? "Creating..." : "Create"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {users === undefined ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    Loading...
                </div>
            ) : users.length === 0 ? (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    No users found.
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Wedding</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell className="font-medium">
                                        {user.name || "—"}
                                    </TableCell>
                                    <TableCell>{user.email || "—"}</TableCell>
                                    <TableCell>
                                        {user.role ? (
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    user.role ===
                                                    "platform_admin"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }
                                            >
                                                {user.role === "platform_admin"
                                                    ? "Admin"
                                                    : "Couple"}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">
                                                No role
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.weddingId ? (
                                            <a
                                                href={`/admin/weddings/${user.weddingId}`}
                                                className="text-primary hover:underline"
                                            >
                                                View
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.role || ""}
                                            onValueChange={(value) =>
                                                handleRoleChange(
                                                    user._id,
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Set role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="platform_admin">
                                                    Admin
                                                </SelectItem>
                                                <SelectItem value="couple">
                                                    Couple
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
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
