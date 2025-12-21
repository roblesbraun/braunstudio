"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserButton } from "@/components/auth/user-button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    LayoutIcon,
    CalendarIcon,
    UserAddIcon,
    UserGroupIcon,
} from "@hugeicons/core-free-icons";

const navigation = [
    {
        name: "Home",
        href: "/admin",
        icon: LayoutIcon,
    },
    {
        name: "Weddings",
        href: "/admin/weddings",
        icon: CalendarIcon,
    },
    {
        name: "Leads",
        href: "/admin/leads",
        icon: UserAddIcon,
    },
    {
        name: "Users",
        href: "/admin/users",
        icon: UserGroupIcon,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-muted/40">
            <div className="flex h-16 items-center border-b px-6">
                <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <HugeiconsIcon
                                icon={item.icon}
                                className="h-5 w-5"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t p-4">
                <UserButton />
            </div>
        </div>
    );
}
