"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const SESSION_STORAGE_KEY = "guest_session";

interface GuestSession {
    weddingId: string;
    sessionToken: string;
    phone: string;
    guestName: string;
}

/**
 * Hook for guest authentication
 */
export function useGuestAuth(weddingId: Id<"weddings"> | undefined) {
    const [session, setSession] = useState<GuestSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load session from storage on mount
    useEffect(() => {
        if (!weddingId) {
            setIsLoading(false);
            return;
        }

        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as GuestSession;
                if (parsed.weddingId === weddingId) {
                    setSession(parsed);
                }
            } catch {
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, [weddingId]);

    // Validate session with server
    const validatedSession = useQuery(
        api.guestAuth.validateSession,
        session && weddingId
            ? { weddingId, sessionToken: session.sessionToken }
            : "skip"
    );

    // Clear invalid session
    useEffect(() => {
        if (session && validatedSession === null) {
            setSession(null);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, [session, validatedSession]);

    const login = useCallback(
        (sessionToken: string, phone: string, guestName: string) => {
            if (!weddingId) return;

            const newSession: GuestSession = {
                weddingId,
                sessionToken,
                phone,
                guestName,
            };

            setSession(newSession);
            sessionStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify(newSession)
            );
        },
        [weddingId]
    );

    const logout = useCallback(() => {
        setSession(null);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }, []);

    return {
        session: validatedSession ? session : null,
        guestInfo: validatedSession,
        isAuthenticated: !!validatedSession,
        isLoading: isLoading || validatedSession === undefined,
        login,
        logout,
    };
}

/**
 * Request OTP for guest authentication
 */
export async function requestGuestOtp(
    convexUrl: string,
    weddingId: string,
    phone: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(`${convexUrl}/guest/otp/request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weddingId, phone }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || "Failed to send OTP",
            };
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}

/**
 * Verify OTP and get session token
 */
export async function verifyGuestOtp(
    convexUrl: string,
    weddingId: string,
    phone: string,
    code: string
): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
    try {
        const response = await fetch(`${convexUrl}/guest/otp/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weddingId, phone, code }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || "Verification failed",
            };
        }

        return { success: true, sessionToken: data.sessionToken };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}
