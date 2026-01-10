import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { assertPlatformAdmin, assertAuthenticated } from "./authz";

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all members for a wedding (admin only)
 */
export const listForWedding = query({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const members = await ctx.db
      .query("weddingMembers")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
      .collect();

    // Enrich with user info
    const enriched = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          user: user
            ? { name: user.name, email: user.email, image: user.image }
            : null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Check if current user has access to a wedding
 */
export const checkAccess = query({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    const userId = await assertAuthenticated(ctx);

    // Check membership table
    const membership = await ctx.db
      .query("weddingMembers")
      .withIndex("by_user_wedding", (q) =>
        q.eq("userId", userId).eq("weddingId", args.weddingId)
      )
      .unique();

    if (membership) {
      return { hasAccess: true, role: membership.role };
    }

    // Check email pre-assign
    const user = await ctx.db.get(userId);
    if (user?.email) {
      const wedding = await ctx.db.get(args.weddingId);
      if (wedding?.coupleEmails.includes(user.email)) {
        return { hasAccess: true, role: "couple" as const };
      }
    }

    return { hasAccess: false, role: null };
  },
});

/**
 * Get current user's role for a wedding
 */
export const getRole = query({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    const userId = await assertAuthenticated(ctx);

    // Check membership table first
    const membership = await ctx.db
      .query("weddingMembers")
      .withIndex("by_user_wedding", (q) =>
        q.eq("userId", userId).eq("weddingId", args.weddingId)
      )
      .unique();

    if (membership) {
      return membership.role;
    }

    // Check email pre-assign
    const user = await ctx.db.get(userId);
    if (user?.email) {
      const wedding = await ctx.db.get(args.weddingId);
      if (wedding?.coupleEmails.includes(user.email)) {
        return "couple" as const;
      }
    }

    return null;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a member to a wedding (admin only)
 */
export const addMember = mutation({
  args: {
    weddingId: v.id("weddings"),
    userId: v.id("users"),
    role: v.union(v.literal("couple"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    // Check if membership already exists
    const existing = await ctx.db
      .query("weddingMembers")
      .withIndex("by_user_wedding", (q) =>
        q.eq("userId", args.userId).eq("weddingId", args.weddingId)
      )
      .unique();

    if (existing) {
      throw new Error("User is already a member of this wedding");
    }

    const memberId = await ctx.db.insert("weddingMembers", {
      weddingId: args.weddingId,
      userId: args.userId,
      role: args.role,
      createdAt: Date.now(),
    });

    return memberId;
  },
});

/**
 * Remove a member from a wedding (admin only)
 */
export const removeMember = mutation({
  args: { id: v.id("weddingMembers") },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const member = await ctx.db.get(args.id);
    if (!member) {
      throw new Error("Member not found");
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Link current user to a wedding (post-login linking)
 * This is called when a user with a pre-assigned email logs in
 */
export const linkCurrentUser = mutation({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    const userId = await assertAuthenticated(ctx);

    const user = await ctx.db.get(userId);
    if (!user?.email) {
      throw new Error("User has no email");
    }

    const wedding = await ctx.db.get(args.weddingId);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    // Verify user's email is in coupleEmails
    if (!wedding.coupleEmails.includes(user.email)) {
      throw new Error("You are not authorized to access this wedding");
    }

    // Check if already linked
    const existing = await ctx.db
      .query("weddingMembers")
      .withIndex("by_user_wedding", (q) =>
        q.eq("userId", userId).eq("weddingId", args.weddingId)
      )
      .unique();

    if (existing) {
      return existing._id; // Already linked
    }

    // Create membership
    const memberId = await ctx.db.insert("weddingMembers", {
      weddingId: args.weddingId,
      userId: userId,
      role: "couple",
      createdAt: Date.now(),
    });

    return memberId;
  },
});

/**
 * Update member role (admin only)
 */
export const updateRole = mutation({
  args: {
    id: v.id("weddingMembers"),
    role: v.union(v.literal("couple"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const member = await ctx.db.get(args.id);
    if (!member) {
      throw new Error("Member not found");
    }

    await ctx.db.patch(args.id, { role: args.role });
    return args.id;
  },
});

