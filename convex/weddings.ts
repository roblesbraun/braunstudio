import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
    requireAdmin,
    requireWeddingOwner,
    requireWeddingContentEditor,
} from "./lib/authorization";

// Template registry for server-side validation
// This must stay in sync with templates/registry.ts
const VALID_TEMPLATES: Record<string, string[]> = {
    classic: ["v1"],
    modern: ["v1"],
};

// Get latest version for a template (server-side)
function getLatestTemplateVersion(templateId: string): string {
    const versions = VALID_TEMPLATES[templateId];
    if (!versions || versions.length === 0) {
        throw new Error(
            `Template "${templateId}" not found. Available templates: ${Object.keys(VALID_TEMPLATES).join(", ")}`
        );
    }

    // Sort versions (v1, v2, v3, etc.) and return the highest
    const sortedVersions = versions.sort((a, b) => {
        const aNum = parseInt(a.replace(/^v/i, "")) || 0;
        const bNum = parseInt(b.replace(/^v/i, "")) || 0;
        return bNum - aNum; // Descending order
    });

    return sortedVersions[0];
}

// Validate template ID and version
function isValidTemplate(
    templateId: string,
    templateVersion: string
): boolean {
    const versions = VALID_TEMPLATES[templateId];
    if (!versions) return false;
    return versions.includes(templateVersion);
}

// Default palette (shadcn light theme)
const defaultPalette = {
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    card: "0 0% 100%",
    cardForeground: "222.2 84% 4.9%",
    popover: "0 0% 100%",
    popoverForeground: "222.2 84% 4.9%",
    primary: "222.2 47.4% 11.2%",
    primaryForeground: "210 40% 98%",
    secondary: "210 40% 96.1%",
    secondaryForeground: "222.2 47.4% 11.2%",
    muted: "210 40% 96.1%",
    mutedForeground: "215.4 16.3% 46.9%",
    accent: "210 40% 96.1%",
    accentForeground: "222.2 47.4% 11.2%",
    destructive: "0 84.2% 60.2%",
    destructiveForeground: "210 40% 98%",
    border: "214.3 31.8% 91.4%",
    input: "214.3 31.8% 91.4%",
    ring: "222.2 84% 4.9%",
};

// Default sections configuration
const defaultSections = {
    hero: {
        enabled: true,
        title: undefined,
        subtitle: undefined,
        date: undefined,
        imageUrl: undefined,
    },
    location: {
        enabled: true,
        venueName: undefined,
        address: undefined,
        mapUrl: undefined,
        notes: undefined,
    },
    lodging: {
        enabled: false,
        hotels: undefined,
    },
    gifts: {
        enabled: true,
        message: undefined,
        externalUrl: undefined,
    },
    dressCode: {
        enabled: false,
        code: undefined,
        description: undefined,
    },
    rsvp: {
        enabled: true,
        deadline: undefined,
        message: undefined,
    },
    itinerary: {
        enabled: false,
        events: undefined,
    },
};

// Generate a random preview token
function generatePreviewToken(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// List all weddings (admin only)
export const list = query({
    args: {
        status: v.optional(
            v.union(
                v.literal("draft"),
                v.literal("pending_payment"),
                v.literal("active"),
                v.literal("paused")
            )
        ),
    },
    handler: async (ctx, { status }) => {
        await requireAdmin(ctx);

        if (status) {
            return await ctx.db
                .query("weddings")
                .withIndex("by_status", (q) => q.eq("status", status))
                .collect();
        }

        return await ctx.db.query("weddings").collect();
    },
});

// Get wedding by ID
export const get = query({
    args: { weddingId: v.id("weddings") },
    handler: async (ctx, { weddingId }) => {
        const { wedding } = await requireWeddingOwner(ctx, weddingId);
        return wedding;
    },
});

// Get wedding by slug (public query for wedding pages)
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, { slug }) => {
        const wedding = await ctx.db
            .query("weddings")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();

        if (!wedding) return null;

        // Only return if active (public access)
        if (wedding.status !== "active") return null;

        return wedding;
    },
});

// Get wedding by preview token (public query for preview pages)
export const getByPreviewToken = query({
    args: { previewToken: v.string() },
    handler: async (ctx, { previewToken }) => {
        const wedding = await ctx.db
            .query("weddings")
            .withIndex("by_preview_token", (q) =>
                q.eq("previewToken", previewToken)
            )
            .first();

        // Preview is always accessible regardless of status
        return wedding;
    },
});

// Create a new wedding (admin only)
export const create = mutation({
    args: {
        slug: v.string(),
        ownerUserId: v.id("users"),
        templateId: v.string(),
        templateVersion: v.optional(v.string()),
        partner1Name: v.optional(v.string()),
        partner2Name: v.optional(v.string()),
        weddingDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        // Check if slug is already taken
        const existingWedding = await ctx.db
            .query("weddings")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existingWedding) {
            throw new Error("Slug is already taken");
        }

        // Verify owner exists
        const owner = await ctx.db.get(args.ownerUserId);
        if (!owner) {
            throw new Error("Owner user not found");
        }

        // Determine template version (use provided or default to latest)
        const templateVersion =
            args.templateVersion || getLatestTemplateVersion(args.templateId);

        // Validate template ID and version
        if (!isValidTemplate(args.templateId, templateVersion)) {
            throw new Error(
                `Invalid template combination: "${args.templateId}/${templateVersion}". Available templates: ${Object.keys(VALID_TEMPLATES).map((id) => `${id} (${VALID_TEMPLATES[id].join(", ")})`).join(", ")}`
            );
        }

        // Create the wedding
        const weddingId = await ctx.db.insert("weddings", {
            slug: args.slug,
            status: "draft",
            ownerUserId: args.ownerUserId,
            previewToken: generatePreviewToken(),
            templateId: args.templateId,
            templateVersion,
            theme: {
                palette: defaultPalette,
                fontFamily: undefined,
            },
            sections: defaultSections,
            giftsMode: "external",
            stripeConnectStatus: "not_connected",
            partner1Name: args.partner1Name,
            partner2Name: args.partner2Name,
            weddingDate: args.weddingDate,
        });

        // Update the owner's weddingId
        await ctx.db.patch(args.ownerUserId, { weddingId });

        return weddingId;
    },
});

// Update wedding status (admin only)
export const updateStatus = mutation({
    args: {
        weddingId: v.id("weddings"),
        status: v.union(
            v.literal("draft"),
            v.literal("pending_payment"),
            v.literal("active"),
            v.literal("paused")
        ),
    },
    handler: async (ctx, { weddingId, status }) => {
        await requireAdmin(ctx);

        const wedding = await ctx.db.get(weddingId);
        if (!wedding) {
            throw new Error("Wedding not found");
        }

        await ctx.db.patch(weddingId, { status });
    },
});

// Update wedding template (admin only)
export const updateTemplate = mutation({
    args: {
        weddingId: v.id("weddings"),
        templateId: v.string(),
        templateVersion: v.string(),
    },
    handler: async (ctx, { weddingId, templateId, templateVersion }) => {
        await requireWeddingContentEditor(ctx, weddingId);

        // Validate template ID and version
        if (!isValidTemplate(templateId, templateVersion)) {
            throw new Error(
                `Invalid template combination: "${templateId}/${templateVersion}". Available templates: ${Object.keys(VALID_TEMPLATES).map((id) => `${id} (${VALID_TEMPLATES[id].join(", ")})`).join(", ")}`
            );
        }

        await ctx.db.patch(weddingId, {
            templateId,
            templateVersion,
        });
    },
});

// Update wedding theme/palette (admin only)
export const updateTheme = mutation({
    args: {
        weddingId: v.id("weddings"),
        palette: v.object({
            background: v.string(),
            foreground: v.string(),
            card: v.string(),
            cardForeground: v.string(),
            popover: v.string(),
            popoverForeground: v.string(),
            primary: v.string(),
            primaryForeground: v.string(),
            secondary: v.string(),
            secondaryForeground: v.string(),
            muted: v.string(),
            mutedForeground: v.string(),
            accent: v.string(),
            accentForeground: v.string(),
            destructive: v.string(),
            destructiveForeground: v.string(),
            border: v.string(),
            input: v.string(),
            ring: v.string(),
        }),
        fontFamily: v.optional(v.string()),
    },
    handler: async (ctx, { weddingId, palette, fontFamily }) => {
        await requireWeddingContentEditor(ctx, weddingId);

        await ctx.db.patch(weddingId, {
            theme: {
                palette,
                fontFamily,
            },
        });
    },
});

// Update wedding sections (admin only)
export const updateSections = mutation({
    args: {
        weddingId: v.id("weddings"),
        sections: v.object({
            hero: v.object({
                enabled: v.boolean(),
                title: v.optional(v.string()),
                subtitle: v.optional(v.string()),
                date: v.optional(v.string()),
                imageUrl: v.optional(v.string()),
            }),
            location: v.object({
                enabled: v.boolean(),
                venueName: v.optional(v.string()),
                address: v.optional(v.string()),
                mapUrl: v.optional(v.string()),
                notes: v.optional(v.string()),
            }),
            lodging: v.object({
                enabled: v.boolean(),
                hotels: v.optional(
                    v.array(
                        v.object({
                            name: v.string(),
                            address: v.optional(v.string()),
                            url: v.optional(v.string()),
                            notes: v.optional(v.string()),
                        })
                    )
                ),
            }),
            gifts: v.object({
                enabled: v.boolean(),
                message: v.optional(v.string()),
                externalUrl: v.optional(v.string()),
            }),
            dressCode: v.object({
                enabled: v.boolean(),
                code: v.optional(v.string()),
                description: v.optional(v.string()),
            }),
            rsvp: v.object({
                enabled: v.boolean(),
                deadline: v.optional(v.string()),
                message: v.optional(v.string()),
            }),
            itinerary: v.object({
                enabled: v.boolean(),
                events: v.optional(
                    v.array(
                        v.object({
                            time: v.string(),
                            title: v.string(),
                            description: v.optional(v.string()),
                        })
                    )
                ),
            }),
        }),
    },
    handler: async (ctx, { weddingId, sections }) => {
        await requireWeddingContentEditor(ctx, weddingId);

        await ctx.db.patch(weddingId, { sections });
    },
});

// Update wedding details (admin only)
export const updateDetails = mutation({
    args: {
        weddingId: v.id("weddings"),
        partner1Name: v.optional(v.string()),
        partner2Name: v.optional(v.string()),
        weddingDate: v.optional(v.string()),
        giftsMode: v.optional(
            v.union(v.literal("external"), v.literal("internal"))
        ),
    },
    handler: async (ctx, { weddingId, ...updates }) => {
        await requireWeddingContentEditor(ctx, weddingId);

        await ctx.db.patch(weddingId, updates);
    },
});

// Regenerate preview token (admin only)
export const regeneratePreviewToken = mutation({
    args: { weddingId: v.id("weddings") },
    handler: async (ctx, { weddingId }) => {
        await requireAdmin(ctx);

        const newToken = generatePreviewToken();
        await ctx.db.patch(weddingId, { previewToken: newToken });

        return newToken;
    },
});

// Delete wedding (admin only)
export const remove = mutation({
    args: { weddingId: v.id("weddings") },
    handler: async (ctx, { weddingId }) => {
        await requireAdmin(ctx);

        const wedding = await ctx.db.get(weddingId);
        if (!wedding) {
            throw new Error("Wedding not found");
        }

        // Remove wedding reference from owner
        const owner = await ctx.db.get(wedding.ownerUserId);
        if (owner && owner.weddingId === weddingId) {
            await ctx.db.patch(wedding.ownerUserId, { weddingId: undefined });
        }

        // Delete associated guests
        const guests = await ctx.db
            .query("guests")
            .withIndex("by_wedding", (q) => q.eq("weddingId", weddingId))
            .collect();
        for (const guest of guests) {
            await ctx.db.delete(guest._id);
        }

        // Delete associated gifts
        const gifts = await ctx.db
            .query("gifts")
            .withIndex("by_wedding", (q) => q.eq("weddingId", weddingId))
            .collect();
        for (const gift of gifts) {
            // Delete gift contributions first
            const contributions = await ctx.db
                .query("giftContributions")
                .withIndex("by_gift", (q) => q.eq("giftId", gift._id))
                .collect();
            for (const contribution of contributions) {
                await ctx.db.delete(contribution._id);
            }
            await ctx.db.delete(gift._id);
        }

        // Delete the wedding
        await ctx.db.delete(weddingId);
    },
});
