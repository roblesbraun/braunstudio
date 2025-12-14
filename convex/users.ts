import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current authenticated user
export const current = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        return userId !== null ? await ctx.db.get(userId) : null;
    },
});

// Get user by ID
export const get = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        return await ctx.db.get(userId);
    },
});

// Update user profile
export const updateProfile = mutation({
    args: {
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Not authenticated");

        await ctx.db.patch(userId, {
            name: args.name,
        });
    },
});

// Admin-only: Update user role
export const updateRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.union(v.literal("platform_admin"), v.literal("couple")),
    },
    handler: async (ctx, { userId, role }) => {
        const currentUserId = await getAuthUserId(ctx);
        if (currentUserId === null) throw new Error("Not authenticated");

        const currentUser = await ctx.db.get(currentUserId);
        if (!currentUser || currentUser.role !== "platform_admin") {
            throw new Error("Not authorized - admin only");
        }

        await ctx.db.patch(userId, { role });
    },
});

// Admin-only: Assign wedding to couple
export const assignWedding = mutation({
    args: {
        userId: v.id("users"),
        weddingId: v.id("weddings"),
    },
    handler: async (ctx, { userId, weddingId }) => {
        const currentUserId = await getAuthUserId(ctx);
        if (currentUserId === null) throw new Error("Not authenticated");

        const currentUser = await ctx.db.get(currentUserId);
        if (!currentUser || currentUser.role !== "platform_admin") {
            throw new Error("Not authorized - admin only");
        }

        // Verify user is a couple
        const targetUser = await ctx.db.get(userId);
        if (!targetUser || targetUser.role !== "couple") {
            throw new Error("User must be a couple");
        }

        // Verify wedding exists
        const wedding = await ctx.db.get(weddingId);
        if (!wedding) {
            throw new Error("Wedding not found");
        }

        await ctx.db.patch(userId, { weddingId });
    },
});

// List all users (admin only)
export const list = query({
    args: {
        role: v.optional(
            v.union(v.literal("platform_admin"), v.literal("couple"))
        ),
    },
    handler: async (ctx, { role }) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Not authenticated");

        const user = await ctx.db.get(userId);
        if (!user || user.role !== "platform_admin") {
            throw new Error("Not authorized - admin only");
        }

        if (role) {
            return await ctx.db
                .query("users")
                .withIndex("by_role", (q) => q.eq("role", role))
                .collect();
        }

        return await ctx.db.query("users").collect();
    },
});

// Set first user as admin (for initial setup)
export const setInitialAdmin = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Not authenticated");

        // Check if there are any admins
        const existingAdmins = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "platform_admin"))
            .first();

        if (existingAdmins) {
            throw new Error("Admin already exists");
        }

        // Make current user an admin
        await ctx.db.patch(userId, { role: "platform_admin" });
        return { success: true };
    },
});

// Create a couple user (admin only)
export const createCouple = mutation({
    args: {
        email: v.string(),
        name: v.string(),
    },
    handler: async (ctx, { email, name }) => {
        const currentUserId = await getAuthUserId(ctx);
        if (currentUserId === null) throw new Error("Not authenticated");

        const currentUser = await ctx.db.get(currentUserId);
        if (!currentUser || currentUser.role !== "platform_admin") {
            throw new Error("Not authorized - admin only");
        }

        // Check if user with email already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Create new couple user
        const userId = await ctx.db.insert("users", {
            email,
            name,
            role: "couple",
        });

        return userId;
    },
});
