"use client";

import { useEffect, useState } from "react";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface WeddingCountdownProps {
  weddingDate?: string; // yyyy-MM-dd format
}

/**
 * Live countdown to wedding date.
 * Updates every second, uses viewer's local timezone.
 * Fails silently on invalid/missing dates.
 */
export function WeddingCountdown({ weddingDate }: WeddingCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    // Validate date format and parse
    if (!weddingDate || !/^\d{4}-\d{2}-\d{2}$/.test(weddingDate)) {
      return; // Invalid or missing date - fail silently
    }

    const calculateTimeRemaining = (): TimeRemaining | null => {
      // Parse wedding date at midnight in viewer's local timezone
      const [year, month, day] = weddingDate.split("-").map(Number);
      const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const now = new Date();

      // Check if wedding date is today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      if (targetDate.getTime() === todayStart.getTime()) {
        setIsToday(true);
        return null;
      }

      // Check if wedding date is in the past
      if (targetDate < todayStart) {
        return null; // Past date - don't render
      }

      // Calculate time remaining
      const diff = targetDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Initial calculation
    const initial = calculateTimeRemaining();
    setTimeRemaining(initial);

    // Update every second
    const interval = setInterval(() => {
      const updated = calculateTimeRemaining();
      setTimeRemaining(updated);
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [weddingDate]);

  // Don't render if no valid countdown or past date
  if (isToday) {
    return (
      <section className="relative min-h-screen py-20">
        {/* Background panel with rounded top corners */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-background rounded-t-4xl border border-border"
        />

        {/* Content wrapper */}
        <div className="relative z-10 container mx-auto px-4 flex items-center justify-center min-h-screen">
          <h2 className="font-sans text-5xl font-bold sm:text-6xl md:text-7xl text-center">
            Today&apos;s the Day!
          </h2>
        </div>
      </section>
    );
  }

  if (!timeRemaining) {
    return null;
  }

  return (
    <section className="relative min-h-screen py-20">
      {/* Background panel with rounded top corners */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-background rounded-t-4xl border border-border"
      />

      {/* Content wrapper */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-sans text-4xl font-bold sm:text-5xl">
              Countdown to Our Wedding
            </h2>
          </div>

          {/* Countdown grid - stable layout with tabular-nums to prevent shifting */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 sm:p-8">
              <div className="text-5xl font-bold tabular-nums sm:text-6xl md:text-7xl">
                {timeRemaining.days}
              </div>
              <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground sm:text-base">
                Days
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 sm:p-8">
              <div className="text-5xl font-bold tabular-nums sm:text-6xl md:text-7xl">
                {String(timeRemaining.hours).padStart(2, "0")}
              </div>
              <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground sm:text-base">
                Hours
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 sm:p-8">
              <div className="text-5xl font-bold tabular-nums sm:text-6xl md:text-7xl">
                {String(timeRemaining.minutes).padStart(2, "0")}
              </div>
              <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground sm:text-base">
                Minutes
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-6 sm:p-8">
              <div className="text-5xl font-bold tabular-nums sm:text-6xl md:text-7xl">
                {String(timeRemaining.seconds).padStart(2, "0")}
              </div>
              <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground sm:text-base">
                Seconds
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
