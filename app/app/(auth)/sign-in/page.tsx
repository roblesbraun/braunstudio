"use client";

import { SignInForm } from "@/components/auth/sign-in-form";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { useCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function SignInPage() {
    return (
        <>
            <Authenticated>
                <AuthenticatedRedirect />
            </Authenticated>
            <Unauthenticated>
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-sm space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold">Sign In</h1>
                            <p className="text-muted-foreground">
                                Sign in to access your dashboard
                            </p>
                        </div>
                        <div className="border rounded-lg p-6">
                            <SignInForm />
                        </div>
                    </div>
                </main>
            </Unauthenticated>
        </>
    );
}

function AuthenticatedRedirect() {
    const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
    const user = useCurrentUser();
    const router = useRouter();
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Prevent multiple redirects
        if (hasRedirected.current) {
            return;
        }

        // Wait for auth state and user data to load
        if (authLoading || user === undefined) {
            return;
        }

        // If not authenticated, stay on sign-in (shouldn't happen in Authenticated component)
        if (!isAuthenticated) {
            return;
        }

        // If user is null or has no role, redirect to setup
        if (user === null || !user.role) {
            if (!hasRedirected.current) {
                hasRedirected.current = true;
                // Immediate redirect
                router.push("/app/setup");
            }
            return;
        }

        // User exists with a role - redirect based on role
        hasRedirected.current = true;
        if (user.role === "platform_admin") {
            window.location.href = "/app/admin";
        } else if (user.role === "couple") {
            window.location.href = "/app/couple";
        }
    }, [isAuthenticated, authLoading, user, router]);

    // Show loading spinner while determining where to redirect
    if (authLoading || user === undefined) {
        return (
            <main className="flex-1 flex items-center justify-center p-4">
                <Spinner className="size-8" />
            </main>
        );
    }

    // If we need to redirect, don't show any UI - redirect immediately
    if (user === null || !user.role) {
        // Return null to avoid flash of content, redirect is handled in useEffect
        return null;
    }

    // If user has a role, redirect is handled in useEffect
    // Return null to avoid flash of content
    return null;
}
