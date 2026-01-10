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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ThemeTab({ wedding }: { wedding: Doc<"weddings"> }) {
  const updateTheme = useMutation(api.weddings.updateTheme);

  const [lightTheme, setLightTheme] = useState(wedding.theme.light);
  const [darkTheme, setDarkTheme] = useState(wedding.theme.dark);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateTheme({
        id: wedding._id,
        theme: {
          light: lightTheme,
          dark: darkTheme,
        },
      });
      toast.success("Theme updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update theme"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const colorFields = [
    { key: "background", label: "Background" },
    { key: "foreground", label: "Foreground" },
    { key: "card", label: "Card" },
    { key: "cardForeground", label: "Card Foreground" },
    { key: "popover", label: "Popover" },
    { key: "popoverForeground", label: "Popover Foreground" },
    { key: "primary", label: "Primary" },
    { key: "primaryForeground", label: "Primary Foreground" },
    { key: "secondary", label: "Secondary" },
    { key: "secondaryForeground", label: "Secondary Foreground" },
    { key: "muted", label: "Muted" },
    { key: "mutedForeground", label: "Muted Foreground" },
    { key: "accent", label: "Accent" },
    { key: "accentForeground", label: "Accent Foreground" },
    { key: "destructive", label: "Destructive" },
    { key: "border", label: "Border" },
    { key: "input", label: "Input" },
    { key: "ring", label: "Ring" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Colors</CardTitle>
        <CardDescription>
          Customize CSS variable overrides for light and dark modes. Use HSL
          values (e.g., &quot;210 40% 98%&quot;)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="light" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="light">Light Mode</TabsTrigger>
            <TabsTrigger value="dark">Dark Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="light" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {colorFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`light-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`light-${field.key}`}
                    value={(lightTheme as any)[field.key] || ""}
                    onChange={(e) =>
                      setLightTheme({
                        ...lightTheme,
                        [field.key]: e.target.value,
                      })
                    }
                    placeholder="210 40% 98%"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dark" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {colorFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`dark-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`dark-${field.key}`}
                    value={(darkTheme as any)[field.key] || ""}
                    onChange={(e) =>
                      setDarkTheme({
                        ...darkTheme,
                        [field.key]: e.target.value,
                      })
                    }
                    placeholder="222.2 84% 4.9%"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Theme
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
