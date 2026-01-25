"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Heart,
    ListChecks,
    MapPin,
    BedDouble,
    Gift,
    Shirt,
    CalendarCheck,
    Camera,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavItem } from "@/templates/types";

interface WeddingNavbarProps {
    weddingName: string;
    navbarLogoLightUrl?: string;
    navbarLogoDarkUrl?: string;
    isPreview?: boolean;
    navItems?: NavItem[];
}

/**
 * Shared wedding navbar component.
 * Renders across all templates with logo/text fallback and section navigation.
 *
 * Navigation behavior:
 * - Desktop: top sticky bar with nav links split left/right of logo
 * - Mobile: top bar (logo only) + fixed bottom nav bar with icons
 * - Nav items are derived from enabledSections + sectionContent titles
 * - Smooth scroll to sections on click
 * - Active section highlighting based on scroll position
 *
 * Logo behavior:
 * - Uses theme-specific logos (light/dark)
 * - Falls back to other theme's logo if current theme logo missing
 * - Falls back to wedding name + heart icon if no logos
 * - In preview mode: offset from top to account for PreviewBanner
 */
export function WeddingNavbar({
    weddingName,
    navbarLogoLightUrl,
    navbarLogoDarkUrl,
    isPreview = false,
    navItems = [],
}: WeddingNavbarProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [activeSection, setActiveSection] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    // Pick the appropriate logo based on current theme with fallback
    const currentLogoUrl = mounted
        ? resolvedTheme === "dark"
            ? navbarLogoDarkUrl || navbarLogoLightUrl // dark mode: prefer dark, fallback to light
            : navbarLogoLightUrl || navbarLogoDarkUrl // light mode: prefer light, fallback to dark
        : navbarLogoLightUrl || navbarLogoDarkUrl; // SSR: use whichever is available

    const showLogo = currentLogoUrl && !imageError;

    // Scroll spy: track active section
    useEffect(() => {
        if (navItems.length === 0) return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;

            for (const item of navItems) {
                const sectionId = item.href.replace("#", "");
                const element = document.getElementById(sectionId);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (
                        scrollPosition >= offsetTop &&
                        scrollPosition < offsetTop + offsetHeight
                    ) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [navItems]);

    // Smooth scroll handler
    const handleClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        e.preventDefault();
        const targetId = href.replace("#", "");
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Map section keys to icons for mobile navbar
    const sectionIcons: Record<
        string,
        React.ComponentType<{ className?: string }>
    > = {
        itinerary: ListChecks,
        photos: Camera,
        location: MapPin,
        lodging: BedDouble,
        dressCode: Shirt,
        gifts: Gift,
        rsvp: CalendarCheck,
    };

    // Split nav items for desktop layout (left and right of logo)
    const midpoint = Math.ceil(navItems.length / 2);
    const leftNavItems = navItems.slice(0, midpoint);
    const rightNavItems = navItems.slice(midpoint);

    return (
        <>
            {/* Top navigation bar - desktop and mobile */}
            <nav
                className={`sticky ${isPreview ? "top-10" : "top-0"} z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60`}
            >
                <div className="container mx-auto flex h-16 items-center justify-center px-4 relative">
                    {/* Left navigation items - desktop only */}
                    {leftNavItems.length > 0 && (
                        <div className="hidden md:flex items-center gap-4 mr-8">
                            {leftNavItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => handleClick(e, item.href)}
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-primary",
                                        activeSection === item.key
                                            ? "text-primary"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Center logo/name */}
                    <button
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        {showLogo ? (
                            <img
                                src={currentLogoUrl}
                                alt={weddingName}
                                onError={() => setImageError(true)}
                                className="h-14 max-w-[280px] object-contain sm:max-w-[400px] md:h-16 md:max-w-[450px]"
                            />
                        ) : (
                            <>
                                <Heart className="h-6 w-6 fill-primary text-primary" />
                                <span className="text-xl font-sans font-semibold">
                                    {weddingName}
                                </span>
                            </>
                        )}
                    </button>

                    {/* Right navigation items - desktop only */}
                    {rightNavItems.length > 0 && (
                        <div className="hidden md:flex items-center gap-4 ml-8">
                            {rightNavItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => handleClick(e, item.href)}
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-primary",
                                        activeSection === item.key
                                            ? "text-primary"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Theme toggle - desktop only */}
                    <div className="hidden md:flex items-center ml-4">
                        <ThemeToggle />
                    </div>

                    {/* Mobile theme toggle */}
                    <div className="md:hidden absolute right-4">
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            {/* Bottom navigation bar - mobile only */}
            {navItems.length > 0 && (
                <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                    <div className="flex justify-around items-center h-16 px-2">
                        {navItems.map((item) => {
                            const isActive = activeSection === item.key;
                            const Icon = sectionIcons[item.key];
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => handleClick(e, item.href)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-md transition-colors min-w-0 flex-1",
                                        isActive
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-primary",
                                    )}
                                >
                                    {Icon && (
                                        <Icon className="h-5 w-5 shrink-0" />
                                    )}
                                    <span className="text-[10px] font-medium leading-none text-center">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}
        </>
    );
}
