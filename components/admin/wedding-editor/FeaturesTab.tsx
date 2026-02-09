"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function FeaturesTab({ wedding }: { wedding: Doc<"weddings"> }) {
  const updateFeatures = useMutation(api.weddings.updateFeatures);
  const [features, setFeatures] = useState(wedding.features);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateFeatures({
        id: wedding._id,
        features,
      });
      toast.success("Features updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update features"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Flags</CardTitle>
        <CardDescription>
          Enable or disable shared platform features for this wedding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">RSVP</p>
            <p className="text-sm text-muted-foreground">
              Allow guests to submit multiple-choice RSVPs.
            </p>
          </div>
          <Switch
            checked={features.rsvp}
            onCheckedChange={(checked) =>
              setFeatures((prev) => ({ ...prev, rsvp: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Gifts</p>
            <p className="text-sm text-muted-foreground">
              Show the Stripe-based gift section.
            </p>
          </div>
          <Switch
            checked={features.gifts}
            onCheckedChange={(checked) =>
              setFeatures((prev) => ({ ...prev, gifts: checked }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">WhatsApp</p>
            <p className="text-sm text-muted-foreground">
              Enable WhatsApp guest messaging entry points.
            </p>
          </div>
          <Switch
            checked={features.whatsapp}
            onCheckedChange={(checked) =>
              setFeatures((prev) => ({ ...prev, whatsapp: checked }))
            }
          />
        </div>

        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Features
        </Button>
      </CardContent>
    </Card>
  );
}
