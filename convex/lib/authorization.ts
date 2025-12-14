import { QueryCtx, MutationCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id, Doc } from "../_generated/dataModel";

export type AuthContext = QueryCtx | MutationCtx;

/**
 * Get authenticated user or throw
 */
export async function requireAuth(ctx: AuthContext): Promise<Doc<"users">> {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
        throw new Error("Not authenticated");
    }
    const user = await ctx.db.get(userId);
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}

/**
 * Require platform admin role
 */
export async function requireAdmin(ctx: AuthContext): Promise<Doc<"users">> {
    const user = await requireAuth(ctx);
    if (user.role !== "platform_admin") {
        throw new Error("Not authorized - admin only");
    }
    return user;
}

/**
 * Require couple role
 */
export async function requireCouple(ctx: AuthContext): Promise<Doc<"users">> {
    const user = await requireAuth(ctx);
    if (user.role !== "couple") {
        throw new Error("Not authorized - couple only");
    }
    return user;
}

/**
 * Require couple to own a specific wedding
 */
export async function requireWeddingOwner(
    ctx: AuthContext,
    weddingId: Id<"weddings">
): Promise<{ user: Doc<"users">; wedding: Doc<"weddings"> }> {
    const user = await requireAuth(ctx);

    const wedding = await ctx.db.get(weddingId);
    if (!wedding) {
        throw new Error("Wedding not found");
    }

    // Admins can access any wedding
    if (user.role === "platform_admin") {
        return { user, wedding };
    }

    // Couples can only access their own wedding
    if (user.role === "couple" && user.weddingId === weddingId) {
        return { user, wedding };
    }

    throw new Error("Not authorized to access this wedding");
}

/**
 * Check if user can modify wedding content (admin only)
 */
export async function requireWeddingContentEditor(
    ctx: AuthContext,
    weddingId: Id<"weddings">
): Promise<{ user: Doc<"users">; wedding: Doc<"weddings"> }> {
    const user = await requireAdmin(ctx);
    const wedding = await ctx.db.get(weddingId);
    if (!wedding) {
        throw new Error("Wedding not found");
    }
    return { user, wedding };
}

/**
 * Get current user if authenticated (doesn't throw)
 */
export async function getCurrentUser(
    ctx: AuthContext
): Promise<Doc<"users"> | null> {
    const userId = await getAuthUserId(ctx);
    return userId !== null ? await ctx.db.get(userId) : null;
}

/**
 * Check if user has any role assigned
 */
export async function requireRoleAssigned(
    ctx: AuthContext
): Promise<Doc<"users">> {
    const user = await requireAuth(ctx);
    if (!user.role) {
        throw new Error("No role assigned to user");
    }
    return user;
}
