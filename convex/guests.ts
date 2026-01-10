import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { assertWeddingAccess, assertAuthenticated } from "./authz";

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all guests for a wedding
 */
export const listForWedding = query({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    await assertWeddingAccess(ctx, args.weddingId);

    return await ctx.db
      .query("guests")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
      .collect();
  },
});

/**
 * Get a guest by phone for a specific wedding (used for OTP auth)
 */
export const getByPhone = query({
  args: {
    weddingId: v.id("weddings"),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("guests")
      .withIndex("by_wedding_phone", (q) =>
        q.eq("weddingId", args.weddingId).eq("phone", args.phone)
      )
      .unique();
  },
});

/**
 * Get guest count and RSVP stats for a wedding
 */
export const getStats = query({
  args: { weddingId: v.id("weddings") },
  handler: async (ctx, args) => {
    await assertWeddingAccess(ctx, args.weddingId);

    const guests = await ctx.db
      .query("guests")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
      .collect();

    return {
      total: guests.length,
      confirmed: guests.filter((g) => g.rsvpStatus === "confirmed").length,
      declined: guests.filter((g) => g.rsvpStatus === "declined").length,
      pending: guests.filter((g) => g.rsvpStatus === "pending").length,
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a single guest
 */
export const add = mutation({
  args: {
    weddingId: v.id("weddings"),
    name: v.string(),
    phone: v.string(),
    whatsappConsent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertWeddingAccess(ctx, args.weddingId);

    // Check if guest with this phone already exists
    const existing = await ctx.db
      .query("guests")
      .withIndex("by_wedding_phone", (q) =>
        q.eq("weddingId", args.weddingId).eq("phone", args.phone)
      )
      .unique();

    if (existing) {
      throw new Error("A guest with this phone number already exists");
    }

    const guestId = await ctx.db.insert("guests", {
      weddingId: args.weddingId,
      name: args.name,
      phone: args.phone,
      rsvpStatus: "pending",
      whatsappConsent: args.whatsappConsent ?? false,
      createdAt: Date.now(),
    });

    return guestId;
  },
});

/**
 * Add multiple guests (bulk import)
 */
export const addBulk = mutation({
  args: {
    weddingId: v.id("weddings"),
    guests: v.array(
      v.object({
        name: v.string(),
        phone: v.string(),
        whatsappConsent: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await assertWeddingAccess(ctx, args.weddingId);

    const results = {
      added: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const guest of args.guests) {
      // Check if guest with this phone already exists
      const existing = await ctx.db
        .query("guests")
        .withIndex("by_wedding_phone", (q) =>
          q.eq("weddingId", args.weddingId).eq("phone", guest.phone)
        )
        .unique();

      if (existing) {
        results.skipped++;
        results.errors.push(`Guest with phone ${guest.phone} already exists`);
        continue;
      }

      await ctx.db.insert("guests", {
        weddingId: args.weddingId,
        name: guest.name,
        phone: guest.phone,
        rsvpStatus: "pending",
        whatsappConsent: guest.whatsappConsent ?? false,
        createdAt: Date.now(),
      });

      results.added++;
    }

    return results;
  },
});

/**
 * Update a guest
 */
export const update = mutation({
  args: {
    id: v.id("guests"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    whatsappConsent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const guest = await ctx.db.get(args.id);
    if (!guest) {
      throw new Error("Guest not found");
    }

    await assertWeddingAccess(ctx, guest.weddingId);

    // If changing phone, check for duplicates
    if (args.phone !== undefined && args.phone !== guest.phone) {
      const existing = await ctx.db
        .query("guests")
        .withIndex("by_wedding_phone", (q) =>
          q.eq("weddingId", guest.weddingId).eq("phone", args.phone!)
        )
        .unique();

      if (existing) {
        throw new Error("A guest with this phone number already exists");
      }
    }

    const updates: Partial<typeof guest> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.whatsappConsent !== undefined)
      updates.whatsappConsent = args.whatsappConsent;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Update RSVP status (used by guest auth flow)
 */
export const updateRsvp = mutation({
  args: {
    id: v.id("guests"),
    rsvpStatus: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("declined")
    ),
  },
  handler: async (ctx, args) => {
    // Note: This will be called from guest OTP auth context
    // For now, we don't require platform auth
    const guest = await ctx.db.get(args.id);
    if (!guest) {
      throw new Error("Guest not found");
    }

    await ctx.db.patch(args.id, { rsvpStatus: args.rsvpStatus });
    return args.id;
  },
});

/**
 * Remove a guest
 */
export const remove = mutation({
  args: { id: v.id("guests") },
  handler: async (ctx, args) => {
    const guest = await ctx.db.get(args.id);
    if (!guest) {
      throw new Error("Guest not found");
    }

    await assertWeddingAccess(ctx, guest.weddingId);

    await ctx.db.delete(args.id);
  },
});

