"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";
import {
    getAvailableTemplates,
    getLatestTemplateVersion,
} from "@/templates/registry";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon } from "@hugeicons/core-free-icons";

export default function NewWeddingPage() {
    const router = useRouter();
    const createWedding = useMutation(api.weddings.create);
    const couples = useQuery(api.users.list, { role: "couple" });

    // Get available templates from registry
    const availableTemplates = useMemo(() => getAvailableTemplates(), []);
    const defaultTemplateId = availableTemplates[0]?.id || "classic";
    const defaultTemplateVersion = useMemo(() => {
        try {
            return getLatestTemplateVersion(defaultTemplateId);
        } catch {
            return "v1";
        }
    }, [defaultTemplateId]);

    const [slug, setSlug] = useState("");
    const [ownerUserId, setOwnerUserId] = useState<string>("");
    const [templateId, setTemplateId] = useState(defaultTemplateId);
    const [templateVersion, setTemplateVersion] = useState<string | undefined>(
        undefined
    );
    const [partner1Name, setPartner1Name] = useState("");
    const [partner2Name, setPartner2Name] = useState("");
    const [weddingDate, setWeddingDate] = useState<Date | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (!ownerUserId) {
                throw new Error("Please select an owner");
            }

            const weddingId = await createWedding({
                slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                ownerUserId: ownerUserId as Id<"users">,
                templateId,
                templateVersion: templateVersion || undefined, // Let server default to latest
                partner1Name: partner1Name || undefined,
                partner2Name: partner2Name || undefined,
                weddingDate: weddingDate
                    ? weddingDate.toISOString().split("T")[0]
                    : undefined,
            });

            router.push(`/app/admin/weddings/${weddingId}`);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create wedding"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const selectedTemplate = availableTemplates.find(
        (t) => t.id === templateId
    );
    const effectiveVersion =
        templateVersion ||
        (selectedTemplate
            ? getLatestTemplateVersion(selectedTemplate.id)
            : defaultTemplateVersion);

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Create Wedding</h1>
                <p className="text-muted-foreground">
                    Create a new wedding site for a couple
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="john-and-jane"
                                required
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                .braunstud.io
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Only lowercase letters, numbers, and hyphens
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="owner">Owner (Couple)</Label>
                        <Select
                            value={ownerUserId}
                            onValueChange={setOwnerUserId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a couple" />
                            </SelectTrigger>
                            <SelectContent>
                                {couples?.map((couple) => (
                                    <SelectItem
                                        key={couple._id}
                                        value={couple._id}
                                    >
                                        {couple.name || couple.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {couples?.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                No couples found. Create a couple user first.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="template">Template</Label>
                            <Select
                                value={templateId}
                                onValueChange={(value) => {
                                    setTemplateId(value);
                                    // Reset version when template changes
                                    setTemplateVersion(undefined);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTemplates.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.id.charAt(0).toUpperCase() +
                                                t.id.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="version">
                                Version{" "}
                                {!templateVersion && (
                                    <span className="text-xs text-muted-foreground">
                                        (latest: {effectiveVersion})
                                    </span>
                                )}
                            </Label>
                            <Select
                                value={templateVersion || effectiveVersion}
                                onValueChange={setTemplateVersion}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedTemplate?.versions.map((v) => (
                                        <SelectItem key={v} value={v}>
                                            {v}
                                            {v === effectiveVersion &&
                                                !templateVersion &&
                                                " (latest)"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="partner1">Partner 1 Name</Label>
                            <Input
                                id="partner1"
                                value={partner1Name}
                                onChange={(e) =>
                                    setPartner1Name(e.target.value)
                                }
                                placeholder="John"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="partner2">Partner 2 Name</Label>
                            <Input
                                id="partner2"
                                value={partner2Name}
                                onChange={(e) =>
                                    setPartner2Name(e.target.value)
                                }
                                placeholder="Jane"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Wedding Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <HugeiconsIcon
                                        icon={Calendar01Icon}
                                        className="mr-2 h-4 w-4"
                                    />
                                    {weddingDate ? (
                                        format(weddingDate, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    defaultMonth={weddingDate}
                                    selected={weddingDate}
                                    onSelect={setWeddingDate}
                                    captionLayout="dropdown"
                                    fromYear={new Date().getFullYear()}
                                    toYear={new Date().getFullYear() + 2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {error && (
                    <div className="text-sm text-destructive">{error}</div>
                )}

                <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Wedding"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
