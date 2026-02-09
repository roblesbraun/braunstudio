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
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDesignList } from "@/designs/registry";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function NewWeddingPage() {
  const router = useRouter();
  const createWedding = useMutation(api.weddings.create);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [weddingDate, setWeddingDate] = useState<Date>();
  const [designId, setDesignId] = useState("basic");
  const [featureFlags, setFeatureFlags] = useState({
    rsvp: false,
    gifts: false,
    whatsapp: false,
  });
  const [coupleEmails, setCoupleEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const designs = getDesignList();
  const selectedDesign = designs.find((design) => design.id === designId);

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
    
    if (!weddingDate) {
      toast.error("Please select a wedding date");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Format date as yyyy-MM-dd
      const formattedDate = format(weddingDate, "yyyy-MM-dd");
      
      const weddingId = await createWedding({
        name,
        slug,
        weddingDate: formattedDate,
        designId,
        features: featureFlags,
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
              Set up a new wedding website with a custom design implementation.
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

              {/* Wedding Date */}
              <div className="space-y-2">
                <Label htmlFor="weddingDate">Wedding Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="weddingDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !weddingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {weddingDate ? (
                        format(weddingDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={weddingDate}
                      onSelect={setWeddingDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  The date of the wedding ceremony
                </p>
              </div>

              {/* Design Selection */}
              <div className="space-y-2">
                <Label htmlFor="design">Design Implementation *</Label>
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
                  <p className="text-xs text-muted-foreground">
                    {selectedDesign.description}
                  </p>
                )}
              </div>

              {/* Feature Flags */}
              <div className="space-y-2">
                <Label>Feature Flags</Label>
                <div className="space-y-3 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">RSVP</p>
                      <p className="text-xs text-muted-foreground">
                        Enable the RSVP flow for this wedding
                      </p>
                    </div>
                    <Switch
                      checked={featureFlags.rsvp}
                      onCheckedChange={(checked) =>
                        setFeatureFlags((prev) => ({
                          ...prev,
                          rsvp: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Gifts</p>
                      <p className="text-xs text-muted-foreground">
                        Enable the Stripe gift section
                      </p>
                    </div>
                    <Switch
                      checked={featureFlags.gifts}
                      onCheckedChange={(checked) =>
                        setFeatureFlags((prev) => ({
                          ...prev,
                          gifts: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">WhatsApp</p>
                      <p className="text-xs text-muted-foreground">
                        Enable guest messaging entry points
                      </p>
                    </div>
                    <Switch
                      checked={featureFlags.whatsapp}
                      onCheckedChange={(checked) =>
                        setFeatureFlags((prev) => ({
                          ...prev,
                          whatsapp: checked,
                        }))
                      }
                    />
                  </div>
                </div>
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
