"use client";

import { WeddingTemplateProps } from "@/templates/types";

export default function ModernTemplateV1({
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
            {/* Hero Section - Full height with minimal design */}
            {sections.hero.enabled && (
                <section className="min-h-screen flex flex-col items-center justify-center px-4 relative">
                    <div className="text-center space-y-8 max-w-2xl">
                        <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground">
                            We&apos;re getting married
                        </p>
                        <h1 className="text-6xl md:text-8xl font-light tracking-tight">
                            {sections.hero.title || coupleNames}
                        </h1>
                        {wedding.weddingDate && (
                            <p className="text-xl font-light tracking-wide">
                                {new Date(
                                    wedding.weddingDate
                                ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        )}
                        {sections.hero.subtitle && (
                            <p className="text-muted-foreground max-w-md mx-auto">
                                {sections.hero.subtitle}
                            </p>
                        )}
                    </div>
                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-1">
                            <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-bounce" />
                        </div>
                    </div>
                </section>
            )}

            {/* Location Section */}
            {sections.location.enabled && (
                <section className="py-32 px-4 bg-secondary">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-4">
                                <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground">
                                    The Venue
                                </p>
                                <h2 className="text-4xl font-light">
                                    {sections.location.venueName ||
                                        "Ceremony & Reception"}
                                </h2>
                                {sections.location.address && (
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {sections.location.address}
                                    </p>
                                )}
                                {sections.location.notes && (
                                    <p className="text-sm text-muted-foreground border-l-2 border-primary pl-4">
                                        {sections.location.notes}
                                    </p>
                                )}
                            </div>
                            {sections.location.mapUrl && (
                                <div className="flex justify-center md:justify-end">
                                    <a
                                        href={sections.location.mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex items-center gap-3 px-8 py-4 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                                    >
                                        <span className="text-sm tracking-wide uppercase">
                                            Get Directions
                                        </span>
                                        <svg
                                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                                            />
                                        </svg>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Schedule Section */}
            {sections.itinerary.enabled &&
                sections.itinerary.events &&
                sections.itinerary.events.length > 0 && (
                    <section className="py-32 px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
                                    Timeline
                                </p>
                                <h2 className="text-4xl font-light">
                                    Schedule of Events
                                </h2>
                            </div>
                            <div className="space-y-0">
                                {sections.itinerary.events.map(
                                    (event, index) => (
                                        <div
                                            key={index}
                                            className="flex items-stretch border-b last:border-0"
                                        >
                                            <div className="w-32 py-8 text-right pr-8 border-r">
                                                <span className="text-lg font-light">
                                                    {event.time}
                                                </span>
                                            </div>
                                            <div className="flex-1 py-8 pl-8">
                                                <h3 className="text-lg font-medium">
                                                    {event.title}
                                                </h3>
                                                {event.description && (
                                                    <p className="text-muted-foreground mt-1">
                                                        {event.description}
                                                    </p>
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
                <section className="py-20 px-4 border-y">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2">
                                Attire
                            </p>
                            <p className="text-2xl font-light">
                                {sections.dressCode.code || "Dress Code"}
                            </p>
                        </div>
                        {sections.dressCode.description && (
                            <p className="text-muted-foreground max-w-sm text-center md:text-right">
                                {sections.dressCode.description}
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* Accommodations Section */}
            {sections.lodging.enabled &&
                sections.lodging.hotels &&
                sections.lodging.hotels.length > 0 && (
                    <section className="py-32 px-4 bg-secondary">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
                                    Stay
                                </p>
                                <h2 className="text-4xl font-light">
                                    Accommodations
                                </h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                {sections.lodging.hotels.map((hotel, index) => (
                                    <div
                                        key={index}
                                        className="bg-background p-8 space-y-4"
                                    >
                                        <h3 className="text-xl font-medium">
                                            {hotel.name}
                                        </h3>
                                        {hotel.address && (
                                            <p className="text-sm text-muted-foreground">
                                                {hotel.address}
                                            </p>
                                        )}
                                        {hotel.notes && (
                                            <p className="text-sm text-muted-foreground border-l-2 border-muted pl-4">
                                                {hotel.notes}
                                            </p>
                                        )}
                                        {hotel.url && (
                                            <a
                                                href={hotel.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block text-sm underline underline-offset-4 hover:text-primary"
                                            >
                                                Book your stay →
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
                <section className="py-32 px-4">
                    <div className="max-w-2xl mx-auto text-center space-y-8">
                        <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground">
                            Registry
                        </p>
                        <h2 className="text-4xl font-light">Gifts</h2>
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
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background hover:opacity-90 transition-opacity"
                                >
                                    <span className="text-sm tracking-wide uppercase">
                                        View Registry
                                    </span>
                                </a>
                            )}
                        {isPreview && (
                            <p className="text-sm text-yellow-600 bg-yellow-50 px-4 py-2 rounded">
                                Gift interactions disabled in preview mode
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* RSVP Section */}
            {sections.rsvp.enabled && (
                <section className="py-32 px-4 bg-foreground text-background">
                    <div className="max-w-2xl mx-auto text-center space-y-8">
                        <p className="text-sm tracking-[0.2em] uppercase opacity-70">
                            Your Response
                        </p>
                        <h2 className="text-5xl font-light">RSVP</h2>
                        {sections.rsvp.message && (
                            <p className="opacity-80">
                                {sections.rsvp.message}
                            </p>
                        )}
                        {sections.rsvp.deadline && (
                            <p className="text-sm opacity-60">
                                Kindly respond by{" "}
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
                            <button className="inline-flex items-center gap-3 px-10 py-4 bg-background text-foreground hover:opacity-90 transition-opacity">
                                <span className="text-sm tracking-wide uppercase">
                                    Respond Now
                                </span>
                            </button>
                        ) : (
                            <p className="text-sm text-yellow-300 bg-yellow-900/30 px-4 py-2 rounded inline-block">
                                RSVP disabled in preview mode
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="py-12 px-4 text-center">
                <p className="text-sm text-muted-foreground tracking-wide">
                    {coupleNames}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                    {wedding.weddingDate
                        ? new Date(wedding.weddingDate).toLocaleDateString(
                              "en-US",
                              {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                              }
                          )
                        : ""}
                </p>
            </footer>
        </div>
    );
}
