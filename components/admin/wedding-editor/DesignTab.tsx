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
import { getDesignList } from "@/designs/registry";

export function DesignTab({ wedding }: { wedding: Doc<"weddings"> }) {
  const updateDesign = useMutation(api.weddings.updateDesign);
  const [designId, setDesignId] = useState(wedding.designId);
  const [isUpdating, setIsUpdating] = useState(false);

  const designs = getDesignList();
  const selectedDesign = designs.find((design) => design.id === designId);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateDesign({
        id: wedding._id,
        designId,
      });
      toast.success("Design updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update design"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Design Implementation</CardTitle>
        <CardDescription>
          Select the custom frontend implementation for this wedding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="design">Design</Label>
          <Select value={designId} onValueChange={setDesignId}>
            <SelectTrigger id="design">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {designs.map((design) => (
                <SelectItem key={design.id} value={design.id}>
                  {design.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDesign && (
            <p className="text-sm text-muted-foreground">
              {selectedDesign.description}
            </p>
          )}
        </div>

        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Design
        </Button>
      </CardContent>
    </Card>
  );
}
