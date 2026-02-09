"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Trash2, Upload } from "lucide-react";

type MediaItem = {
  _id: Id<"mediaItems">;
  url?: string;
  mediaType: "image" | "video" | "audio";
  tags: string[];
  metadata: {
    alt?: string;
    caption?: string;
  };
};

function detectMediaType(file: File): "image" | "video" | "audio" {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "image";
}

export function MediaTab({ weddingId }: { weddingId: Id<"weddings"> }) {
  const mediaItems = useQuery(api.mediaLibrary.listByWedding, { weddingId });
  const generateUploadUrl = useMutation(api.mediaLibrary.generateUploadUrl);
  const addItem = useMutation(api.mediaLibrary.addItem);
  const updateItemMetadata = useMutation(api.mediaLibrary.updateItemMetadata);
  const setTags = useMutation(api.mediaLibrary.setTags);
  const reorder = useMutation(api.mediaLibrary.reorder);
  const deleteItem = useMutation(api.mediaLibrary.deleteItem);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (mediaItems) {
      setItems(mediaItems as MediaItem[]);
    }
  }, [mediaItems]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { storageId } = await result.json();
        await addItem({
          weddingId,
          storageId,
          mediaType: detectMediaType(file),
          tags: [],
          metadata: {
            alt: file.name,
            caption: "",
          },
        });
      }

      toast.success("Media uploaded");
      event.target.value = "";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload media"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);

    await reorder({
      weddingId,
      orderedIds: next.map((item) => item._id),
    });
  };

  const updateItemField = (
    index: number,
    field: "alt" | "caption" | "tags",
    value: string
  ) => {
    setItems((prev) => {
      const next = [...prev];
      const item = next[index];
      if (field === "tags") {
        next[index] = {
          ...item,
          tags: value.split(",").map((tag) => tag.trim()).filter(Boolean),
        };
        return next;
      }
      next[index] = {
        ...item,
        metadata: {
          ...item.metadata,
          [field]: value,
        },
      };
      return next;
    });
  };

  const saveItem = async (item: MediaItem) => {
    setSavingItemId(item._id);
    try {
      await updateItemMetadata({
        id: item._id,
        metadata: {
          alt: item.metadata.alt,
          caption: item.metadata.caption,
        },
      });
      await setTags({
        id: item._id,
        tags: item.tags,
      });
      toast.success("Media item updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update media item"
      );
    } finally {
      setSavingItemId(null);
    }
  };

  const removeItem = async (itemId: Id<"mediaItems">) => {
    try {
      await deleteItem({ id: itemId });
      setItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success("Media item removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete media item"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Library</CardTitle>
        <CardDescription>
          Upload and tag images, videos, or audio for this wedding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="media-upload"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("media-upload")?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Media
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No media yet. Upload files to build the wedding library.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item._id} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-28 w-28 rounded-md overflow-hidden bg-muted">
                    {item.url ? (
                      <img
                        src={item.url}
                        alt={item.metadata.alt || "Wedding media"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        {item.mediaType.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label>Alt Text</Label>
                      <Input
                        value={item.metadata.alt || ""}
                        onChange={(e) =>
                          updateItemField(index, "alt", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Caption</Label>
                      <Input
                        value={item.metadata.caption || ""}
                        onChange={(e) =>
                          updateItemField(index, "caption", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        value={item.tags.join(", ")}
                        onChange={(e) =>
                          updateItemField(index, "tags", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveItem(index, "down")}
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => saveItem(item)}
                    disabled={savingItemId === item._id}
                  >
                    {savingItemId === item._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
