"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Eye, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function LinksTab({ wedding }: { wedding: Doc<"weddings"> }) {
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [copiedLive, setCopiedLive] = useState(false);

  const previewUrl = `${window.location.origin}/preview/${wedding.slug}`;
  const liveUrl = `https://${wedding.slug}.braunstud.io`;

  const copyToClipboard = (text: string, type: "preview" | "live") => {
    navigator.clipboard.writeText(text);
    if (type === "preview") {
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 2000);
    } else {
      setCopiedLive(true);
      setTimeout(() => setCopiedLive(false), 2000);
    }
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Preview URL</CardTitle>
          <CardDescription>
            Share this link to preview the wedding before it goes live. RSVP and
            payments are disabled in preview mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preview Link</Label>
            <div className="flex gap-2">
              <Input value={previewUrl} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(previewUrl, "preview")}
              >
                {copiedPreview ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live URL</CardTitle>
          <CardDescription>
            {wedding.status === "live"
              ? "This is the public URL for the wedding website"
              : "This URL will be active once the wedding status is set to 'live'"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Public Link</Label>
            <div className="flex gap-2">
              <Input value={liveUrl} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(liveUrl, "live")}
              >
                {copiedLive ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              {wedding.status === "live" && (
                <Button variant="outline" size="icon" asChild>
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
