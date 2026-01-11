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
import { Loader2, X, Upload, Trash2 } from "lucide-react";

export function DetailsTab({ wedding }: { wedding: Doc<"weddings"> }) {
  const updateWedding = useMutation(api.weddings.update);
  const updateStatus = useMutation(api.weddings.updateStatus);
  const removeWedding = useMutation(api.weddings.remove);
  const clearNavbarLogos = useMutation(api.weddings.clearNavbarLogos);
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const deleteFile = useMutation(api.media.deleteFile);

  const [name, setName] = useState(wedding.name);
  const [coupleEmails, setCoupleEmails] = useState(wedding.coupleEmails);
  const [emailInput, setEmailInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isUploadingLightLogo, setIsUploadingLightLogo] = useState(false);
  const [isUploadingDarkLogo, setIsUploadingDarkLogo] = useState(false);
  const [isRemovingLightLogo, setIsRemovingLightLogo] = useState(false);
  const [isRemovingDarkLogo, setIsRemovingDarkLogo] = useState(false);

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

  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    theme: "light" | "dark"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (SVG only)
    if (file.type !== "image/svg+xml" && !file.name.endsWith(".svg")) {
      toast.error("Please upload an SVG file");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("SVG must be smaller than 5MB");
      return;
    }

    const setUploading = theme === "light" ? setIsUploadingLightLogo : setIsUploadingDarkLogo;
    setUploading(true);

    try {
      // Delete old logo if exists
      const oldStorageId =
        theme === "light"
          ? wedding.navbarLogoLightStorageId
          : wedding.navbarLogoDarkStorageId;
      if (oldStorageId) {
        await deleteFile({ storageId: oldStorageId });
      }

      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Failed to upload logo");
      }

      const { storageId } = await result.json();

      // Store the storageId - the URL will be resolved dynamically by Convex queries
      await updateWedding({
        id: wedding._id,
        ...(theme === "light"
          ? { navbarLogoLightStorageId: storageId }
          : { navbarLogoDarkStorageId: storageId }),
      });

      toast.success(`${theme === "light" ? "Light" : "Dark"} logo uploaded successfully`);

      // Reset file input
      e.target.value = "";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload logo"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLogoRemove = async (theme: "light" | "dark") => {
    const storageId =
      theme === "light"
        ? wedding.navbarLogoLightStorageId
        : wedding.navbarLogoDarkStorageId;

    if (!storageId) return;

    if (
      !confirm(
        `Are you sure you want to remove the ${theme} mode navbar logo?`
      )
    ) {
      return;
    }

    const setRemoving = theme === "light" ? setIsRemovingLightLogo : setIsRemovingDarkLogo;
    setRemoving(true);

    try {
      // Delete file from storage
      await deleteFile({ storageId });

      // Clear logo field from wedding
      await clearNavbarLogos({
        id: wedding._id,
        clearLight: theme === "light",
        clearDark: theme === "dark",
      });

      toast.success(`${theme === "light" ? "Light" : "Dark"} logo removed successfully`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove logo"
      );
    } finally {
      setRemoving(false);
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
          <CardTitle>Navbar Logo (Light Mode)</CardTitle>
          <CardDescription>
            Upload an SVG logo for light mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {wedding.navbarLogoLightStorageId && wedding.navbarLogoLightUrl && (
            <div className="space-y-2">
              <Label>Current Light Logo</Label>
              <div className="flex items-center gap-4 rounded-lg border p-4 bg-white">
                <img
                  src={wedding.navbarLogoLightUrl}
                  alt="Light mode navbar logo preview"
                  className="h-12 max-w-[200px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <div>
              <input
                type="file"
                id="logo-light-upload"
                accept="image/svg+xml,.svg"
                onChange={(e) => handleLogoUpload(e, "light")}
                className="hidden"
                disabled={isUploadingLightLogo}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById("logo-light-upload")?.click()
                }
                disabled={isUploadingLightLogo}
              >
                {isUploadingLightLogo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {wedding.navbarLogoLightStorageId
                  ? "Replace Light Logo"
                  : "Upload Light Logo"}
              </Button>
            </div>

            {wedding.navbarLogoLightStorageId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleLogoRemove("light")}
                disabled={isRemovingLightLogo}
              >
                {isRemovingLightLogo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Upload an SVG file (max 5MB) for light mode.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navbar Logo (Dark Mode)</CardTitle>
          <CardDescription>
            Upload an SVG logo for dark mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {wedding.navbarLogoDarkStorageId && wedding.navbarLogoDarkUrl && (
            <div className="space-y-2">
              <Label>Current Dark Logo</Label>
              <div className="flex items-center gap-4 rounded-lg border p-4 bg-slate-900">
                <img
                  src={wedding.navbarLogoDarkUrl}
                  alt="Dark mode navbar logo preview"
                  className="h-12 max-w-[200px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <div>
              <input
                type="file"
                id="logo-dark-upload"
                accept="image/svg+xml,.svg"
                onChange={(e) => handleLogoUpload(e, "dark")}
                className="hidden"
                disabled={isUploadingDarkLogo}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById("logo-dark-upload")?.click()
                }
                disabled={isUploadingDarkLogo}
              >
                {isUploadingDarkLogo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {wedding.navbarLogoDarkStorageId
                  ? "Replace Dark Logo"
                  : "Upload Dark Logo"}
              </Button>
            </div>

            {wedding.navbarLogoDarkStorageId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleLogoRemove("dark")}
                disabled={isRemovingDarkLogo}
              >
                {isRemovingDarkLogo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Upload an SVG file (max 5MB) for dark mode.
          </p>
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
                : "Status transitions follow: draft ? pending_payment ? live"}
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
