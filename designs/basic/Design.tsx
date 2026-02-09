import { WeddingDesignProps } from "../types";

function formatDate(date?: string): string | undefined {
  if (!date) return undefined;
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = months[parseInt(month, 10) - 1];
  return `${monthName} ${parseInt(day, 10)}, ${year}`;
}

export default function BasicDesign({
  wedding,
  features,
  media,
  rsvpConfig,
  giftOptions,
  isPreview,
}: WeddingDesignProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Custom Wedding Design
          </p>
          <h1 className="text-4xl font-semibold">{wedding.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {wedding.weddingDate && (
              <span>{formatDate(wedding.weddingDate)}</span>
            )}
            {wedding.venueName && (
              <span>
                {wedding.venueName}
                {wedding.venueLocation ? ` • ${wedding.venueLocation}` : ""}
              </span>
            )}
            {isPreview && <span className="text-primary">Preview Mode</span>}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Feature Flags</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <span
              className={`rounded-full px-3 py-1 ${
                features.rsvp ? "bg-primary/10 text-primary" : "bg-muted"
              }`}
            >
              RSVP {features.rsvp ? "Enabled" : "Disabled"}
            </span>
            <span
              className={`rounded-full px-3 py-1 ${
                features.gifts ? "bg-primary/10 text-primary" : "bg-muted"
              }`}
            >
              Gifts {features.gifts ? "Enabled" : "Disabled"}
            </span>
            <span
              className={`rounded-full px-3 py-1 ${
                features.whatsapp ? "bg-primary/10 text-primary" : "bg-muted"
              }`}
            >
              WhatsApp {features.whatsapp ? "Enabled" : "Disabled"}
            </span>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Media Library</h2>
          {media.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No media uploaded for this wedding.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => (
                <div
                  key={item._id}
                  className="rounded-lg border bg-card p-3"
                >
                  {item.url ? (
                    <img
                      src={item.url}
                      alt={item.metadata.alt || "Wedding media"}
                      className="h-40 w-full rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                      {item.mediaType.toUpperCase()}
                    </div>
                  )}
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="font-medium">{item.metadata.caption}</p>
                    {item.tags.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Tags: {item.tags.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {features.rsvp && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">RSVP Questions</h2>
            {!rsvpConfig || rsvpConfig.questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No RSVP questions configured.
              </p>
            ) : (
              <div className="space-y-6">
                {rsvpConfig.questions.map((question) => (
                  <div key={question.id} className="space-y-2">
                    <p className="font-medium">{question.prompt}</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {question.options.map((option) => (
                        <span
                          key={option.id}
                          className="rounded-full border px-3 py-1"
                        >
                          {option.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {features.gifts && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Gift Options</h2>
            {giftOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No gift options configured.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {giftOptions.map((gift) => (
                  <div key={gift._id} className="rounded-lg border bg-card p-4">
                    <p className="font-medium">{gift.label}</p>
                    <p className="text-sm text-muted-foreground">
                      ${(gift.amountCents / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
