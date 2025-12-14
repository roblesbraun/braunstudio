import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/authorization";

// Create a new lead (public - from contact form)
export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        message: v.string(),
        source: v.string(),
    },
    handler: async (ctx, args) => {
        const leadId = await ctx.db.insert("leads", {
            name: args.name,
            email: args.email,
            phone: args.phone,
            message: args.message,
            source: args.source,
            createdAt: Date.now(),
            status: "new",
        });

        return leadId;
    },
});

// List all leads (admin only)
export const list = query({
    args: {
        status: v.optional(
            v.union(
                v.literal("new"),
                v.literal("contacted"),
                v.literal("converted"),
                v.literal("closed")
            )
        ),
    },
    handler: async (ctx, { status }) => {
        await requireAdmin(ctx);

        let leads;
        if (status) {
            leads = await ctx.db
                .query("leads")
                .withIndex("by_status", (q) => q.eq("status", status))
                .collect();
        } else {
            leads = await ctx.db.query("leads").collect();
        }

        // Sort by createdAt descending (newest first)
        return leads.sort((a, b) => b.createdAt - a.createdAt);
    },
});

// Get a single lead (admin only)
export const get = query({
    args: { leadId: v.id("leads") },
    handler: async (ctx, { leadId }) => {
        await requireAdmin(ctx);
        return await ctx.db.get(leadId);
    },
});

// Update lead status (admin only)
export const updateStatus = mutation({
    args: {
        leadId: v.id("leads"),
        status: v.union(
            v.literal("new"),
            v.literal("contacted"),
            v.literal("converted"),
            v.literal("closed")
        ),
    },
    handler: async (ctx, { leadId, status }) => {
        await requireAdmin(ctx);

        const lead = await ctx.db.get(leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }

        await ctx.db.patch(leadId, { status });
    },
});

// Add notes to a lead (admin only)
export const updateNotes = mutation({
    args: {
        leadId: v.id("leads"),
        notes: v.string(),
    },
    handler: async (ctx, { leadId, notes }) => {
        await requireAdmin(ctx);

        const lead = await ctx.db.get(leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }

        await ctx.db.patch(leadId, { notes });
    },
});

// Delete a lead (admin only)
export const remove = mutation({
    args: { leadId: v.id("leads") },
    handler: async (ctx, { leadId }) => {
        await requireAdmin(ctx);

        const lead = await ctx.db.get(leadId);
        if (!lead) {
            throw new Error("Lead not found");
        }

        await ctx.db.delete(leadId);
    },
});
