"use client";

import { WeddingTemplateProps, SectionKey } from "@/templates/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Clock,
  Home,
  Shirt,
  Gift,
  Mail,
  Heart,
} from "lucide-react";

/**
 * Classic Elegance Template v1
 * 
 * A timeless, elegant design with:
 * - Clean serif typography
 * - Subtle fade-in animations
 * - Card-based section layout
 * - Responsive design
 * 
 * This version is IMMUTABLE once released.
 */

// Section components
function HeroSection({
  content,
  weddingName,
}: {
  content: WeddingTemplateProps["sections"]["content"]["hero"];
  weddingName: string;
}) {
  if (!content) return null;

  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      {content.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${content.backgroundImage})` }}
        />
      )}
      <div className="relative z-10 max-w-2xl">
        <Heart className="mx-auto mb-6 h-12 w-12 text-primary" />
        <h1 className="mb-4 font-serif text-5xl font-light tracking-wide md:text-6xl">
          {content.title || weddingName}
        </h1>
        {content.subtitle && (
          <p className="mb-6 text-xl text-muted-foreground">
            {content.subtitle}
          </p>
        )}
        {content.date && (
          <div className="mb-8 flex items-center justify-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            <span>{content.date}</span>
          </div>
        )}
        {content.ctaText && content.ctaLink && (
          <Button asChild size="lg" className="mt-4">
            <a href={content.ctaLink}>{content.ctaText}</a>
          </Button>
        )}
      </div>
    </section>
  );
}

function ItinerarySection({
  content,
}: {
  content: WeddingTemplateProps["sections"]["content"]["itinerary"];
}) {
  if (!content || !content.items?.length) return null;

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-center font-serif text-3xl font-light">
          {content.title || "Schedule"}
        </h2>
        <div className="space-y-6">
          {content.items.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="flex gap-4 p-6">
                <div className="flex flex-col items-center">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="mt-2 text-sm font-medium">{item.time}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  {item.location && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhotosSection({
  content,
}: {
  content: WeddingTemplateProps["sections"]["content"]["photos"];
}) {
  if (!content || !content.images?.length) return null;

  return (
    <section className="bg-muted/50 px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-center font-serif text-3xl font-light">
          {content.title || "Our Story"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.images.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={image.url}
                alt={image.alt || `Photo ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-sm text-white">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationSection({
  content,
}: {
  content: WeddingTemplateProps["sections"]["content"]["location"];
}) {
  if (!content) return null;

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <MapPin className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h2 className="mb-8 font-serif text-3xl font-light">
          {content.title || "Venue"}
        </h2>
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-medium">{content.venueName}</h3>
            <p className="mt-2 text-muted-foreground">{content.address}</p>
            {content.directions && (
              <p className="mt-4 text-sm text-muted-foreground">
                {content.directions}
              </p>
            )}
            {content.mapUrl && (
              <Button asChild variant="outline" className="mt-6">
                <a href={content.mapUrl} target="_blank" rel="noopener noreferrer">
                  View Map
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function LodgingSection({
  content,
}: {
  content: WeddingTemplateProps["sections"]["content"]["lodging"];
}) {
  if (!content || !content.items?.length) return null;

  return (
    <section className="bg-muted/50 px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <Home className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h2 className="mb-8 text-center font-serif text-3xl font-light">
          {content.title || "Accommodations"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {content.items.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.address && (
                  <p className="text-sm text-muted-foreground">{item.address}</p>
                )}
                {item.phone && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.phone}
                  </p>
                )}
                {item.notes && (
                  <p className="mt-2 text-sm">{item.notes}</p>
                )}
                {item.website && (
                  <Button asChild variant="link" className="mt-2 h-auto p-0">
                    <a href={item.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function DressCodeSection({
  content,
}: {
  content: WeddingTemplateProps["sections"]["content"]["dressCode"];
}) {
  if (!content) return null;

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Shirt className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h2 className="mb-8 font-serif text-3xl font-light">
          {content.title || "Dress Code"}
        </h2>
        <p className="text-lg">{content.description}</p>
        {content.examples && content.examples.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {content.examples.map((example, index) => (
              <span
                key={index}
                className="rounded-full bg-muted px-4 py-1 text-sm"
              >
                {example}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function GiftsSection({
  content,
  isPreview,
}: {
  content: WeddingTemplateProps["sections"]["content"]["gifts"];
  isPreview?: boolean;
}) {
  if (!content) return null;

  return (
    <section className="bg-muted/50 px-4 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <Gift className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h2 className="mb-4 font-serif text-3xl font-light">
          {content.title || "Gifts"}
        </h2>
        {content.description && (
          <p className="mb-8 text-muted-foreground">{content.description}</p>
        )}

        {content.mode === "wishlist" && content.wishlistUrl && (
          <Button asChild size="lg" disabled={isPreview}>
            <a
              href={isPreview ? "#" : content.wishlistUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Our Wishlist
            </a>
          </Button>
        )}

        {content.mode === "gifts" && content.items && content.items.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {content.items.map((item) => (
              <Card key={item.id}>
                {item.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-medium">{item.name}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  <p className="mt-2 text-lg font-medium">
                    ${(item.priceInCents / 100).toFixed(2)}
                  </p>
                  <Button className="mt-4 w-full" disabled={isPreview}>
                    {isPreview ? "Payments disabled in preview" : "Contribute"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isPreview && (
          <p className="mt-4 text-sm text-muted-foreground">
            Payment features are disabled in preview mode.
          </p>
        )}
      </div>
    </section>
  );
}

function RsvpSection({
  content,
  isPreview,
}: {
  content: WeddingTemplateProps["sections"]["content"]["rsvp"];
  isPreview?: boolean;
}) {
  if (!content) return null;

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <Mail className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h2 className="mb-4 font-serif text-3xl font-light">
          {content.title || "RSVP"}
        </h2>
        {content.description && (
          <p className="mb-6 text-muted-foreground">{content.description}</p>
        )}
        {content.deadline && (
          <p className="mb-6 text-sm text-muted-foreground">
            Please respond by {content.deadline}
          </p>
        )}
        <Card>
          <CardContent className="p-6">
            {isPreview ? (
              <div className="text-center">
                <p className="text-muted-foreground">
                  RSVP is disabled in preview mode.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your phone number to RSVP
                </p>
                <Button className="w-full">Start RSVP</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/**
 * Main template component.
 * Renders enabled sections in order.
 */
export default function ClassicTemplate({
  wedding,
  sections,
  isPreview,
}: WeddingTemplateProps) {
  const { enabled, content } = sections;

  // Section render order
  const sectionOrder: SectionKey[] = [
    "hero",
    "itinerary",
    "photos",
    "location",
    "lodging",
    "dressCode",
    "gifts",
    "rsvp",
  ];

  const renderSection = (key: SectionKey) => {
    if (!enabled.includes(key)) return null;

    switch (key) {
      case "hero":
        return (
          <HeroSection
            key={key}
            content={content.hero}
            weddingName={wedding.name}
          />
        );
      case "itinerary":
        return <ItinerarySection key={key} content={content.itinerary} />;
      case "photos":
        return <PhotosSection key={key} content={content.photos} />;
      case "location":
        return <LocationSection key={key} content={content.location} />;
      case "lodging":
        return <LodgingSection key={key} content={content.lodging} />;
      case "dressCode":
        return <DressCodeSection key={key} content={content.dressCode} />;
      case "gifts":
        return (
          <GiftsSection key={key} content={content.gifts} isPreview={isPreview} />
        );
      case "rsvp":
        return (
          <RsvpSection key={key} content={content.rsvp} isPreview={isPreview} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {sectionOrder.map(renderSection)}

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <Separator className="mx-auto mb-8 max-w-xs" />
        <p>Made with love</p>
        {isPreview && (
          <p className="mt-2 font-medium text-primary">Preview Mode</p>
        )}
      </footer>
    </div>
  );
}

