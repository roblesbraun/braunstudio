"use client";

import { ReactNode } from "react";
import { useCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "@/components/admin/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

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
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                </header>
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <div className="px-4 lg:px-6">{children}</div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
