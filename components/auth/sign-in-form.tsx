"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon } from "@hugeicons/core-free-icons";

export function SignInForm() {
    const { signIn } = useAuthActions();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setError(null);
        setIsLoading(true);

        try {
            await signIn("google", { redirectTo: "/app/setup" });
            // Authentication state will update, triggering Authenticated component to show
            // The page-level AuthenticatedRedirect will handle role-based redirects
        } catch (err) {
            console.error("Google sign in error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Google authentication failed"
            );
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
            >
                {isLoading ? (
                    "Loading..."
                ) : (
                    <>
                        <HugeiconsIcon
                            icon={GoogleIcon}
                            className="mr-2 h-4 w-4"
                        />
                        Sign in with Google
                    </>
                )}
            </Button>

            {error && (
                <div className="text-sm text-destructive text-center">
                    {error}
                </div>
            )}
        </div>
    );
}
