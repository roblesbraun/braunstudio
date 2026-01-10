import { QueryCtx, MutationCtx } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

/**
 * Authorization helpers for platform admin and wedding access control.
 * All authorization checks are enforced in Convex, not just in UI.
 */

/**
 * Assert that the user is authenticated.
 * Throws if not authenticated.
 */
export async function assertAuthenticated(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const userId = await auth.getUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

/**
 * Check if a user is a platform admin based on email allowlist.
 * Allowlist is stored in PLATFORM_ADMIN_EMAILS env var (comma-separated).
 */
export async function isPlatformAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  const userId = await auth.getUserId(ctx);
  if (!userId) {
    return false;
  }

  const user = await ctx.db.get(userId);
  if (!user?.email) {
    return false;
  }

  // Get allowlist from env var
  const allowlistEnv = process.env.PLATFORM_ADMIN_EMAILS || "";
  const allowlist = allowlistEnv
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.includes(user.email.toLowerCase());
}

/**
 * Assert that the current user is a platform admin.
 * Throws if not authenticated or not in allowlist.
 */
export async function assertPlatformAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const userId = await assertAuthenticated(ctx);
  const isAdmin = await isPlatformAdmin(ctx);

  if (!isAdmin) {
    throw new Error("Unauthorized: Platform admin access required");
  }

  return userId;
}

/**
 * Check if the current user has access to a wedding.
 * Access is granted if:
 * - User is a platform admin, OR
 * - User is a member of the wedding (via weddingMembers), OR
 * - User's email is in the wedding's coupleEmails
 */
export async function hasWeddingAccess(
  ctx: QueryCtx | MutationCtx,
  weddingId: Id<"weddings">
): Promise<boolean> {
  const userId = await auth.getUserId(ctx);
  if (!userId) {
    return false;
  }

  // Platform admins have access to all weddings
  if (await isPlatformAdmin(ctx)) {
    return true;
  }

  // Check membership table
  const membership = await ctx.db
    .query("weddingMembers")
    .withIndex("by_user_wedding", (q) =>
      q.eq("userId", userId).eq("weddingId", weddingId)
    )
    .unique();

  if (membership) {
    return true;
  }

  // Check email pre-assign
  const user = await ctx.db.get(userId);
  if (user?.email) {
    const wedding = await ctx.db.get(weddingId);
    if (wedding?.coupleEmails.includes(user.email)) {
      return true;
    }
  }

  return false;
}

/**
 * Assert that the current user has access to a wedding.
 * Throws if not authenticated or no access.
 */
export async function assertWeddingAccess(
  ctx: QueryCtx | MutationCtx,
  weddingId: Id<"weddings">
): Promise<Id<"users">> {
  const userId = await assertAuthenticated(ctx);
  const hasAccess = await hasWeddingAccess(ctx, weddingId);

  if (!hasAccess) {
    throw new Error("Unauthorized: You don't have access to this wedding");
  }

  return userId;
}
