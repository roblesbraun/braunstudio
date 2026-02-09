import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertPlatformAdmin, assertAuthenticated } from "./authz";

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all weddings (admin only)
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await assertPlatformAdmin(ctx);
    return await ctx.db.query("weddings").order("desc").collect();
  },
});

/**
 * Get a wedding by slug (public - used by wedding renderer)
 * Resolves storage URLs for navbar logos (light/dark) and hero image if present
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const wedding = await ctx.db
      .query("weddings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    
    if (!wedding) return null;

    // Resolve navbar logo URLs from storage if storageIds exist
    let navbarLogoLightUrl: string | undefined = undefined;
    let navbarLogoDarkUrl: string | undefined = undefined;
    let heroImageUrl: string | undefined = undefined;

    if (wedding.navbarLogoLightStorageId) {
      const url = await ctx.storage.getUrl(wedding.navbarLogoLightStorageId);
      navbarLogoLightUrl = url ?? undefined;
    }

    if (wedding.navbarLogoDarkStorageId) {
      const url = await ctx.storage.getUrl(wedding.navbarLogoDarkStorageId);
      navbarLogoDarkUrl = url ?? undefined;
    }

    if (wedding.heroImageStorageId) {
      const url = await ctx.storage.getUrl(wedding.heroImageStorageId);
      heroImageUrl = url ?? undefined;
    }

    return {
      ...wedding,
      navbarLogoLightUrl,
      navbarLogoDarkUrl,
      heroImageUrl,
    };
  },
});

/**
 * Get a wedding by ID (authenticated)
 * Resolves storage URLs for navbar logos (light/dark) and hero image if present
 */
export const get = query({
  args: { id: v.id("weddings") },
  handler: async (ctx, args) => {
    await assertAuthenticated(ctx);
    const wedding = await ctx.db.get(args.id);
    
    if (!wedding) return null;

    // Resolve navbar logo URLs from storage if storageIds exist
    let navbarLogoLightUrl: string | undefined = undefined;
    let navbarLogoDarkUrl: string | undefined = undefined;
    let heroImageUrl: string | undefined = undefined;

    if (wedding.navbarLogoLightStorageId) {
      const url = await ctx.storage.getUrl(wedding.navbarLogoLightStorageId);
      navbarLogoLightUrl = url ?? undefined;
    }

    if (wedding.navbarLogoDarkStorageId) {
      const url = await ctx.storage.getUrl(wedding.navbarLogoDarkStorageId);
      navbarLogoDarkUrl = url ?? undefined;
    }

    if (wedding.heroImageStorageId) {
      const url = await ctx.storage.getUrl(wedding.heroImageStorageId);
      heroImageUrl = url ?? undefined;
    }

    return {
      ...wedding,
      navbarLogoLightUrl,
      navbarLogoDarkUrl,
      heroImageUrl,
    };
  },
});

/**
 * Get weddings accessible to the current user (for couple dashboard)
 */
export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await assertAuthenticated(ctx);

    const user = await ctx.db.get(userId);
    if (!user) {
      return [];
    }

    // Get weddings where user is a member
    const memberships = await ctx.db
      .query("weddingMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const weddingIds = memberships.map((m) => m.weddingId);
    const weddingsFromMembership = await Promise.all(
      weddingIds.map((id) => ctx.db.get(id))
    );

    // Also check weddings where user's email is in coupleEmails
    const userEmail = user.email;
    if (userEmail) {
      const allWeddings = await ctx.db.query("weddings").collect();
      const weddingsByEmail = allWeddings.filter((w) =>
        w.coupleEmails.includes(userEmail)
      );

      // Merge and dedupe
      const allAccessible = [
        ...weddingsFromMembership.filter(Boolean),
        ...weddingsByEmail,
      ];
      const seen = new Set<string>();
      return allAccessible.filter((w) => {
        if (!w || seen.has(w._id)) return false;
        seen.add(w._id);
        return true;
      });
    }

    return weddingsFromMembership.filter(Boolean);
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new wedding (admin only)
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    designId: v.string(),
    weddingDate: v.string(), // Required: yyyy-MM-dd format
    coupleEmails: v.optional(v.array(v.string())),
    features: v.optional(
      v.object({
        rsvp: v.boolean(),
        gifts: v.boolean(),
        whatsapp: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    // Check slug uniqueness
    const existing = await ctx.db
      .query("weddings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error("A wedding with this slug already exists");
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(args.slug)) {
      throw new Error(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      );
    }

    // Validate date format (yyyy-MM-dd)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.weddingDate)) {
      throw new Error("Wedding date must be in yyyy-MM-dd format");
    }

    const weddingId = await ctx.db.insert("weddings", {
      name: args.name,
      slug: args.slug,
      designId: args.designId,
      features: args.features ?? {
        rsvp: false,
        gifts: false,
        whatsapp: false,
      },
      deployment: {
        state: "preview",
      },
      weddingDate: args.weddingDate,
      stripe: {
        connected: false,
      },
      paymentStatus: "unpaid",
      coupleEmails: args.coupleEmails ?? [],
      createdAt: Date.now(),
    });

    return weddingId;
  },
});

/**
 * Update wedding details (admin only)
 */
export const update = mutation({
  args: {
    id: v.id("weddings"),
    name: v.optional(v.string()),
    weddingDate: v.optional(v.string()), // yyyy-MM-dd format
    coupleEmails: v.optional(v.array(v.string())),
    navbarLogoLightStorageId: v.optional(v.string()),
    navbarLogoDarkStorageId: v.optional(v.string()),
    venueName: v.optional(v.string()),
    venueLocation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    const updates: Partial<typeof wedding> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.coupleEmails !== undefined)
      updates.coupleEmails = args.coupleEmails;
    if (args.navbarLogoLightStorageId !== undefined)
      updates.navbarLogoLightStorageId = args.navbarLogoLightStorageId;
    if (args.navbarLogoDarkStorageId !== undefined)
      updates.navbarLogoDarkStorageId = args.navbarLogoDarkStorageId;
    if (args.venueName !== undefined)
      updates.venueName = args.venueName;
    if (args.venueLocation !== undefined)
      updates.venueLocation = args.venueLocation;

    // Handle weddingDate update
    if (args.weddingDate !== undefined) {
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(args.weddingDate)) {
        throw new Error("Wedding date must be in yyyy-MM-dd format");
      }

      updates.weddingDate = args.weddingDate;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Update wedding theme colors (admin only)
 */
/**
 * Update design implementation (admin only)
 */
export const updateDesign = mutation({
  args: {
    id: v.id("weddings"),
    designId: v.string(),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    await ctx.db.patch(args.id, { designId: args.designId });
    return args.id;
  },
});

/**
 * Update per-wedding feature flags (admin only)
 */
export const updateFeatures = mutation({
  args: {
    id: v.id("weddings"),
    features: v.object({
      rsvp: v.boolean(),
      gifts: v.boolean(),
      whatsapp: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    await ctx.db.patch(args.id, { features: args.features });
    return args.id;
  },
});

/**
 * Deploy a wedding live (admin only)
 */
export const deployLive = mutation({
  args: {
    id: v.id("weddings"),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    await ctx.db.patch(args.id, {
      deployment: {
        state: "live",
        deployedAt: Date.now(),
        deployedBy: await assertAuthenticated(ctx),
      },
    });
    return args.id;
  },
});

/**
 * Delete a wedding (admin only, draft or preview only)
 */
export const remove = mutation({
  args: { id: v.id("weddings") },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    if (wedding.deployment.state === "live") {
      throw new Error("Can only delete draft or preview weddings");
    }

    // Delete associated members
    const members = await ctx.db
      .query("weddingMembers")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.id))
      .collect();
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete associated guests
    const guests = await ctx.db
      .query("guests")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.id))
      .collect();
    for (const guest of guests) {
      await ctx.db.delete(guest._id);
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Clear navbar logos from a wedding (admin only)
 * Removes both light and dark storage ID fields
 */
export const clearNavbarLogos = mutation({
  args: { 
    id: v.id("weddings"),
    clearLight: v.optional(v.boolean()),
    clearDark: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    const updates: Partial<typeof wedding> = {};
    
    // Clear light logo if requested (or both if neither specified)
    if (args.clearLight || (!args.clearLight && !args.clearDark)) {
      updates.navbarLogoLightStorageId = undefined;
    }
    
    // Clear dark logo if requested (or both if neither specified)
    if (args.clearDark || (!args.clearLight && !args.clearDark)) {
      updates.navbarLogoDarkStorageId = undefined;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Set hero image for a wedding (admin only)
 * Stores only the storage ID - URL is derived at read time
 */
export const setHeroImage = mutation({
  args: {
    id: v.id("weddings"),
    heroImageStorageId: v.string(),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    await ctx.db.patch(args.id, {
      heroImageStorageId: args.heroImageStorageId,
    });

    return args.id;
  },
});

/**
 * Clear hero image from a wedding (admin only)
 */
export const clearHeroImage = mutation({
  args: {
    id: v.id("weddings"),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    await ctx.db.patch(args.id, {
      heroImageStorageId: undefined,
    });

    return args.id;
  },
});

