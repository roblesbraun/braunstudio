"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";

type AuthFlow = "signIn" | "signUp";

export function SignInForm() {
    const { signIn } = useAuthActions();
    const [flow, setFlow] = useState<AuthFlow>("signIn");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            await signIn("password", formData, { redirectTo: "/app/setup" });
            // Authentication state will update, triggering Authenticated component to show
            // The page-level AuthenticatedRedirect will handle role-based redirects
        } catch (err) {
            console.error("Sign in error:", err);
            setError(
                err instanceof Error ? err.message : "Authentication failed"
            );
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="flow" type="hidden" value={flow} />
            {flow === "signUp" && (
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                    >
                        <HugeiconsIcon
                            icon={showPassword ? ViewOffIcon : ViewIcon}
                            className="h-4 w-4"
                        />
                    </button>
                </div>
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                    ? "Loading..."
                    : flow === "signIn"
                      ? "Sign In"
                      : "Sign Up"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
                {flow === "signIn" ? (
                    <>
                        Don&apos;t have an account?{" "}
                        <button
                            type="button"
                            onClick={() => setFlow("signUp")}
                            className="text-primary hover:underline"
                        >
                            Sign up
                        </button>
                    </>
                ) : (
                    <>
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => setFlow("signIn")}
                            className="text-primary hover:underline"
                        >
                            Sign in
                        </button>
                    </>
                )}
            </div>
        </form>
    );
}
