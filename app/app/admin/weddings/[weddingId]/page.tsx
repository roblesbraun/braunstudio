"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getAvailableTemplates } from "@/templates/registry";

// Get available templates from registry
const getTemplates = () => getAvailableTemplates();

// Preset color palettes
const presetPalettes = {
    light: {
        name: "Light (Default)",
        palette: {
            background: "0 0% 100%",
            foreground: "222.2 84% 4.9%",
            card: "0 0% 100%",
            cardForeground: "222.2 84% 4.9%",
            popover: "0 0% 100%",
            popoverForeground: "222.2 84% 4.9%",
            primary: "222.2 47.4% 11.2%",
            primaryForeground: "210 40% 98%",
            secondary: "210 40% 96.1%",
            secondaryForeground: "222.2 47.4% 11.2%",
            muted: "210 40% 96.1%",
            mutedForeground: "215.4 16.3% 46.9%",
            accent: "210 40% 96.1%",
            accentForeground: "222.2 47.4% 11.2%",
            destructive: "0 84.2% 60.2%",
            destructiveForeground: "210 40% 98%",
            border: "214.3 31.8% 91.4%",
            input: "214.3 31.8% 91.4%",
            ring: "222.2 84% 4.9%",
        },
    },
    rose: {
        name: "Rose Garden",
        palette: {
            background: "0 0% 100%",
            foreground: "240 10% 3.9%",
            card: "0 0% 100%",
            cardForeground: "240 10% 3.9%",
            popover: "0 0% 100%",
            popoverForeground: "240 10% 3.9%",
            primary: "346.8 77.2% 49.8%",
            primaryForeground: "355.7 100% 97.3%",
            secondary: "240 4.8% 95.9%",
            secondaryForeground: "240 5.9% 10%",
            muted: "240 4.8% 95.9%",
            mutedForeground: "240 3.8% 46.1%",
            accent: "240 4.8% 95.9%",
            accentForeground: "240 5.9% 10%",
            destructive: "0 84.2% 60.2%",
            destructiveForeground: "0 0% 98%",
            border: "240 5.9% 90%",
            input: "240 5.9% 90%",
            ring: "346.8 77.2% 49.8%",
        },
    },
    sage: {
        name: "Sage & Stone",
        palette: {
            background: "60 9.1% 97.8%",
            foreground: "24 9.8% 10%",
            card: "60 9.1% 97.8%",
            cardForeground: "24 9.8% 10%",
            popover: "60 9.1% 97.8%",
            popoverForeground: "24 9.8% 10%",
            primary: "142.1 76.2% 36.3%",
            primaryForeground: "355.7 100% 97.3%",
            secondary: "60 4.8% 95.9%",
            secondaryForeground: "24 9.8% 10%",
            muted: "60 4.8% 95.9%",
            mutedForeground: "25 5.3% 44.7%",
            accent: "60 4.8% 95.9%",
            accentForeground: "24 9.8% 10%",
            destructive: "0 84.2% 60.2%",
            destructiveForeground: "60 9.1% 97.8%",
            border: "20 5.9% 90%",
            input: "20 5.9% 90%",
            ring: "142.1 76.2% 36.3%",
        },
    },
    navy: {
        name: "Navy & Gold",
        palette: {
            background: "0 0% 100%",
            foreground: "222.2 84% 4.9%",
            card: "0 0% 100%",
            cardForeground: "222.2 84% 4.9%",
            popover: "0 0% 100%",
            popoverForeground: "222.2 84% 4.9%",
            primary: "221.2 83.2% 53.3%",
            primaryForeground: "210 40% 98%",
            secondary: "45 93.4% 47.5%",
            secondaryForeground: "222.2 47.4% 11.2%",
            muted: "210 40% 96.1%",
            mutedForeground: "215.4 16.3% 46.9%",
            accent: "45 93.4% 47.5%",
            accentForeground: "222.2 47.4% 11.2%",
            destructive: "0 84.2% 60.2%",
            destructiveForeground: "210 40% 98%",
            border: "214.3 31.8% 91.4%",
            input: "214.3 31.8% 91.4%",
            ring: "221.2 83.2% 53.3%",
        },
    },
};

const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "pending_payment", label: "Pending Payment" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
];

interface PageProps {
    params: Promise<{ weddingId: string }>;
}

export default function WeddingDetailPage({ params }: PageProps) {
    const { weddingId } = use(params);
    const router = useRouter();

    const wedding = useQuery(api.weddings.get, {
        weddingId: weddingId as Id<"weddings">,
    });

    const updateStatus = useMutation(api.weddings.updateStatus);
    const updateTemplate = useMutation(api.weddings.updateTemplate);
    const updateTheme = useMutation(api.weddings.updateTheme);
    const updateDetails = useMutation(api.weddings.updateDetails);
    const updateSections = useMutation(api.weddings.updateSections);
    const regenerateToken = useMutation(api.weddings.regeneratePreviewToken);
    const deleteWedding = useMutation(api.weddings.remove);

    const [isDeleting, setIsDeleting] = useState(false);

    if (wedding === undefined) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (wedding === null) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Wedding not found</div>
            </div>
        );
    }

    const handleStatusChange = async (status: string) => {
        await updateStatus({
            weddingId: weddingId as Id<"weddings">,
            status: status as "draft" | "pending_payment" | "active" | "paused",
        });
    };

    const handleTemplateChange = async (
        templateId: string,
        version: string
    ) => {
        await updateTemplate({
            weddingId: weddingId as Id<"weddings">,
            templateId,
            templateVersion: version,
        });
    };

    const handlePalettePreset = async (presetKey: string) => {
        const preset = presetPalettes[presetKey as keyof typeof presetPalettes];
        if (preset) {
            await updateTheme({
                weddingId: weddingId as Id<"weddings">,
                palette: preset.palette,
                fontFamily: wedding.theme.fontFamily,
            });
        }
    };

    const handleRegenerateToken = async () => {
        await regenerateToken({ weddingId: weddingId as Id<"weddings"> });
    };

    const handleDelete = async () => {
        if (
            !confirm(
                "Are you sure you want to delete this wedding? This action cannot be undone."
            )
        ) {
            return;
        }
        setIsDeleting(true);
        try {
            await deleteWedding({ weddingId: weddingId as Id<"weddings"> });
            router.push("/app/admin");
        } catch (error) {
            console.error("Failed to delete wedding:", error);
            setIsDeleting(false);
        }
    };

    const previewUrl = `/preview/${wedding.previewToken}`;
    const publicUrl = `https://${wedding.slug}.braunstud.io`;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{wedding.slug}</h1>
                    <p className="text-muted-foreground">
                        {wedding.partner1Name && wedding.partner2Name
                            ? `${wedding.partner1Name} & ${wedding.partner2Name}`
                            : "Wedding Details"}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge
                        variant="secondary"
                        className={
                            wedding.status === "active"
                                ? "bg-green-100 text-green-800"
                                : wedding.status === "paused"
                                  ? "bg-orange-100 text-orange-800"
                                  : wedding.status === "pending_payment"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                        }
                    >
                        {wedding.status.replace("_", " ")}
                    </Badge>
                    <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="outline">Preview</Button>
                    </a>
                    {wedding.status === "active" && (
                        <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button>View Live</Button>
                        </a>
                    )}
                </div>
            </div>

            <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="sections">Sections</TabsTrigger>
                    <TabsTrigger value="theme">Theme</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                    <div className="border rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold">Wedding Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Partner 1 Name</Label>
                                <Input
                                    value={wedding.partner1Name || ""}
                                    onChange={(e) =>
                                        updateDetails({
                                            weddingId:
                                                weddingId as Id<"weddings">,
                                            partner1Name:
                                                e.target.value || undefined,
                                        })
                                    }
                                    placeholder="Partner 1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Partner 2 Name</Label>
                                <Input
                                    value={wedding.partner2Name || ""}
                                    onChange={(e) =>
                                        updateDetails({
                                            weddingId:
                                                weddingId as Id<"weddings">,
                                            partner2Name:
                                                e.target.value || undefined,
                                        })
                                    }
                                    placeholder="Partner 2"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Wedding Date</Label>
                                <Input
                                    type="date"
                                    value={wedding.weddingDate || ""}
                                    onChange={(e) =>
                                        updateDetails({
                                            weddingId:
                                                weddingId as Id<"weddings">,
                                            weddingDate:
                                                e.target.value || undefined,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Gifts Mode</Label>
                                <Select
                                    value={wedding.giftsMode}
                                    onValueChange={(value) =>
                                        updateDetails({
                                            weddingId:
                                                weddingId as Id<"weddings">,
                                            giftsMode: value as
                                                | "external"
                                                | "internal",
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="external">
                                            External Registry
                                        </SelectItem>
                                        <SelectItem value="internal">
                                            Internal Gifts
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold">Template</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Template</Label>
                                <Select
                                    value={wedding.templateId}
                                    onValueChange={(value) =>
                                        handleTemplateChange(
                                            value,
                                            wedding.templateVersion
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getTemplates().map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.id.charAt(0).toUpperCase() +
                                                    t.id.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Version</Label>
                                <Select
                                    value={wedding.templateVersion}
                                    onValueChange={(value) =>
                                        handleTemplateChange(
                                            wedding.templateId,
                                            value
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getTemplates()
                                            .find(
                                                (t) =>
                                                    t.id === wedding.templateId
                                            )
                                            ?.versions.map((v) => (
                                                <SelectItem key={v} value={v}>
                                                    {v}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="sections" className="space-y-6">
                    <div className="border rounded-lg p-6 space-y-6">
                        <h3 className="font-semibold">Section Configuration</h3>
                        <p className="text-sm text-muted-foreground">
                            Enable or disable sections and configure their
                            content.
                        </p>

                        {/* Hero Section */}
                        <SectionEditor
                            title="Hero"
                            enabled={wedding.sections.hero.enabled}
                            onToggle={(enabled) =>
                                updateSections({
                                    weddingId: weddingId as Id<"weddings">,
                                    sections: {
                                        ...wedding.sections,
                                        hero: {
                                            ...wedding.sections.hero,
                                            enabled,
                                        },
                                    },
                                })
                            }
                        >
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={
                                            wedding.sections.hero.title || ""
                                        }
                                        onChange={(e) =>
                                            updateSections({
                                                weddingId:
                                                    weddingId as Id<"weddings">,
                                                sections: {
                                                    ...wedding.sections,
                                                    hero: {
                                                        ...wedding.sections
                                                            .hero,
                                                        title:
                                                            e.target.value ||
                                                            undefined,
                                                    },
                                                },
                                            })
                                        }
                                        placeholder="We're Getting Married!"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subtitle</Label>
                                    <Textarea
                                        value={
                                            wedding.sections.hero.subtitle || ""
                                        }
                                        onChange={(e) =>
                                            updateSections({
                                                weddingId:
                                                    weddingId as Id<"weddings">,
                                                sections: {
                                                    ...wedding.sections,
                                                    hero: {
                                                        ...wedding.sections
                                                            .hero,
                                                        subtitle:
                                                            e.target.value ||
                                                            undefined,
                                                    },
                                                },
                                            })
                                        }
                                        placeholder="Join us for our special day"
                                    />
                                </div>
                            </div>
                        </SectionEditor>

                        {/* Location Section */}
                        <SectionEditor
                            title="Location"
                            enabled={wedding.sections.location.enabled}
                            onToggle={(enabled) =>
                                updateSections({
                                    weddingId: weddingId as Id<"weddings">,
                                    sections: {
                                        ...wedding.sections,
                                        location: {
                                            ...wedding.sections.location,
                                            enabled,
                                        },
                                    },
                                })
                            }
                        >
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Venue Name</Label>
                                    <Input
                                        value={
                                            wedding.sections.location
                                                .venueName || ""
                                        }
                                        onChange={(e) =>
                                            updateSections({
                                                weddingId:
                                                    weddingId as Id<"weddings">,
                                                sections: {
                                                    ...wedding.sections,
                                                    location: {
                                                        ...wedding.sections
                                                            .location,
                                                        venueName:
                                                            e.target.value ||
                                                            undefined,
                                                    },
                                                },
                                            })
                                        }
                                        placeholder="The Grand Ballroom"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Textarea
                                        value={
                                            wedding.sections.location.address ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            updateSections({
                                                weddingId:
                                                    weddingId as Id<"weddings">,
                                                sections: {
                                                    ...wedding.sections,
                                                    location: {
                                                        ...wedding.sections
                                                            .location,
                                                        address:
                                                            e.target.value ||
                                                            undefined,
                                                    },
                                                },
                                            })
                                        }
                                        placeholder="123 Wedding Lane, City, State"
                                    />
                                </div>
                            </div>
                        </SectionEditor>

                        {/* RSVP Section */}
                        <SectionEditor
                            title="RSVP"
                            enabled={wedding.sections.rsvp.enabled}
                            onToggle={(enabled) =>
                                updateSections({
                                    weddingId: weddingId as Id<"weddings">,
                                    sections: {
                                        ...wedding.sections,
                                        rsvp: {
                                            ...wedding.sections.rsvp,
                                            enabled,
                                        },
                                    },
                                })
                            }
                        >
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>RSVP Deadline</Label>
                                    <Input
                                        type="date"
                                        value={
                                            wedding.sections.rsvp.deadline || ""
                                        }
                                        onChange={(e) =>
                                            updateSections({
                                                weddingId:
                                                    weddingId as Id<"weddings">,
                                                sections: {
                                                    ...wedding.sections,
                                                    rsvp: {
                                                        ...wedding.sections
                                                            .rsvp,
                                                        deadline:
                                                            e.target.value ||
                                                            undefined,
                                                    },
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Message</Label>
                                    <Textarea
                                        value={
                                            wedding.sections.rsvp.message || ""
                                        }
                                        onChange={(e) =>
                                            updateSections({
                                                weddingId:
                                                    weddingId as Id<"weddings">,
                                                sections: {
                                                    ...wedding.sections,
                                                    rsvp: {
                                                        ...wedding.sections
                                                            .rsvp,
                                                        message:
                                                            e.target.value ||
                                                            undefined,
                                                    },
                                                },
                                            })
                                        }
                                        placeholder="Please let us know if you can make it"
                                    />
                                </div>
                            </div>
                        </SectionEditor>

                        {/* Gifts Section */}
                        <SectionEditor
                            title="Gifts"
                            enabled={wedding.sections.gifts.enabled}
                            onToggle={(enabled) =>
                                updateSections({
                                    weddingId: weddingId as Id<"weddings">,
                                    sections: {
                                        ...wedding.sections,
                                        gifts: {
                                            ...wedding.sections.gifts,
                                            enabled,
                                        },
                                    },
                                })
                            }
                        >
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Message</Label>
                                    <Textarea
                                        value={
                                            wedding.sections.gifts.message || ""
                                        }
                                        onChange={(e) =>
                                            updateSections({
                                                weddingId:
                                                    weddingId as Id<"weddings">,
                                                sections: {
                                                    ...wedding.sections,
                                                    gifts: {
                                                        ...wedding.sections
                                                            .gifts,
                                                        message:
                                                            e.target.value ||
                                                            undefined,
                                                    },
                                                },
                                            })
                                        }
                                        placeholder="Your presence is the greatest gift..."
                                    />
                                </div>
                                {wedding.giftsMode === "external" && (
                                    <div className="space-y-2">
                                        <Label>External Registry URL</Label>
                                        <Input
                                            value={
                                                wedding.sections.gifts
                                                    .externalUrl || ""
                                            }
                                            onChange={(e) =>
                                                updateSections({
                                                    weddingId:
                                                        weddingId as Id<"weddings">,
                                                    sections: {
                                                        ...wedding.sections,
                                                        gifts: {
                                                            ...wedding.sections
                                                                .gifts,
                                                            externalUrl:
                                                                e.target
                                                                    .value ||
                                                                undefined,
                                                        },
                                                    },
                                                })
                                            }
                                            placeholder="https://registry.example.com/..."
                                        />
                                    </div>
                                )}
                            </div>
                        </SectionEditor>

                        {/* Dress Code Section */}
                        <SectionEditor
                            title="Dress Code"
                            enabled={wedding.sections.dressCode.enabled}
                            onToggle={(enabled) =>
                                updateSections({
                                    weddingId: weddingId as Id<"weddings">,
                                    sections: {
                                        ...wedding.sections,
                                        dressCode: {
                                            ...wedding.sections.dressCode,
                                            enabled,
                                        },
                                    },
                                })
                            }
                        >
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Dress Code</Label>
                                    <Input
                                        value={
                                            wedding.sections.dressCode.code ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            updateSections({
                                                weddingId:
                                                    weddingId as Id<"weddings">,
                                                sections: {
                                                    ...wedding.sections,
                                                    dressCode: {
                                                        ...wedding.sections
                                                            .dressCode,
                                                        code:
                                                            e.target.value ||
                                                            undefined,
                                                    },
                                                },
                                            })
                                        }
                                        placeholder="Semi-Formal"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={
                                            wedding.sections.dressCode
                                                .description || ""
                                        }
                                        onChange={(e) =>
                                            updateSections({
                                                weddingId:
                                                    weddingId as Id<"weddings">,
                                                sections: {
                                                    ...wedding.sections,
                                                    dressCode: {
                                                        ...wedding.sections
                                                            .dressCode,
                                                        description:
                                                            e.target.value ||
                                                            undefined,
                                                    },
                                                },
                                            })
                                        }
                                        placeholder="Please dress comfortably but elegantly"
                                    />
                                </div>
                            </div>
                        </SectionEditor>

                        {/* Lodging Section */}
                        <SectionEditor
                            title="Lodging"
                            enabled={wedding.sections.lodging.enabled}
                            onToggle={(enabled) =>
                                updateSections({
                                    weddingId: weddingId as Id<"weddings">,
                                    sections: {
                                        ...wedding.sections,
                                        lodging: {
                                            ...wedding.sections.lodging,
                                            enabled,
                                        },
                                    },
                                })
                            }
                        >
                            <p className="text-sm text-muted-foreground">
                                Hotel recommendations can be configured here.
                            </p>
                        </SectionEditor>

                        {/* Itinerary Section */}
                        <SectionEditor
                            title="Itinerary"
                            enabled={wedding.sections.itinerary.enabled}
                            onToggle={(enabled) =>
                                updateSections({
                                    weddingId: weddingId as Id<"weddings">,
                                    sections: {
                                        ...wedding.sections,
                                        itinerary: {
                                            ...wedding.sections.itinerary,
                                            enabled,
                                        },
                                    },
                                })
                            }
                        >
                            <p className="text-sm text-muted-foreground">
                                Event schedule can be configured here.
                            </p>
                        </SectionEditor>
                    </div>
                </TabsContent>

                <TabsContent value="theme" className="space-y-6">
                    <div className="border rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold">Color Palette</h3>
                        <p className="text-sm text-muted-foreground">
                            Choose a preset palette or customize individual
                            colors.
                        </p>

                        <div className="space-y-2">
                            <Label>Preset Palettes</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(presetPalettes).map(
                                    ([key, preset]) => (
                                        <button
                                            key={key}
                                            onClick={() =>
                                                handlePalettePreset(key)
                                            }
                                            className="p-3 border rounded-lg text-left hover:border-primary transition-colors"
                                        >
                                            <div className="flex gap-1 mb-2">
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{
                                                        backgroundColor: `hsl(${preset.palette.primary})`,
                                                    }}
                                                />
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{
                                                        backgroundColor: `hsl(${preset.palette.secondary})`,
                                                    }}
                                                />
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{
                                                        backgroundColor: `hsl(${preset.palette.accent})`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm">
                                                {preset.name}
                                            </span>
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Label className="mb-2 block">
                                Current Palette Preview
                            </Label>
                            <div className="grid grid-cols-5 gap-2">
                                {Object.entries(wedding.theme.palette)
                                    .slice(0, 10)
                                    .map(([key, value]) => (
                                        <div key={key} className="text-center">
                                            <div
                                                className="w-full h-8 rounded border"
                                                style={{
                                                    backgroundColor: `hsl(${value})`,
                                                }}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {key
                                                    .replace(/([A-Z])/g, " $1")
                                                    .trim()}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <div className="border rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold">Status</h3>
                        <div className="space-y-2">
                            <Label>Wedding Status</Label>
                            <Select
                                value={wedding.status}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Only &quot;Active&quot; weddings are publicly
                                accessible.
                            </p>
                        </div>
                    </div>

                    <div className="border rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold">Preview Link</h3>
                        <div className="space-y-2">
                            <Label>Preview URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={`${typeof window !== "undefined" ? window.location.origin : ""}${previewUrl}`}
                                    readOnly
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}${previewUrl}`
                                        );
                                    }}
                                >
                                    Copy
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRegenerateToken}
                            >
                                Regenerate Token
                            </Button>
                        </div>
                    </div>

                    <div className="border border-destructive rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold text-destructive">
                            Danger Zone
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Permanently delete this wedding and all associated
                            data.
                        </p>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Wedding"}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Section Editor Component
function SectionEditor({
    title,
    enabled,
    onToggle,
    children,
}: {
    title: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium">{title}</h4>
                <Button
                    variant={enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToggle(!enabled)}
                >
                    {enabled ? "Enabled" : "Disabled"}
                </Button>
            </div>
            {enabled && <div className="pt-2">{children}</div>}
        </div>
    );
}
