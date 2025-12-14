import { v } from "convex/values";
import {
    mutation,
    query,
    internalMutation,
    internalQuery,
} from "./_generated/server";

// Update wedding's Stripe Connect status (internal - called by stripeActions)
export const updateConnectStatus = internalMutation({
    args: {
        weddingId: v.id("weddings"),
        stripeAccountId: v.optional(v.string()),
        stripeConnectStatus: v.union(
            v.literal("not_connected"),
            v.literal("pending"),
            v.literal("active"),
            v.literal("restricted")
        ),
    },
    handler: async (
        ctx,
        { weddingId, stripeAccountId, stripeConnectStatus }
    ) => {
        const wedding = await ctx.db.get(weddingId);
        if (!wedding) {
            throw new Error("Wedding not found");
        }

        await ctx.db.patch(weddingId, {
            stripeAccountId,
            stripeConnectStatus,
        });
    },
});

// Internal queries for actions
export const getWeddingForStripe = internalQuery({
    args: { weddingId: v.id("weddings") },
    handler: async (ctx, { weddingId }) => {
        return await ctx.db.get(weddingId);
    },
});

export const getGiftForStripe = internalQuery({
    args: { giftId: v.id("gifts") },
    handler: async (ctx, { giftId }) => {
        return await ctx.db.get(giftId);
    },
});

// Handle successful payment (called by webhook via HTTP handler)
export const handlePaymentSuccess = mutation({
    args: {
        paymentIntentId: v.string(),
        weddingId: v.id("weddings"),
        giftId: v.id("gifts"),
        amount: v.number(),
        guestName: v.optional(v.string()),
        guestPhone: v.optional(v.string()),
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Verify the gift exists
        const gift = await ctx.db.get(args.giftId);
        if (!gift || gift.weddingId !== args.weddingId) {
            throw new Error("Gift not found");
        }

        // Check if this payment was already recorded
        const existingContribution = await ctx.db
            .query("giftContributions")
            .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
            .filter((q) =>
                q.eq(q.field("stripePaymentIntentId"), args.paymentIntentId)
            )
            .first();

        if (existingContribution) {
            // Already processed
            return { success: true, alreadyProcessed: true };
        }

        // Record the contribution
        await ctx.db.insert("giftContributions", {
            giftId: args.giftId,
            weddingId: args.weddingId,
            guestPhone: args.guestPhone,
            guestName: args.guestName,
            amount: args.amount / 100, // Convert from cents
            stripePaymentIntentId: args.paymentIntentId,
            message: args.message,
            createdAt: Date.now(),
        });

        // Update gift amount collected
        const newAmountCollected = gift.amountCollected + args.amount / 100;
        await ctx.db.patch(args.giftId, {
            amountCollected: newAmountCollected,
            isFullyFunded: newAmountCollected >= gift.price,
        });

        return { success: true };
    },
});
