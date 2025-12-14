"use client";

import { ReactNode } from "react";
import { useCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserButton } from "@/components/auth/user-button";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const user = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        // Redirect if not authenticated or not admin
        if (user === null) {
            router.push("/sign-in");
        } else if (user && user.role !== "platform_admin") {
            router.push("/couple");
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
    if (!user || user.role !== "platform_admin") {
        return null;
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col">
                <div className="font-semibold mb-4">Admin Dashboard</div>
                <nav className="space-y-2 flex-1">
                    <a
                        href="/admin"
                        className="block px-2 py-1.5 rounded hover:bg-muted"
                    >
                        Weddings
                    </a>
                    <a
                        href="/admin/leads"
                        className="block px-2 py-1.5 rounded hover:bg-muted"
                    >
                        Leads
                    </a>
                    <a
                        href="/admin/users"
                        className="block px-2 py-1.5 rounded hover:bg-muted"
                    >
                        Users
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
