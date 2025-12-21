"use client";

import * as React from "react";
import {
    MoreVerticalCircle01Icon,
    LogoutIcon,
    UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCurrentUser } from "@/lib/auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function NavUser() {
    const { isMobile, state } = useSidebar();
    const { signOut } = useAuthActions();
    const user = useCurrentUser();

    if (!user) {
        return null;
    }

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const userInitials = user.name
        ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : user.email
          ? user.email[0].toUpperCase()
          : "U";

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* Use render prop instead of asChild to avoid nested buttons */}
                            <DropdownMenuTrigger
                                render={
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    />
                                }
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {user.image && (
                                        <AvatarImage
                                            src={user.image}
                                            alt={
                                                user.name ||
                                                user.email ||
                                                "User"
                                            }
                                        />
                                    )}
                                    <AvatarFallback className="rounded-lg">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-medium">
                                        {user.name ||
                                            user.email ||
                                            "User"}
                                    </span>
                                    {user.email && (
                                        <span className="text-muted-foreground truncate text-xs">
                                            {user.email}
                                        </span>
                                    )}
                                </div>
                                <HugeiconsIcon
                                    icon={MoreVerticalCircle01Icon}
                                    className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden"
                                />
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent
                            side="right"
                            align="center"
                            hidden={state !== "collapsed" || isMobile}
                        >
                            {user.name || user.email || "User"}
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent
                        className="min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        {user.image && (
                                            <AvatarImage
                                                src={user.image}
                                                alt={
                                                    user.name ||
                                                    user.email ||
                                                    "User"
                                                }
                                            />
                                        )}
                                        <AvatarFallback className="rounded-lg">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">
                                            {user.name || user.email || "User"}
                                        </span>
                                        {user.email && (
                                            <span className="text-muted-foreground truncate text-xs">
                                                {user.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem disabled>
                                <HugeiconsIcon
                                    icon={UserIcon}
                                    className="h-4 w-4"
                                />
                                Account
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <HugeiconsIcon
                                icon={LogoutIcon}
                                className="h-4 w-4"
                            />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
