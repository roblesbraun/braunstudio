"use client";

import { useCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function SetupPage() {
    const user = useCurrentUser();
    const router = useRouter();
    const setInitialAdmin = useMutation(api.users.setInitialAdmin);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("[SetupPage] User state changed:", {
            user,
            isNull: user === null,
            isUndefined: user === undefined,
            hasUser: !!user,
            userRole: user?.role,
        });

        // Give query time to load - don't redirect immediately if undefined
        if (user === undefined) {
            return; // Still loading
        }

        if (user === null) {
            // Wait a bit - might be a timing issue after sign-in
            const timeout = setTimeout(() => {
                console.log(
                    "[SetupPage] User is null after delay, redirecting to sign-in"
                );
                router.push("/app/sign-in");
            }, 500);
            return () => clearTimeout(timeout);
        }

        if (user && user.role) {
            // Already has a role
            console.log("[SetupPage] User has role, redirecting:", user.role);
            if (user.role === "platform_admin") {
                router.push("/app/admin");
            } else {
                router.push("/app/couple");
            }
        } else if (user && !user.role) {
            console.log(
                "[SetupPage] User authenticated but no role - showing setup UI"
            );
        }
    }, [user, router]);

    const handleBecomeAdmin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await setInitialAdmin();
            router.push("/app/admin");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to set up admin"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Loading
    if (user === undefined) {
        return (
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="text-muted-foreground">Loading...</div>
            </main>
        );
    }

    // Not authenticated or already has role
    if (!user || user.role) {
        return null;
    }

    return (
        <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6 text-center">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Welcome!</h1>
                    <p className="text-muted-foreground">
                        You&apos;re signed in but don&apos;t have a role
                        assigned yet.
                    </p>
                </div>

                <div className="border rounded-lg p-6 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        If you&apos;re the first user setting up this platform,
                        you can become the platform administrator.
                    </p>

                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}

                    <Button
                        onClick={handleBecomeAdmin}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? "Setting up..." : "Become Platform Admin"}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                        If an admin already exists, contact them to assign you a
                        role.
                    </p>
                </div>
            </div>
        </main>
    );
}
