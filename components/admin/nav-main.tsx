"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    LayoutIcon,
    CalendarIcon,
    UserAddIcon,
    UserGroupIcon,
} from "@hugeicons/core-free-icons";

type NavigationItem = {
    title: string;
    url: string;
    icon: typeof LayoutIcon;
};

const navigationItems: NavigationItem[] = [
    {
        title: "Home",
        url: "/app/admin",
        icon: LayoutIcon,
    },
    {
        title: "Weddings",
        url: "/app/admin/weddings",
        icon: CalendarIcon,
    },
    {
        title: "Leads",
        url: "/app/admin/leads",
        icon: UserAddIcon,
    },
    {
        title: "Users",
        url: "/app/admin/users",
        icon: UserGroupIcon,
    },
];

export function NavMain() {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {navigationItems.map((item) => {
                        const isActive = pathname === item.url;
                        return (
                            <SidebarMenuItem
                                key={item.title}
                                className={
                                    isActive
                                        ? "bg-sidebar-accent group-data-[collapsible=icon]:bg-transparent"
                                        : ""
                                }
                            >
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    asChild
                                    isActive={isActive}
                                >
                                    <Link
                                        href={item.url}
                                        onClick={handleLinkClick}
                                    >
                                        <HugeiconsIcon
                                            icon={item.icon}
                                            className="h-5 w-5"
                                        />
                                        <span className="group-data-[collapsible=icon]:hidden">
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
