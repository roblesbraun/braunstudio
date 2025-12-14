"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

/**
 * Hook to get the current authenticated user
 */
export function useCurrentUser() {
    const result = useQuery(api.users.current);
    return result;
}

/**
 * Hook to check if current user is an admin
 */
export function useIsAdmin() {
    const user = useCurrentUser();
    return user?.role === "platform_admin";
}

/**
 * Hook to check if current user is a couple
 */
export function useIsCouple() {
    const user = useCurrentUser();
    return user?.role === "couple";
}

/**
 * Hook to check if current user has a role assigned
 */
export function useHasRole() {
    const user = useCurrentUser();
    return user?.role !== undefined && user?.role !== null;
}
