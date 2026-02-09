import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertPlatformAdmin } from "./authz";

async function ensureWeddingGiftsEnabled(ctx: any, weddingId: string) {
  const wedding = await ctx.db.get(weddingId);
  if (!wedding) {
    throw new Error("Wedding not found");
  }
  if (!wedding.features?.gifts) {
    throw new Error("Gifts are disabled for this wedding");
  }
  return wedding;
}

export const listOptions = query({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    return await ctx.db
      .query("giftOptions")
      .withIndex("by_wedding_order", (q) => q.eq("weddingId", args.weddingId))
      .collect();
  },
});

export const listPublicOptions = query({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    await ensureWeddingGiftsEnabled(ctx, args.weddingId);

    return await ctx.db
      .query("giftOptions")
      .withIndex("by_wedding_order", (q) => q.eq("weddingId", args.weddingId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

export const setOptions = mutation({
  args: {
    weddingId: v.id("weddings"),
    options: v.array(
      v.object({
        label: v.string(),
        amountCents: v.number(),
        order: v.number(),
        active: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const existing = await ctx.db
      .query("giftOptions")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
      .collect();

    await Promise.all(existing.map((item) => ctx.db.delete(item._id)));

    const inserted = await Promise.all(
      args.options.map((option) =>
        ctx.db.insert("giftOptions", {
          weddingId: args.weddingId,
          label: option.label,
          amountCents: option.amountCents,
          order: option.order,
          active: option.active,
        })
      )
    );

    return inserted;
  },
});

export const createPaymentIntent = mutation({
  args: {
    weddingId: v.id("weddings"),
    guestId: v.id("guests"),
    giftOptionId: v.optional(v.id("giftOptions")),
    amountCents: v.number(),
  },
  handler: async (ctx, args) => {
    const wedding = await ensureWeddingGiftsEnabled(ctx, args.weddingId);

    if (!wedding.stripe?.connected || !wedding.stripe.connectAccountId) {
      throw new Error("Stripe is not connected for this wedding");
    }

    // Stripe integration should create a PaymentIntent and store its ID.
    throw new Error("Stripe integration not configured");
  },
});
