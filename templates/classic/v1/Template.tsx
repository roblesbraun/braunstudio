"use client";

import { WeddingTemplateProps } from "@/templates/types";

export default function ClassicTemplateV1({
    wedding,
    renderMode,
}: WeddingTemplateProps) {
    const { sections, theme } = wedding;
    const isPreview = renderMode === "preview";

    const coupleNames =
        wedding.partner1Name && wedding.partner2Name
            ? `${wedding.partner1Name} & ${wedding.partner2Name}`
            : wedding.partner1Name || wedding.partner2Name || "Our Wedding";

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            {sections.hero.enabled && (
                <section className="relative py-32 px-4 text-center bg-secondary">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h1 className="text-5xl md:text-6xl font-serif">
                            {sections.hero.title || coupleNames}
                        </h1>
                        {sections.hero.subtitle && (
                            <p className="text-xl text-muted-foreground">
                                {sections.hero.subtitle}
                            </p>
                        )}
                        {wedding.weddingDate && (
                            <p className="text-2xl font-light">
                                {new Date(
                                    wedding.weddingDate
                                ).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* Location Section */}
            {sections.location.enabled && (
                <section className="py-20 px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl font-serif">Location</h2>
                        {sections.location.venueName && (
                            <h3 className="text-xl font-medium">
                                {sections.location.venueName}
                            </h3>
                        )}
                        {sections.location.address && (
                            <p className="text-muted-foreground whitespace-pre-line">
                                {sections.location.address}
                            </p>
                        )}
                        {sections.location.notes && (
                            <p className="text-sm text-muted-foreground">
                                {sections.location.notes}
                            </p>
                        )}
                        {sections.location.mapUrl && (
                            <a
                                href={sections.location.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-6 py-2 border rounded-full hover:bg-muted transition-colors"
                            >
                                View Map
                            </a>
                        )}
                    </div>
                </section>
            )}

            {/* Itinerary Section */}
            {sections.itinerary.enabled &&
                sections.itinerary.events &&
                sections.itinerary.events.length > 0 && (
                    <section className="py-20 px-4 bg-secondary">
                        <div className="max-w-3xl mx-auto text-center space-y-8">
                            <h2 className="text-3xl font-serif">Schedule</h2>
                            <div className="space-y-6">
                                {sections.itinerary.events.map(
                                    (event, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-4 text-left max-w-md mx-auto"
                                        >
                                            <div className="font-medium w-24 text-right">
                                                {event.time}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {event.title}
                                                </div>
                                                {event.description && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {event.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </section>
                )}

            {/* Dress Code Section */}
            {sections.dressCode.enabled && (
                <section className="py-20 px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-4">
                        <h2 className="text-3xl font-serif">Dress Code</h2>
                        {sections.dressCode.code && (
                            <p className="text-xl font-medium">
                                {sections.dressCode.code}
                            </p>
                        )}
                        {sections.dressCode.description && (
                            <p className="text-muted-foreground">
                                {sections.dressCode.description}
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* Lodging Section */}
            {sections.lodging.enabled &&
                sections.lodging.hotels &&
                sections.lodging.hotels.length > 0 && (
                    <section className="py-20 px-4 bg-secondary">
                        <div className="max-w-3xl mx-auto text-center space-y-8">
                            <h2 className="text-3xl font-serif">
                                Accommodations
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {sections.lodging.hotels.map((hotel, index) => (
                                    <div
                                        key={index}
                                        className="p-6 bg-background rounded-lg border"
                                    >
                                        <h3 className="font-medium mb-2">
                                            {hotel.name}
                                        </h3>
                                        {hotel.address && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {hotel.address}
                                            </p>
                                        )}
                                        {hotel.notes && (
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {hotel.notes}
                                            </p>
                                        )}
                                        {hotel.url && (
                                            <a
                                                href={hotel.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Book Now
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

            {/* Gifts Section */}
            {sections.gifts.enabled && (
                <section className="py-20 px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl font-serif">Gifts</h2>
                        {sections.gifts.message && (
                            <p className="text-muted-foreground whitespace-pre-line">
                                {sections.gifts.message}
                            </p>
                        )}
                        {wedding.giftsMode === "external" &&
                            sections.gifts.externalUrl &&
                            !isPreview && (
                                <a
                                    href={sections.gifts.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                                >
                                    View Registry
                                </a>
                            )}
                        {wedding.giftsMode === "internal" && !isPreview && (
                            <p className="text-sm text-muted-foreground">
                                Gift registry coming soon
                            </p>
                        )}
                        {isPreview && (
                            <p className="text-sm text-yellow-600">
                                Gift interactions disabled in preview mode
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* RSVP Section */}
            {sections.rsvp.enabled && (
                <section className="py-20 px-4 bg-secondary">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl font-serif">RSVP</h2>
                        {sections.rsvp.message && (
                            <p className="text-muted-foreground">
                                {sections.rsvp.message}
                            </p>
                        )}
                        {sections.rsvp.deadline && (
                            <p className="text-sm text-muted-foreground">
                                Please respond by{" "}
                                {new Date(
                                    sections.rsvp.deadline
                                ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        )}
                        {!isPreview ? (
                            <button className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity">
                                RSVP Now
                            </button>
                        ) : (
                            <p className="text-sm text-yellow-600">
                                RSVP disabled in preview mode
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="py-8 px-4 text-center border-t">
                <p className="text-sm text-muted-foreground">
                    {coupleNames} •{" "}
                    {wedding.weddingDate
                        ? new Date(wedding.weddingDate).getFullYear()
                        : new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
}
