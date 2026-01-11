"use client";

import { WeddingTemplateProps, SectionKey } from "@/templates/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  ItemFooter,
} from "@/components/ui/item";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Clock,
  Hotel,
  Gift,
  Shirt,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

/**
 * Classic Elegance Template v1
 * 
 * A modern, responsive wedding template with:
 * - Full-height hero section
 * - Large typography and clean layout
 * - Responsive carousel for mobile
 * - Interactive RSVP with OTP flow
 * - Gift registry with progress tracking
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
    <section className="relative flex min-h-screen items-center justify-center bg-linear-to-b from-background to-muted/20 px-4">
      <div className="container mx-auto text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="font-sans text-6xl font-bold tracking-tight sm:text-7xl md:text-8xl">
              {content.title || weddingName}
            </h1>
            {content.date && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <p className="text-xl">{content.date}</p>
              </div>
            )}
            {content.subtitle && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <p className="text-lg">{content.subtitle}</p>
              </div>
            )}
          </div>
          <Separator className="mx-auto w-24" />
          {content.ctaText && content.ctaLink && (
            <Button
              size="lg"
              onClick={() => {
                const element = document.getElementById(
                  content.ctaLink?.replace("#", "") || ""
                );
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-lg"
            >
              {content.ctaText}
            </Button>
          )}
        </div>
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
    <section className="flex min-h-screen items-center py-20">
      <div className="w-full space-y-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h2 className="font-sans text-4xl font-bold sm:text-5xl">
              {content.title || "Itinerary"}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
          {content.items.map((event, index) => (
            <Card
              key={index}
              className="flex flex-col items-center justify-center min-h-[180px] sm:min-h-[220px] md:min-h-[260px]"
            >
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="text-5xl sm:text-6xl md:text-7xl font-semibold">
                  {event.time}
                </div>
                <div className="mt-4 text-sm sm:text-base tracking-[0.25em] uppercase">
                  {event.title}
                </div>
                {event.location && (
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                )}
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
    <section className="flex min-h-screen items-center bg-muted/10 py-20 px-4">
      <div className="container mx-auto">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {content.images.slice(0, 3).map((image, index) => (
              <Card key={index} className="overflow-hidden border-0 p-0 gap-0">
                <CardContent className="p-0">
                  <img
                    src={image.url}
                    alt={image.alt || `Photo ${index + 1}`}
                    className="h-[500px] w-full object-cover"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
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
    <section className="flex min-h-screen items-center bg-muted/20 py-20 px-4">
      <div className="container mx-auto">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-sans text-4xl font-bold sm:text-5xl">
              {content.title || "Location"}
            </h2>
            <p className="text-lg text-muted-foreground">
              How to get to our celebration
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {content.venueName}
              </CardTitle>
              <CardDescription>{content.address}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-hidden rounded-lg border">
                <div className="aspect-video w-full bg-muted flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Map</p>
                  </div>
                </div>
              </div>
              {content.mapUrl && (
                <div className="flex gap-4">
                  <Button className="flex-1" variant="default" asChild>
                    <a
                      href={content.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Map
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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

  const HospedajeCard = ({
    hotel,
  }: {
    hotel: (typeof content.items)[number];
  }) => (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hotel className="h-5 w-5 shrink-0" />
          <span>{hotel.name}</span>
        </CardTitle>
        {hotel.address && (
          <CardDescription>{hotel.address}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4 grow">
        {hotel.notes && (
          <p className="text-sm text-muted-foreground">{hotel.notes}</p>
        )}
        <div className="space-y-2">
          {hotel.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="text-muted-foreground">{hotel.phone}</span>
            </div>
          )}
        </div>
        {hotel.website && (
          <Button
            asChild
            variant="outline"
            className="w-full mt-auto"
            size="sm"
          >
            <a href={hotel.website} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Website
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <section className="flex min-h-screen items-center py-20 px-4">
      <div className="container mx-auto">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-sans text-4xl font-bold sm:text-5xl">
              {content.title || "Lodging"}
            </h2>
            <p className="text-lg text-muted-foreground">
              Recommended hotels near the venue
            </p>
          </div>

          {/* Mobile carousel */}
          <div className="md:hidden">
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent>
                {content.items.map((hotel, index) => (
                  <CarouselItem key={index} className="sm:basis-4/5">
                    <HospedajeCard hotel={hotel} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid gap-6 md:grid-cols-2">
            {content.items.map((hotel, index) => (
              <HospedajeCard key={index} hotel={hotel} />
            ))}
          </div>
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
    <section className="flex min-h-screen items-center py-20 px-4">
      <div className="container mx-auto">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-sans text-4xl font-bold sm:text-5xl">
              {content.title || "Dress Code"}
            </h2>
            <p className="text-lg text-muted-foreground">
              Suggestions for our wedding
            </p>
          </div>
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shirt className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{content.description}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              {content.examples && content.examples.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Suggestions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {content.examples.map((example, index) => (
                        <Badge key={index} variant="secondary">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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

  const handleGiftContribute = () => {
    if (isPreview) {
      alert("Gift contribution (preview mode - no charges)");
    } else {
      // Real Stripe integration would go here
      alert("Gift contribution (Stripe integration pending)");
    }
  };

  return (
    <section className="flex min-h-screen items-center bg-muted/20 py-20 px-4">
      <div className="container mx-auto">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-sans text-4xl font-bold sm:text-5xl">
              {content.title || "Gifts"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {content.description ||
                "Your presence is our greatest gift, but if you wish to give something..."}
            </p>
          </div>
          <div className="space-y-6">
            {content.mode === "wishlist" && content.wishlistUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Our Gift Registry</CardTitle>
                  <CardDescription>
                    Visit our wishlist to see our registry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild size="lg" className="w-full">
                    <a
                      href={content.wishlistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Our Wishlist
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {content.mode === "gifts" && content.items && content.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Our Gift List</CardTitle>
                  <CardDescription>
                    You can contribute any amount to any gift
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[420px] w-full rounded-md">
                    <ItemGroup className="gap-3 p-1">
                      {content.items.map((gift) => {
                        const fundedPercentage = 0; // Would come from backend
                        return (
                          <Item
                            key={gift.id}
                            variant="outline"
                            size="sm"
                            className="flex-col items-start"
                          >
                            <div className="flex w-full items-start gap-2 sm:gap-3">
                              <ItemMedia
                                variant="image"
                                className="size-16 sm:size-20 shrink-0"
                              >
                                {gift.imageUrl ? (
                                  <Image
                                    src={gift.imageUrl}
                                    alt={gift.name}
                                    width={80}
                                    height={80}
                                    className="object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Gift className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                              </ItemMedia>
                              <ItemContent className="flex-1 min-h-16 sm:h-20 flex flex-col justify-between">
                                <div className="space-y-0">
                                  <ItemTitle className="line-clamp-1 text-xs sm:text-sm leading-tight">
                                    {gift.name}
                                  </ItemTitle>
                                  {gift.description && (
                                    <ItemDescription className="line-clamp-1 text-[10px] sm:text-xs leading-tight">
                                      {gift.description}
                                    </ItemDescription>
                                  )}
                                  <p className="text-[10px] sm:text-xs font-semibold leading-tight">
                                    ${(gift.priceInCents / 100).toFixed(2)}
                                  </p>
                                </div>
                              </ItemContent>
                              <div className="flex flex-col items-end justify-center min-h-16 sm:h-20">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={handleGiftContribute}
                                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                >
                                  <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            </div>
                            <ItemFooter className="w-full mt-2 gap-1">
                              <div className="flex-1 space-y-0.5">
                                <Progress
                                  value={fundedPercentage}
                                  className="h-1.5"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {fundedPercentage.toFixed(0)}% funded
                                </p>
                              </div>
                            </ItemFooter>
                          </Item>
                        );
                      })}
                    </ItemGroup>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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

  const [rsvpForm, setRsvpForm] = useState({
    name: "",
    email: "",
    attendance: "",
    plusOnes: "0",
    dietary: "",
  });

  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthed) {
      setAuthDialogOpen(true);
      return;
    }
    if (isPreview) {
      alert("RSVP submitted (preview mode - no database write)");
    } else {
      // Real Convex mutation would go here
      alert("RSVP submitted successfully!");
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      console.log("Preview mode: OTP would be sent to:", phoneNumber);
      setOtpSent(true);
      alert(`OTP sent to ${phoneNumber} (preview mode - no Twilio)`);
    } else {
      // Real Twilio/Convex OTP send would go here
      setOtpSent(true);
      alert(`OTP sent to ${phoneNumber}`);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      console.log("Preview mode: Verifying OTP:", otpCode);
      setIsAuthed(true);
      setAuthDialogOpen(false);
      alert("Authentication successful! (preview mode)");
    } else {
      // Real OTP verification would go here
      setIsAuthed(true);
      setAuthDialogOpen(false);
      alert("Authentication successful!");
    }
    setOtpSent(false);
    setPhoneNumber("");
    setOtpCode("");
  };

  return (
    <section className="flex min-h-screen items-center bg-muted/20 py-20 px-4">
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-sans text-4xl font-bold sm:text-5xl">
              {content.title || "RSVP"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {content.description || "Please confirm your attendance"}
            </p>
            {content.deadline && (
              <p className="text-sm text-muted-foreground">
                Please respond by {content.deadline}
              </p>
            )}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Confirm your attendance</CardTitle>
              <CardDescription>
                Complete the form to let us know if you&apos;ll join us
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRSVPSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={rsvpForm.name}
                    onChange={(e) =>
                      setRsvpForm({ ...rsvpForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={rsvpForm.email}
                    onChange={(e) =>
                      setRsvpForm({ ...rsvpForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendance">Will you attend?</Label>
                  <Select
                    value={rsvpForm.attendance}
                    onValueChange={(value) =>
                      setRsvpForm({ ...rsvpForm, attendance: value })
                    }
                    required
                  >
                    <SelectTrigger id="attendance">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, I&apos;ll attend</SelectItem>
                      <SelectItem value="no">No, I can&apos;t attend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {rsvpForm.attendance === "yes" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="plusOnes">How many guests?</Label>
                      <Select
                        value={rsvpForm.plusOnes}
                        onValueChange={(value) =>
                          setRsvpForm({ ...rsvpForm, plusOnes: value })
                        }
                      >
                        <SelectTrigger id="plusOnes">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Just me</SelectItem>
                          <SelectItem value="1">1 guest</SelectItem>
                          <SelectItem value="2">2 guests</SelectItem>
                          <SelectItem value="3">3 guests</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dietary">
                        Dietary restrictions (optional)
                      </Label>
                      <Input
                        id="dietary"
                        placeholder="E.g., Vegetarian, gluten-free, etc."
                        value={rsvpForm.dietary}
                        onChange={(e) =>
                          setRsvpForm({ ...rsvpForm, dietary: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}
                <Button type="submit" className="w-full" size="lg">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Confirmation
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Auth Dialog */}
      <Sheet open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sign in</SheetTitle>
            <SheetDescription>
              To confirm your attendance, we need to verify your identity.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 123 456 7890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send you a verification code
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Send code
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the code sent to {phoneNumber}
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  Verify
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode("");
                  }}
                >
                  Change number
                </Button>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>
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

    // Wrap each section with id and scroll-margin for navbar navigation
    const wrapSection = (component: React.ReactNode) => (
      <div key={key} id={key} className="scroll-mt-16">
        {component}
      </div>
    );

    switch (key) {
      case "hero":
        return wrapSection(
          <HeroSection
            content={content.hero}
            weddingName={wedding.name}
          />
        );
      case "itinerary":
        return wrapSection(
          <ItinerarySection content={content.itinerary} />
        );
      case "photos":
        return wrapSection(<PhotosSection content={content.photos} />);
      case "location":
        return wrapSection(
          <LocationSection content={content.location} />
        );
      case "lodging":
        return wrapSection(<LodgingSection content={content.lodging} />);
      case "dressCode":
        return wrapSection(
          <DressCodeSection content={content.dressCode} />
        );
      case "gifts":
        return wrapSection(
          <GiftsSection
            content={content.gifts}
            isPreview={isPreview}
          />
        );
      case "rsvp":
        return wrapSection(
          <RsvpSection content={content.rsvp} isPreview={isPreview} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0 font-sans">
      {sectionOrder.map(renderSection)}

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>{wedding.name}</p>
          <p className="mt-2">We look forward to celebrating with you!</p>
          {isPreview && (
            <p className="mt-2 font-medium text-primary">Preview Mode</p>
          )}
        </div>
      </footer>
    </div>
  );
}
