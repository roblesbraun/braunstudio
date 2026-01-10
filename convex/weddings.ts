import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
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
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("weddings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/**
 * Get a wedding by ID (authenticated)
 */
export const get = query({
  args: { id: v.id("weddings") },
  handler: async (ctx, args) => {
    await assertAuthenticated(ctx);
    return await ctx.db.get(args.id);
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
    templateId: v.string(),
    templateVersion: v.string(),
    coupleEmails: v.optional(v.array(v.string())),
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

    const weddingId = await ctx.db.insert("weddings", {
      name: args.name,
      slug: args.slug,
      status: "draft",
      templateId: args.templateId,
      templateVersion: args.templateVersion,
      // All mandatory sections enabled by default
      enabledSections: [
        "hero",
        "itinerary",
        "photos",
        "location",
        "lodging",
        "dressCode",
        "gifts",
        "rsvp",
      ],
      sectionContent: {},
      theme: {
        light: {},
        dark: {},
      },
      stripe: {
        mode: "wishlist",
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
    templateId: v.optional(v.string()),
    templateVersion: v.optional(v.string()),
    enabledSections: v.optional(v.array(v.string())),
    sectionContent: v.optional(v.record(v.string(), v.any())),
    coupleEmails: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    // Cannot change template if wedding is live
    if (
      wedding.status === "live" &&
      (args.templateId || args.templateVersion)
    ) {
      throw new Error("Cannot change template for a live wedding");
    }

    const updates: Partial<typeof wedding> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.templateId !== undefined) updates.templateId = args.templateId;
    if (args.templateVersion !== undefined)
      updates.templateVersion = args.templateVersion;
    if (args.enabledSections !== undefined)
      updates.enabledSections = args.enabledSections;
    if (args.sectionContent !== undefined)
      updates.sectionContent = args.sectionContent;
    if (args.coupleEmails !== undefined)
      updates.coupleEmails = args.coupleEmails;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Update wedding theme colors (admin only)
 */
export const updateTheme = mutation({
  args: {
    id: v.id("weddings"),
    theme: v.object({
      light: v.object({
        background: v.optional(v.string()),
        foreground: v.optional(v.string()),
        card: v.optional(v.string()),
        cardForeground: v.optional(v.string()),
        popover: v.optional(v.string()),
        popoverForeground: v.optional(v.string()),
        primary: v.optional(v.string()),
        primaryForeground: v.optional(v.string()),
        secondary: v.optional(v.string()),
        secondaryForeground: v.optional(v.string()),
        muted: v.optional(v.string()),
        mutedForeground: v.optional(v.string()),
        accent: v.optional(v.string()),
        accentForeground: v.optional(v.string()),
        destructive: v.optional(v.string()),
        border: v.optional(v.string()),
        input: v.optional(v.string()),
        ring: v.optional(v.string()),
      }),
      dark: v.object({
        background: v.optional(v.string()),
        foreground: v.optional(v.string()),
        card: v.optional(v.string()),
        cardForeground: v.optional(v.string()),
        popover: v.optional(v.string()),
        popoverForeground: v.optional(v.string()),
        primary: v.optional(v.string()),
        primaryForeground: v.optional(v.string()),
        secondary: v.optional(v.string()),
        secondaryForeground: v.optional(v.string()),
        muted: v.optional(v.string()),
        mutedForeground: v.optional(v.string()),
        accent: v.optional(v.string()),
        accentForeground: v.optional(v.string()),
        destructive: v.optional(v.string()),
        border: v.optional(v.string()),
        input: v.optional(v.string()),
        ring: v.optional(v.string()),
      }),
    }),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    await ctx.db.patch(args.id, {
      theme: args.theme,
    });
    return args.id;
  },
});

/**
 * Transition wedding status (admin only)
 */
export const updateStatus = mutation({
  args: {
    id: v.id("weddings"),
    status: v.union(
      v.literal("draft"),
      v.literal("pending_payment"),
      v.literal("live")
    ),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      draft: ["pending_payment", "live"],
      pending_payment: ["live", "draft"],
      live: [], // Cannot transition away from live
    };

    if (!validTransitions[wedding.status]?.includes(args.status)) {
      throw new Error(
        `Cannot transition from ${wedding.status} to ${args.status}`
      );
    }

    await ctx.db.patch(args.id, { status: args.status });
    return args.id;
  },
});

/**
 * Delete a wedding (admin only, draft only)
 */
export const remove = mutation({
  args: { id: v.id("weddings") },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const wedding = await ctx.db.get(args.id);
    if (!wedding) {
      throw new Error("Wedding not found");
    }

    if (wedding.status !== "draft") {
      throw new Error("Can only delete draft weddings");
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

