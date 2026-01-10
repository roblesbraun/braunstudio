"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Upload, Trash2, Loader2 } from "lucide-react";

export function GuestsTab({ weddingId }: { weddingId: Id<"weddings"> }) {
  const guests = useQuery(api.guests.listForWedding, { weddingId });
  const addGuest = useMutation(api.guests.add);
  const addBulk = useMutation(api.guests.addBulk);
  const removeGuest = useMutation(api.guests.remove);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleAdd = async () => {
    if (!name || !phone) {
      toast.error("Name and phone are required");
      return;
    }

    setIsAdding(true);
    try {
      await addGuest({
        weddingId,
        name,
        phone,
        whatsappConsent,
      });
      toast.success("Guest added");
      setName("");
      setPhone("");
      setWhatsappConsent(false);
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add guest"
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      toast.error("Please paste CSV data");
      return;
    }

    setIsImporting(true);
    try {
      // Parse CSV (simple: name,phone,whatsappConsent)
      const lines = csvText.trim().split("\n");
      const guestsToImport = lines
        .slice(1) // Skip header
        .map((line) => {
          const [name, phone, consent] = line.split(",").map((s) => s.trim());
          return {
            name,
            phone,
            whatsappConsent: consent?.toLowerCase() === "true",
          };
        })
        .filter((g) => g.name && g.phone);

      const result = await addBulk({
        weddingId,
        guests: guestsToImport,
      });

      toast.success(
        `Imported ${result.added} guest(s). Skipped ${result.skipped}.`
      );
      setCsvText("");
      setIsImportDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import guests"
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (guestId: Id<"guests">) => {
    if (!confirm("Are you sure you want to remove this guest?")) {
      return;
    }

    try {
      await removeGuest({ id: guestId });
      toast.success("Guest removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove guest"
      );
    }
  };

  const getRsvpBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700">Confirmed</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Guest List</CardTitle>
            <CardDescription>
              Manage guests who can RSVP and receive invitations
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Guests from CSV</DialogTitle>
                  <DialogDescription>
                    Paste CSV data with columns: name, phone, whatsappConsent
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>CSV Data</Label>
                    <textarea
                      className="min-h-[200px] w-full rounded-md border p-2 text-sm"
                      placeholder="name,phone,whatsappConsent&#10;John Doe,+1234567890,true&#10;Jane Smith,+0987654321,false"
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleImport} disabled={isImporting}>
                    {isImporting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Import
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Guest
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Guest</DialogTitle>
                  <DialogDescription>
                    Add a new guest to the wedding
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-name">Name</Label>
                    <Input
                      id="guest-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-phone">Phone</Label>
                    <Input
                      id="guest-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="whatsapp"
                      checked={whatsappConsent}
                      onCheckedChange={(checked) =>
                        setWhatsappConsent(checked === true)
                      }
                    />
                    <Label htmlFor="whatsapp" className="cursor-pointer">
                      WhatsApp consent
                    </Label>
                  </div>
                  <Button onClick={handleAdd} disabled={isAdding}>
                    {isAdding && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Guest
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {guests === undefined ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : guests.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No guests yet. Add guests manually or import from CSV.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>RSVP Status</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest) => (
                  <TableRow key={guest._id}>
                    <TableCell className="font-medium">{guest.name}</TableCell>
                    <TableCell>{guest.phone}</TableCell>
                    <TableCell>{getRsvpBadge(guest.rsvpStatus)}</TableCell>
                    <TableCell>
                      {guest.whatsappConsent ? (
                        <Badge variant="outline">Consented</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(guest._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
