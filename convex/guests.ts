import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireWeddingOwner, requireAdmin } from "./lib/authorization";
import { Id } from "./_generated/dataModel";

// List all guests for a wedding (couple + admin)
export const list = query({
    args: { weddingId: v.id("weddings") },
    handler: async (ctx, { weddingId }) => {
        await requireWeddingOwner(ctx, weddingId);

        return await ctx.db
            .query("guests")
            .withIndex("by_wedding", (q) => q.eq("weddingId", weddingId))
            .collect();
    },
});

// Get guest stats for a wedding (couple + admin)
export const getStats = query({
    args: { weddingId: v.id("weddings") },
    handler: async (ctx, { weddingId }) => {
        await requireWeddingOwner(ctx, weddingId);

        const guests = await ctx.db
            .query("guests")
            .withIndex("by_wedding", (q) => q.eq("weddingId", weddingId))
            .collect();

        return {
            total: guests.length,
            confirmed: guests.filter((g) => g.rsvpStatus === "confirmed")
                .length,
            declined: guests.filter((g) => g.rsvpStatus === "declined").length,
            pending: guests.filter((g) => g.rsvpStatus === "pending").length,
        };
    },
});

// Get a single guest
export const get = query({
    args: { guestId: v.id("guests") },
    handler: async (ctx, { guestId }) => {
        const guest = await ctx.db.get(guestId);
        if (!guest) return null;

        // Verify access to the wedding
        await requireWeddingOwner(ctx, guest.weddingId);

        return guest;
    },
});

// Add a guest (couple + admin)
export const add = mutation({
    args: {
        weddingId: v.id("weddings"),
        name: v.string(),
        phone: v.string(),
        email: v.optional(v.string()),
        plusOne: v.optional(v.boolean()),
        dietaryRestrictions: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireWeddingOwner(ctx, args.weddingId);

        // Check for duplicate phone number
        const existing = await ctx.db
            .query("guests")
            .withIndex("by_wedding_phone", (q) =>
                q.eq("weddingId", args.weddingId).eq("phone", args.phone)
            )
            .first();

        if (existing) {
            throw new Error("A guest with this phone number already exists");
        }

        const guestId = await ctx.db.insert("guests", {
            weddingId: args.weddingId,
            name: args.name,
            phone: args.phone,
            email: args.email,
            rsvpStatus: "pending",
            plusOne: args.plusOne,
            dietaryRestrictions: args.dietaryRestrictions,
            notes: args.notes,
        });

        return guestId;
    },
});

// Update a guest (couple + admin)
export const update = mutation({
    args: {
        guestId: v.id("guests"),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        plusOne: v.optional(v.boolean()),
        dietaryRestrictions: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, { guestId, ...updates }) => {
        const guest = await ctx.db.get(guestId);
        if (!guest) {
            throw new Error("Guest not found");
        }

        await requireWeddingOwner(ctx, guest.weddingId);

        // If phone is being updated, check for duplicates
        if (updates.phone && updates.phone !== guest.phone) {
            const existing = await ctx.db
                .query("guests")
                .withIndex("by_wedding_phone", (q) =>
                    q
                        .eq("weddingId", guest.weddingId)
                        .eq("phone", updates.phone!)
                )
                .first();

            if (existing) {
                throw new Error(
                    "A guest with this phone number already exists"
                );
            }
        }

        // Filter out undefined values
        const filteredUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                filteredUpdates[key] = value;
            }
        }

        await ctx.db.patch(guestId, filteredUpdates);
    },
});

// Delete a guest (couple + admin)
export const remove = mutation({
    args: { guestId: v.id("guests") },
    handler: async (ctx, { guestId }) => {
        const guest = await ctx.db.get(guestId);
        if (!guest) {
            throw new Error("Guest not found");
        }

        await requireWeddingOwner(ctx, guest.weddingId);

        // Delete associated OTPs and sessions
        const otps = await ctx.db
            .query("guestOtps")
            .withIndex("by_wedding_phone", (q) =>
                q.eq("weddingId", guest.weddingId).eq("phone", guest.phone)
            )
            .collect();

        for (const otp of otps) {
            await ctx.db.delete(otp._id);
        }

        const sessions = await ctx.db
            .query("guestSessions")
            .withIndex("by_wedding_phone", (q) =>
                q.eq("weddingId", guest.weddingId).eq("phone", guest.phone)
            )
            .collect();

        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }

        await ctx.db.delete(guestId);
    },
});

// Bulk add guests (for import) - couple + admin
export const bulkAdd = mutation({
    args: {
        weddingId: v.id("weddings"),
        guests: v.array(
            v.object({
                name: v.string(),
                phone: v.string(),
                email: v.optional(v.string()),
                plusOne: v.optional(v.boolean()),
                dietaryRestrictions: v.optional(v.string()),
                notes: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, { weddingId, guests }) => {
        await requireWeddingOwner(ctx, weddingId);

        const results = {
            added: 0,
            skipped: 0,
            errors: [] as string[],
        };

        for (const guest of guests) {
            // Check for duplicate phone number
            const existing = await ctx.db
                .query("guests")
                .withIndex("by_wedding_phone", (q) =>
                    q.eq("weddingId", weddingId).eq("phone", guest.phone)
                )
                .first();

            if (existing) {
                results.skipped++;
                results.errors.push(
                    `Duplicate phone: ${guest.phone} (${guest.name})`
                );
                continue;
            }

            await ctx.db.insert("guests", {
                weddingId,
                name: guest.name,
                phone: guest.phone,
                email: guest.email,
                rsvpStatus: "pending",
                plusOne: guest.plusOne,
                dietaryRestrictions: guest.dietaryRestrictions,
                notes: guest.notes,
            });

            results.added++;
        }

        return results;
    },
});

// Get guests for export (couple + admin)
export const getForExport = query({
    args: { weddingId: v.id("weddings") },
    handler: async (ctx, { weddingId }) => {
        await requireWeddingOwner(ctx, weddingId);

        const guests = await ctx.db
            .query("guests")
            .withIndex("by_wedding", (q) => q.eq("weddingId", weddingId))
            .collect();

        // Return formatted data for export
        return guests.map((g) => ({
            name: g.name,
            phone: g.phone,
            email: g.email || "",
            rsvpStatus: g.rsvpStatus,
            plusOne: g.plusOne ? "Yes" : "No",
            dietaryRestrictions: g.dietaryRestrictions || "",
            notes: g.notes || "",
            rsvpAt: g.rsvpAt ? new Date(g.rsvpAt).toISOString() : "",
        }));
    },
});

// Update RSVP status (admin only - for manual updates)
export const updateRsvp = mutation({
    args: {
        guestId: v.id("guests"),
        rsvpStatus: v.union(
            v.literal("pending"),
            v.literal("confirmed"),
            v.literal("declined")
        ),
        dietaryRestrictions: v.optional(v.string()),
    },
    handler: async (ctx, { guestId, rsvpStatus, dietaryRestrictions }) => {
        const guest = await ctx.db.get(guestId);
        if (!guest) {
            throw new Error("Guest not found");
        }

        // Admin can update any wedding's guests
        await requireAdmin(ctx);

        await ctx.db.patch(guestId, {
            rsvpStatus,
            dietaryRestrictions,
            rsvpAt: rsvpStatus !== "pending" ? Date.now() : undefined,
        });
    },
});
