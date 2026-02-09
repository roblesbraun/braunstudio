import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertPlatformAdmin } from "./authz";

async function ensureWeddingWhatsappEnabled(ctx: any, weddingId: string) {
  const wedding = await ctx.db.get(weddingId);
  if (!wedding) {
    throw new Error("Wedding not found");
  }
  if (!wedding.features?.whatsapp) {
    throw new Error("WhatsApp is disabled for this wedding");
  }
  return wedding;
}

export const listForWedding = query({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    return await ctx.db
      .query("whatsappMessages")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
      .order("desc")
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    weddingId: v.id("weddings"),
    guestId: v.id("guests"),
    templateName: v.string(),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);
    await ensureWeddingWhatsappEnabled(ctx, args.weddingId);

    const guest = await ctx.db.get(args.guestId);
    if (!guest) {
      throw new Error("Guest not found");
    }
    if (guest.weddingId !== args.weddingId) {
      throw new Error("Guest does not belong to this wedding");
    }

    const messageId = await ctx.db.insert("whatsappMessages", {
      weddingId: args.weddingId,
      guestId: args.guestId,
      twilioMessageSid: "queued",
      templateName: args.templateName,
      status: "queued",
      createdAt: Date.now(),
    });

    return messageId;
  },
});
