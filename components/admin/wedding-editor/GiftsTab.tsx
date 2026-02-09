"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";

type GiftOption = {
  label: string;
  amountCents: number;
  active: boolean;
};

export function GiftsTab({ weddingId }: { weddingId: Id<"weddings"> }) {
  const existing = useQuery(api.gifts.listOptions, { weddingId });
  const setOptions = useMutation(api.gifts.setOptions);
  const [options, setOptionsState] = useState<GiftOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setOptionsState(
        existing.map((option) => ({
          label: option.label,
          amountCents: option.amountCents,
          active: option.active,
        }))
      );
    }
  }, [existing]);

  const addOption = () => {
    setOptionsState((prev) => [
      ...prev,
      { label: "", amountCents: 0, active: true },
    ]);
  };

  const removeOption = (index: number) => {
    setOptionsState((prev) => prev.filter((_, i) => i !== index));
  };

  const moveOption = (index: number, direction: "up" | "down") => {
    setOptionsState((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updateOption = (
    index: number,
    field: keyof GiftOption,
    value: string | number | boolean
  ) => {
    setOptionsState((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setOptions({
        weddingId,
        options: options.map((option, index) => ({
          ...option,
          order: index,
        })),
      });
      toast.success("Gift options saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save gift options"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gift Options</CardTitle>
        <CardDescription>
          Configure Stripe gift options and amounts for this wedding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No gift options yet. Add the first option to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={option.label}
                      onChange={(e) =>
                        updateOption(index, "label", e.target.value)
                      }
                      placeholder="e.g., Honeymoon fund"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Amount (USD)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={(option.amountCents / 100).toFixed(2)}
                      onChange={(e) =>
                        updateOption(
                          index,
                          "amountCents",
                          Math.round(parseFloat(e.target.value || "0") * 100)
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={option.active}
                      onCheckedChange={(checked) =>
                        updateOption(index, "active", checked)
                      }
                    />
                    <span className="text-sm">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveOption(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveOption(index, "down")}
                      disabled={index === options.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={addOption}>
            <Plus className="mr-2 h-4 w-4" />
            Add Gift Option
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Gifts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
