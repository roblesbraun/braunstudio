"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

export function DetailsTab({ wedding }: { wedding: Doc<"weddings"> }) {
  const updateWedding = useMutation(api.weddings.update);
  const updateStatus = useMutation(api.weddings.updateStatus);
  const removeWedding = useMutation(api.weddings.remove);

  const [name, setName] = useState(wedding.name);
  const [coupleEmails, setCoupleEmails] = useState(wedding.coupleEmails);
  const [emailInput, setEmailInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const handleAddEmail = () => {
    const trimmed = emailInput.trim();
    if (trimmed && !coupleEmails.includes(trimmed)) {
      setCoupleEmails([...coupleEmails, trimmed]);
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setCoupleEmails(coupleEmails.filter((e) => e !== email));
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateWedding({
        id: wedding._id,
        name,
        coupleEmails,
      });
      toast.success("Wedding details updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update wedding"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "draft" | "pending_payment" | "live"
  ) => {
    setIsChangingStatus(true);
    try {
      await updateStatus({
        id: wedding._id,
        status: newStatus,
      });
      toast.success(`Wedding status changed to ${newStatus}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change status"
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this wedding? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await removeWedding({ id: wedding._id });
      toast.success("Wedding deleted");
      window.location.href = "/app/admin/weddings";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete wedding"
      );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update wedding name and couple access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wedding Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Wedding Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Slug (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={wedding.slug} disabled />
            <p className="text-xs text-muted-foreground">
              {wedding.status === "live"
                ? "Slug cannot be changed once wedding is live"
                : "Slug is set at creation and cannot be changed"}
            </p>
          </div>

          {/* Couple Emails */}
          <div className="space-y-2">
            <Label htmlFor="email">Couple Emails</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddEmail}>
                Add
              </Button>
            </div>
            {coupleEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {coupleEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Management</CardTitle>
          <CardDescription>
            Control the wedding&apos;s lifecycle status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Current Status:</span>
            <Badge
              className={
                wedding.status === "live"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : wedding.status === "draft"
                    ? ""
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              }
            >
              {wedding.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label>Change Status</Label>
            <div className="flex gap-2">
              {wedding.status !== "draft" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("draft")}
                  disabled={
                    isChangingStatus ||
                    wedding.status === "live" ||
                    wedding.status === "draft"
                  }
                >
                  Set to Draft
                </Button>
              )}
              {wedding.status !== "pending_payment" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("pending_payment")}
                  disabled={
                    isChangingStatus ||
                    wedding.status === "live" ||
                    wedding.status === "pending_payment"
                  }
                >
                  Set to Pending Payment
                </Button>
              )}
              {wedding.status !== "live" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("live")}
                  disabled={isChangingStatus || wedding.status === "live"}
                >
                  Publish Live
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {wedding.status === "live"
                ? "Live weddings cannot be reverted to draft or pending"
                : "Status transitions follow: draft → pending_payment → live"}
            </p>
          </div>
        </CardContent>
      </Card>

      {wedding.status === "draft" && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this wedding (only available for drafts)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Wedding
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
