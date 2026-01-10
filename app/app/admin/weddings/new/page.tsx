"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { templateRegistry } from "@/templates/registry";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function NewWeddingPage() {
  const router = useRouter();
  const createWedding = useMutation(api.weddings.create);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [templateId, setTemplateId] = useState("classic");
  const [templateVersion, setTemplateVersion] = useState("v1");
  const [coupleEmails, setCoupleEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templates = Object.values(templateRegistry);
  const selectedTemplate = templateRegistry[templateId];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const weddingId = await createWedding({
        name,
        slug,
        templateId,
        templateVersion,
        coupleEmails: coupleEmails.length > 0 ? coupleEmails : undefined,
      });

      toast.success("Wedding created successfully!");
      router.push(`/app/admin/weddings/${weddingId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create wedding"
      );
      setIsSubmitting(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  };

  return (
    <DashboardShell sidebar={<AdminSidebar />}>
      <DashboardHeader
        breadcrumbs={[
          { label: "Admin", href: "/app/admin" },
          { label: "Weddings", href: "/app/admin/weddings" },
          { label: "New" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create New Wedding</CardTitle>
            <CardDescription>
              Set up a new wedding website. All sections will be enabled by
              default.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Wedding Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Wedding Name *</Label>
                <Input
                  id="name"
                  placeholder="Sarah & John"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The couple&apos;s names or wedding title
                </p>
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="sarah-john"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  pattern="[a-z0-9-]+"
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier (lowercase, numbers, hyphens only).
                  Will be used as: <strong>{slug || "slug"}.braunstud.io</strong>
                </p>
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <Label htmlFor="template">Template *</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger id="template">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.metadata.id} value={template.metadata.id}>
                        {template.metadata.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <p className="text-xs text-muted-foreground">
                    {selectedTemplate.metadata.description}
                  </p>
                )}
              </div>

              {/* Template Version */}
              <div className="space-y-2">
                <Label htmlFor="version">Template Version *</Label>
                <Select
                  value={templateVersion}
                  onValueChange={setTemplateVersion}
                >
                  <SelectTrigger id="version">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTemplate?.metadata.versions.map((version) => (
                      <SelectItem key={version} value={version}>
                        {version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Template version is immutable once the wedding goes live
                </p>
              </div>

              {/* Couple Emails */}
              <div className="space-y-2">
                <Label htmlFor="email">Couple Emails (optional)</Label>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddEmail}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pre-assign access to couples before they log in
                </p>
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

              {/* Actions */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Wedding
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
