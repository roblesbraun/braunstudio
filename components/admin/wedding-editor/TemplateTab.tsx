"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { templateRegistry } from "@/templates/registry";

export function TemplateTab({ wedding }: { wedding: Doc<"weddings"> }) {
  const updateWedding = useMutation(api.weddings.update);

  const [templateId, setTemplateId] = useState(wedding.templateId);
  const [templateVersion, setTemplateVersion] = useState(
    wedding.templateVersion
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const templates = Object.values(templateRegistry);
  const selectedTemplate = templateRegistry[templateId];
  const isLive = wedding.status === "live";

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateWedding({
        id: wedding._id,
        templateId,
        templateVersion,
      });
      toast.success("Template updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update template"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Configuration</CardTitle>
        <CardDescription>
          {isLive
            ? "Template cannot be changed once wedding is live"
            : "Choose the template and version for this wedding"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label htmlFor="template">Template</Label>
          <Select
            value={templateId}
            onValueChange={setTemplateId}
            disabled={isLive}
          >
            <SelectTrigger id="template">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem
                  key={template.metadata.id}
                  value={template.metadata.id}
                >
                  {template.metadata.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplate && (
            <p className="text-sm text-muted-foreground">
              {selectedTemplate.metadata.description}
            </p>
          )}
        </div>

        {/* Template Version */}
        <div className="space-y-2">
          <Label htmlFor="version">Template Version</Label>
          <Select
            value={templateVersion}
            onValueChange={setTemplateVersion}
            disabled={isLive}
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
          <p className="text-sm text-muted-foreground">
            Template versions are immutable once released
          </p>
        </div>

        {!isLive && (
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Template
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
