"use client";

import { ReactNode } from "react";
import { useCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserButton } from "@/components/auth/user-button";

export default function CoupleLayout({ children }: { children: ReactNode }) {
    const user = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        // Redirect if not authenticated
        if (user === null) {
            router.push("/sign-in");
        } else if (user && user.role === "platform_admin") {
            // Admin should use admin dashboard
            router.push("/admin");
        }
    }, [user, router]);

    // Loading state
    if (user === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    // Not authorized
    if (!user || user.role !== "couple") {
        return null;
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col">
                <div className="font-semibold mb-4">My Wedding</div>
                <nav className="space-y-2 flex-1">
                    <a
                        href="/couple"
                        className="block px-2 py-1.5 rounded hover:bg-muted"
                    >
                        Overview
                    </a>
                    <a
                        href="/couple/guests"
                        className="block px-2 py-1.5 rounded hover:bg-muted"
                    >
                        Guests
                    </a>
                    <a
                        href="/couple/rsvps"
                        className="block px-2 py-1.5 rounded hover:bg-muted"
                    >
                        RSVPs
                    </a>
                    <a
                        href="/couple/gifts"
                        className="block px-2 py-1.5 rounded hover:bg-muted"
                    >
                        Gifts
                    </a>
                    <a
                        href="/couple/settings"
                        className="block px-2 py-1.5 rounded hover:bg-muted"
                    >
                        Settings
                    </a>
                </nav>
                <div className="pt-4 border-t">
                    <UserButton />
                </div>
            </aside>
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}
