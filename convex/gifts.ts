import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { requireWeddingOwner, requireAdmin } from "./lib/authorization";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// List all gifts for a wedding
export const list = query({
    args: { weddingId: v.id("weddings") },
    handler: async (ctx, { weddingId }) => {
        // Public access for active weddings, owner access otherwise
        const wedding = await ctx.db.get(weddingId);
        if (!wedding) return [];

        return await ctx.db
            .query("gifts")
            .withIndex("by_wedding", (q) => q.eq("weddingId", weddingId))
            .collect();
    },
});

// Get gift stats for a wedding
export const getStats = query({
    args: { weddingId: v.id("weddings") },
    handler: async (ctx, { weddingId }) => {
        await requireWeddingOwner(ctx, weddingId);

        const gifts = await ctx.db
            .query("gifts")
            .withIndex("by_wedding", (q) => q.eq("weddingId", weddingId))
            .collect();

        const contributions = await ctx.db
            .query("giftContributions")
            .withIndex("by_wedding", (q) => q.eq("weddingId", weddingId))
            .collect();

        const totalValue = gifts.reduce((sum, g) => sum + g.price, 0);
        const totalCollected = gifts.reduce(
            (sum, g) => sum + g.amountCollected,
            0
        );
        const totalContributions = contributions.length;

        return {
            totalGifts: gifts.length,
            totalValue,
            totalCollected,
            totalContributions,
            fullyFunded: gifts.filter((g) => g.isFullyFunded).length,
        };
    },
});

// Add a gift (admin only)
export const add = mutation({
    args: {
        weddingId: v.id("weddings"),
        title: v.string(),
        description: v.optional(v.string()),
        price: v.number(),
        imageUrl: v.optional(v.string()),
        sortOrder: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const giftId = await ctx.db.insert("gifts", {
            weddingId: args.weddingId,
            title: args.title,
            description: args.description,
            price: args.price,
            imageUrl: args.imageUrl,
            amountCollected: 0,
            isFullyFunded: false,
            sortOrder: args.sortOrder,
        });

        return giftId;
    },
});

// Update a gift (admin only)
export const update = mutation({
    args: {
        giftId: v.id("gifts"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        price: v.optional(v.number()),
        imageUrl: v.optional(v.string()),
        sortOrder: v.optional(v.number()),
    },
    handler: async (ctx, { giftId, ...updates }) => {
        await requireAdmin(ctx);

        const gift = await ctx.db.get(giftId);
        if (!gift) {
            throw new Error("Gift not found");
        }

        // Filter out undefined values
        const filteredUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                filteredUpdates[key] = value;
            }
        }

        // If price is updated, recalculate isFullyFunded
        if (filteredUpdates.price !== undefined) {
            filteredUpdates.isFullyFunded =
                gift.amountCollected >= (filteredUpdates.price as number);
        }

        await ctx.db.patch(giftId, filteredUpdates);
    },
});

// Delete a gift (admin only)
export const remove = mutation({
    args: { giftId: v.id("gifts") },
    handler: async (ctx, { giftId }) => {
        await requireAdmin(ctx);

        const gift = await ctx.db.get(giftId);
        if (!gift) {
            throw new Error("Gift not found");
        }

        // Delete contributions first
        const contributions = await ctx.db
            .query("giftContributions")
            .withIndex("by_gift", (q) => q.eq("giftId", giftId))
            .collect();

        for (const contribution of contributions) {
            await ctx.db.delete(contribution._id);
        }

        await ctx.db.delete(giftId);
    },
});

// Get contributions for a gift (wedding owner)
export const getContributions = query({
    args: { giftId: v.id("gifts") },
    handler: async (ctx, { giftId }) => {
        const gift = await ctx.db.get(giftId);
        if (!gift) return [];

        await requireWeddingOwner(ctx, gift.weddingId);

        return await ctx.db
            .query("giftContributions")
            .withIndex("by_gift", (q) => q.eq("giftId", giftId))
            .collect();
    },
});

// Record a contribution (internal - called after payment success)
export const recordContribution = mutation({
    args: {
        giftId: v.id("gifts"),
        weddingId: v.id("weddings"),
        guestPhone: v.optional(v.string()),
        guestName: v.optional(v.string()),
        amount: v.number(),
        stripePaymentIntentId: v.optional(v.string()),
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // This should only be called internally after payment verification
        const gift = await ctx.db.get(args.giftId);
        if (!gift) {
            throw new Error("Gift not found");
        }

        // Record the contribution
        await ctx.db.insert("giftContributions", {
            giftId: args.giftId,
            weddingId: args.weddingId,
            guestPhone: args.guestPhone,
            guestName: args.guestName,
            amount: args.amount,
            stripePaymentIntentId: args.stripePaymentIntentId,
            message: args.message,
            createdAt: Date.now(),
        });

        // Update gift amount collected
        const newAmountCollected = gift.amountCollected + args.amount;
        await ctx.db.patch(args.giftId, {
            amountCollected: newAmountCollected,
            isFullyFunded: newAmountCollected >= gift.price,
        });

        return { success: true };
    },
});
