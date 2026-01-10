"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import {
  MANDATORY_SECTIONS,
  SectionKey,
  HeroContent,
  ItineraryContent,
  ItineraryItem,
  PhotosContent,
  LocationContent,
  LodgingContent,
  LodgingItem,
  DressCodeContent,
  GiftsContent,
  RsvpContent,
} from "@/templates/types";

export function SectionsTab({ wedding }: { wedding: Doc<"weddings"> }) {
  const updateWedding = useMutation(api.weddings.update);
  const generateUploadUrl = useMutation(api.media.generateUploadUrl);

  const [enabledSections, setEnabledSections] = useState<string[]>(
    wedding.enabledSections
  );
  const [sectionContent, setSectionContent] = useState<Record<string, any>>(
    wedding.sectionContent
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const toggleSection = (section: string) => {
    setEnabledSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const updateContent = (section: string, content: any) => {
    setSectionContent((prev) => ({
      ...prev,
      [section]: content,
    }));
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateWedding({
        id: wedding._id,
        enabledSections,
        sectionContent,
      });
      toast.success("Sections updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update sections"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    section: "photos"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const currentContent = (sectionContent[section] || {
        images: [],
      }) as PhotosContent;
      const newImages = [...(currentContent.images || [])];

      for (const file of Array.from(files)) {
        // Get upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { storageId } = await result.json();

        // Get the public URL
        const response = await fetch(
          `/api/convex/media/getFileUrl?storageId=${storageId}`
        );
        const { url } = await response.json();

        newImages.push({
          url,
          storageId,
          alt: file.name,
          caption: "",
        });
      }

      updateContent(section, {
        ...currentContent,
        images: newImages,
      });

      toast.success(`Uploaded ${files.length} photo(s)`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload photos"
      );
    } finally {
      setUploadingPhotos(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Section Management</CardTitle>
          <CardDescription>
            Enable/disable sections and edit their content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {/* Hero Section */}
            <AccordionItem value="hero">
              <div className="flex items-center gap-2 py-4">
                <Switch
                  checked={enabledSections.includes("hero")}
                  onCheckedChange={() => toggleSection("hero")}
                />
                <AccordionTrigger className="flex-1 py-0">
                  <span>Hero / CTA</span>
                </AccordionTrigger>
              </div>
              <AccordionContent>
                <HeroEditor
                  content={sectionContent.hero as HeroContent}
                  onChange={(content) => updateContent("hero", content)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Itinerary Section */}
            <AccordionItem value="itinerary">
              <div className="flex items-center gap-2 py-4">
                <Switch
                  checked={enabledSections.includes("itinerary")}
                  onCheckedChange={() => toggleSection("itinerary")}
                />
                <AccordionTrigger className="flex-1 py-0">
                  <span>Itinerary</span>
                </AccordionTrigger>
              </div>
              <AccordionContent>
                <ItineraryEditor
                  content={sectionContent.itinerary as ItineraryContent}
                  onChange={(content) => updateContent("itinerary", content)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Photos Section */}
            <AccordionItem value="photos">
              <div className="flex items-center gap-2 py-4">
                <Switch
                  checked={enabledSections.includes("photos")}
                  onCheckedChange={() => toggleSection("photos")}
                />
                <AccordionTrigger className="flex-1 py-0">
                  <span>Photos</span>
                </AccordionTrigger>
              </div>
              <AccordionContent>
                <PhotosEditor
                  content={sectionContent.photos as PhotosContent}
                  onChange={(content) => updateContent("photos", content)}
                  onUpload={(e) => handlePhotoUpload(e, "photos")}
                  uploading={uploadingPhotos}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Location Section */}
            <AccordionItem value="location">
              <div className="flex items-center gap-2 py-4">
                <Switch
                  checked={enabledSections.includes("location")}
                  onCheckedChange={() => toggleSection("location")}
                />
                <AccordionTrigger className="flex-1 py-0">
                  <span>Location</span>
                </AccordionTrigger>
              </div>
              <AccordionContent>
                <LocationEditor
                  content={sectionContent.location as LocationContent}
                  onChange={(content) => updateContent("location", content)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Lodging Section */}
            <AccordionItem value="lodging">
              <div className="flex items-center gap-2 py-4">
                <Switch
                  checked={enabledSections.includes("lodging")}
                  onCheckedChange={() => toggleSection("lodging")}
                />
                <AccordionTrigger className="flex-1 py-0">
                  <span>Lodging</span>
                </AccordionTrigger>
              </div>
              <AccordionContent>
                <LodgingEditor
                  content={sectionContent.lodging as LodgingContent}
                  onChange={(content) => updateContent("lodging", content)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Dress Code Section */}
            <AccordionItem value="dressCode">
              <div className="flex items-center gap-2 py-4">
                <Switch
                  checked={enabledSections.includes("dressCode")}
                  onCheckedChange={() => toggleSection("dressCode")}
                />
                <AccordionTrigger className="flex-1 py-0">
                  <span>Dress Code</span>
                </AccordionTrigger>
              </div>
              <AccordionContent>
                <DressCodeEditor
                  content={sectionContent.dressCode as DressCodeContent}
                  onChange={(content) => updateContent("dressCode", content)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Gifts Section */}
            <AccordionItem value="gifts">
              <div className="flex items-center gap-2 py-4">
                <Switch
                  checked={enabledSections.includes("gifts")}
                  onCheckedChange={() => toggleSection("gifts")}
                />
                <AccordionTrigger className="flex-1 py-0">
                  <span>Gifts</span>
                </AccordionTrigger>
              </div>
              <AccordionContent>
                <GiftsEditor
                  content={sectionContent.gifts as GiftsContent}
                  onChange={(content) => updateContent("gifts", content)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* RSVP Section */}
            <AccordionItem value="rsvp">
              <div className="flex items-center gap-2 py-4">
                <Switch
                  checked={enabledSections.includes("rsvp")}
                  onCheckedChange={() => toggleSection("rsvp")}
                />
                <AccordionTrigger className="flex-1 py-0">
                  <span>RSVP</span>
                </AccordionTrigger>
              </div>
              <AccordionContent>
                <RsvpEditor
                  content={sectionContent.rsvp as RsvpContent}
                  onChange={(content) => updateContent("rsvp", content)}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6">
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save All Sections
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Individual section editors
function HeroEditor({
  content,
  onChange,
}: {
  content?: HeroContent;
  onChange: (content: HeroContent) => void;
}) {
  const data = content || {};

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Sarah & John"
        />
      </div>
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input
          value={data.subtitle || ""}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          placeholder="Together with their families"
        />
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input
          value={data.date || ""}
          onChange={(e) => onChange({ ...data, date: e.target.value })}
          placeholder="June 15, 2024"
        />
      </div>
      <div className="space-y-2">
        <Label>Background Image URL</Label>
        <Input
          value={data.backgroundImage || ""}
          onChange={(e) =>
            onChange({ ...data, backgroundImage: e.target.value })
          }
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label>CTA Text</Label>
        <Input
          value={data.ctaText || ""}
          onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
          placeholder="RSVP Now"
        />
      </div>
      <div className="space-y-2">
        <Label>CTA Link</Label>
        <Input
          value={data.ctaLink || ""}
          onChange={(e) => onChange({ ...data, ctaLink: e.target.value })}
          placeholder="#rsvp"
        />
      </div>
    </div>
  );
}

function ItineraryEditor({
  content,
  onChange,
}: {
  content?: ItineraryContent;
  onChange: (content: ItineraryContent) => void;
}) {
  const data = content || { items: [] };

  const addItem = () => {
    onChange({
      ...data,
      items: [
        ...(data.items || []),
        { time: "", title: "", description: "", location: "" },
      ],
    });
  };

  const updateItem = (index: number, item: ItineraryItem) => {
    const newItems = [...(data.items || [])];
    newItems[index] = item;
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    onChange({
      ...data,
      items: (data.items || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Schedule"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Events</Label>
          <Button type="button" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        {(data.items || []).map((item, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Event {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Time (e.g., 3:00 PM)"
                value={item.time}
                onChange={(e) =>
                  updateItem(index, { ...item, time: e.target.value })
                }
              />
              <Input
                placeholder="Title (e.g., Ceremony)"
                value={item.title}
                onChange={(e) =>
                  updateItem(index, { ...item, title: e.target.value })
                }
              />
              <Textarea
                placeholder="Description (optional)"
                value={item.description || ""}
                onChange={(e) =>
                  updateItem(index, { ...item, description: e.target.value })
                }
              />
              <Input
                placeholder="Location (optional)"
                value={item.location || ""}
                onChange={(e) =>
                  updateItem(index, { ...item, location: e.target.value })
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PhotosEditor({
  content,
  onChange,
  onUpload,
  uploading,
}: {
  content?: PhotosContent;
  onChange: (content: PhotosContent) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}) {
  const data = content || { images: [] };

  const updateImage = (
    index: number,
    field: "alt" | "caption",
    value: string
  ) => {
    const newImages = [...(data.images || [])];
    newImages[index] = { ...newImages[index], [field]: value };
    onChange({ ...data, images: newImages });
  };

  const removeImage = (index: number) => {
    onChange({
      ...data,
      images: (data.images || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Our Story"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Photos</Label>
          <div>
            <input
              type="file"
              id="photo-upload"
              multiple
              accept="image/*"
              onChange={onUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => document.getElementById("photo-upload")?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload Photos
            </Button>
          </div>
        </div>

        {(data.images || []).map((image, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Photo {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {image.url && (
                <img
                  src={image.url}
                  alt={image.alt || ""}
                  className="h-32 w-full rounded object-cover"
                />
              )}
              <Input
                placeholder="Alt text"
                value={image.alt || ""}
                onChange={(e) => updateImage(index, "alt", e.target.value)}
              />
              <Input
                placeholder="Caption (optional)"
                value={image.caption || ""}
                onChange={(e) => updateImage(index, "caption", e.target.value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LocationEditor({
  content,
  onChange,
}: {
  content?: LocationContent;
  onChange: (content: LocationContent) => void;
}) {
  const data = content || { venueName: "", address: "" };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Venue"
        />
      </div>
      <div className="space-y-2">
        <Label>Venue Name</Label>
        <Input
          value={data.venueName}
          onChange={(e) => onChange({ ...data, venueName: e.target.value })}
          placeholder="The Grand Ballroom"
        />
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Textarea
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          placeholder="123 Main St, City, State 12345"
        />
      </div>
      <div className="space-y-2">
        <Label>Map URL</Label>
        <Input
          value={data.mapUrl || ""}
          onChange={(e) => onChange({ ...data, mapUrl: e.target.value })}
          placeholder="https://maps.google.com/..."
        />
      </div>
      <div className="space-y-2">
        <Label>Directions</Label>
        <Textarea
          value={data.directions || ""}
          onChange={(e) => onChange({ ...data, directions: e.target.value })}
          placeholder="Optional directions..."
        />
      </div>
    </div>
  );
}

function LodgingEditor({
  content,
  onChange,
}: {
  content?: LodgingContent;
  onChange: (content: LodgingContent) => void;
}) {
  const data = content || { items: [] };

  const addItem = () => {
    onChange({
      ...data,
      items: [...(data.items || []), { name: "" }],
    });
  };

  const updateItem = (index: number, item: LodgingItem) => {
    const newItems = [...(data.items || [])];
    newItems[index] = item;
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    onChange({
      ...data,
      items: (data.items || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Accommodations"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Hotels</Label>
          <Button type="button" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Hotel
          </Button>
        </div>

        {(data.items || []).map((item, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Hotel {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Hotel Name"
                value={item.name}
                onChange={(e) =>
                  updateItem(index, { ...item, name: e.target.value })
                }
              />
              <Input
                placeholder="Address (optional)"
                value={item.address || ""}
                onChange={(e) =>
                  updateItem(index, { ...item, address: e.target.value })
                }
              />
              <Input
                placeholder="Phone (optional)"
                value={item.phone || ""}
                onChange={(e) =>
                  updateItem(index, { ...item, phone: e.target.value })
                }
              />
              <Input
                placeholder="Website (optional)"
                value={item.website || ""}
                onChange={(e) =>
                  updateItem(index, { ...item, website: e.target.value })
                }
              />
              <Textarea
                placeholder="Notes (optional)"
                value={item.notes || ""}
                onChange={(e) =>
                  updateItem(index, { ...item, notes: e.target.value })
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DressCodeEditor({
  content,
  onChange,
}: {
  content?: DressCodeContent;
  onChange: (content: DressCodeContent) => void;
}) {
  const data = content || { description: "" };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Dress Code"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Cocktail attire"
        />
      </div>
      <div className="space-y-2">
        <Label>Examples (comma-separated)</Label>
        <Input
          value={(data.examples || []).join(", ")}
          onChange={(e) =>
            onChange({
              ...data,
              examples: e.target.value.split(",").map((s) => s.trim()),
            })
          }
          placeholder="Suits, Cocktail dresses, Semi-formal"
        />
      </div>
    </div>
  );
}

function GiftsEditor({
  content,
  onChange,
}: {
  content?: GiftsContent;
  onChange: (content: GiftsContent) => void;
}) {
  const data = content || { mode: "wishlist" };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Gifts"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Your presence is the greatest gift..."
        />
      </div>
      <div className="space-y-2">
        <Label>Wishlist URL</Label>
        <Input
          value={data.wishlistUrl || ""}
          onChange={(e) => onChange({ ...data, wishlistUrl: e.target.value })}
          placeholder="https://..."
        />
        <p className="text-xs text-muted-foreground">
          Link to external registry (Amazon, Zola, etc.)
        </p>
      </div>
    </div>
  );
}

function RsvpEditor({
  content,
  onChange,
}: {
  content?: RsvpContent;
  onChange: (content: RsvpContent) => void;
}) {
  const data = content || {};

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="RSVP"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Please let us know if you can attend..."
        />
      </div>
      <div className="space-y-2">
        <Label>Deadline</Label>
        <Input
          value={data.deadline || ""}
          onChange={(e) => onChange({ ...data, deadline: e.target.value })}
          placeholder="May 1, 2024"
        />
      </div>
    </div>
  );
}
