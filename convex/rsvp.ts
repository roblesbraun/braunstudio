import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertPlatformAdmin } from "./authz";

async function ensureWeddingRsvpEnabled(ctx: any, weddingId: string) {
  const wedding = await ctx.db.get(weddingId);
  if (!wedding) {
    throw new Error("Wedding not found");
  }
  if (!wedding.features?.rsvp) {
    throw new Error("RSVP is disabled for this wedding");
  }
  return wedding;
}

export const getConfig = query({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    return await ctx.db
      .query("rsvpConfigs")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
      .unique();
  },
});

export const getPublicConfig = query({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    await ensureWeddingRsvpEnabled(ctx, args.weddingId);

    return await ctx.db
      .query("rsvpConfigs")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
      .unique();
  },
});

export const setConfig = mutation({
  args: {
    weddingId: v.id("weddings"),
    questions: v.array(
      v.object({
        id: v.string(),
        order: v.number(),
        prompt: v.string(),
        options: v.array(
          v.object({
            id: v.string(),
            order: v.number(),
            label: v.string(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const existing = await ctx.db
      .query("rsvpConfigs")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        questions: args.questions,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("rsvpConfigs", {
      weddingId: args.weddingId,
      questions: args.questions,
      updatedAt: Date.now(),
    });
  },
});

export const submit = mutation({
  args: {
    weddingId: v.id("weddings"),
    guestId: v.id("guests"),
    answers: v.array(
      v.object({
        questionId: v.string(),
        optionId: v.string(),
      })
    ),
    rsvpStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("declined")
      )
    ),
  },
  handler: async (ctx, args) => {
    await ensureWeddingRsvpEnabled(ctx, args.weddingId);

    const guest = await ctx.db.get(args.guestId);
    if (!guest) {
      throw new Error("Guest not found");
    }
    if (guest.weddingId !== args.weddingId) {
      throw new Error("Guest does not belong to this wedding");
    }

    const submissionId = await ctx.db.insert("rsvpSubmissions", {
      weddingId: args.weddingId,
      guestId: args.guestId,
      answers: args.answers,
      createdAt: Date.now(),
    });

    if (args.rsvpStatus) {
      await ctx.db.patch(args.guestId, { rsvpStatus: args.rsvpStatus });
    }

    return submissionId;
  },
});

export const getStats = query({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const guests = await ctx.db
      .query("guests")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
      .collect();

    const submissions = await ctx.db
      .query("rsvpSubmissions")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
      .collect();

    return {
      total: guests.length,
      confirmed: guests.filter((g) => g.rsvpStatus === "confirmed").length,
      declined: guests.filter((g) => g.rsvpStatus === "declined").length,
      pending: guests.filter((g) => g.rsvpStatus === "pending").length,
      submissions: submissions.length,
    };
  },
});
