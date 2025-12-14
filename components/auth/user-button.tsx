"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function UserButton() {
    const { signOut } = useAuthActions();
    const user = useCurrentUser();

    if (!user) {
        return null;
    }

    return (
        <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
                {user.name || user.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
                Sign Out
            </Button>
        </div>
    );
}
