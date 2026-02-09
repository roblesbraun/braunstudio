import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertPlatformAdmin } from "./authz";

function normalizeTags(tags: string[]): string[] {
  return tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await assertPlatformAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const addItem = mutation({
  args: {
    weddingId: v.id("weddings"),
    storageId: v.string(),
    mediaType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("audio")
    ),
    order: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(
      v.object({
        alt: v.optional(v.string()),
        caption: v.optional(v.string()),
        durationSeconds: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    let order = args.order;
    if (order === undefined) {
      const last = await ctx.db
        .query("mediaItems")
        .withIndex("by_wedding_order", (q) => q.eq("weddingId", args.weddingId))
        .order("desc")
        .first();
      order = last ? last.order + 1 : 0;
    }

    const itemId = await ctx.db.insert("mediaItems", {
      weddingId: args.weddingId,
      storageId: args.storageId,
      mediaType: args.mediaType,
      order,
      tags: normalizeTags(args.tags ?? []),
      metadata: args.metadata ?? {},
      createdAt: Date.now(),
    });

    return itemId;
  },
});

export const listByWedding = query({
  args: {
    weddingId: v.id("weddings"),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const items = await ctx.db
      .query("mediaItems")
      .withIndex("by_wedding_order", (q) => q.eq("weddingId", args.weddingId))
      .collect();

    const filtered = args.tag
      ? items.filter((item) => item.tags.includes(args.tag!))
      : items;

    const itemsWithUrls = await Promise.all(
      filtered.map(async (item) => {
        const url = await ctx.storage.getUrl(item.storageId);
        return {
          ...item,
          url: url ?? undefined,
        };
      })
    );

    return itemsWithUrls;
  },
});

export const listPublicByWedding = query({
  args: {
    weddingId: v.id("weddings"),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("mediaItems")
      .withIndex("by_wedding_order", (q) => q.eq("weddingId", args.weddingId))
      .collect();

    const filtered = args.tag
      ? items.filter((item) => item.tags.includes(args.tag!))
      : items;

    const itemsWithUrls = await Promise.all(
      filtered.map(async (item) => {
        const url = await ctx.storage.getUrl(item.storageId);
        return {
          ...item,
          url: url ?? undefined,
        };
      })
    );

    return itemsWithUrls;
  },
});

export const updateItemMetadata = mutation({
  args: {
    id: v.id("mediaItems"),
    metadata: v.object({
      alt: v.optional(v.string()),
      caption: v.optional(v.string()),
      durationSeconds: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Media item not found");
    }

    await ctx.db.patch(args.id, {
      metadata: args.metadata,
    });
    return args.id;
  },
});

export const setTags = mutation({
  args: {
    id: v.id("mediaItems"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Media item not found");
    }

    await ctx.db.patch(args.id, {
      tags: normalizeTags(args.tags),
    });
    return args.id;
  },
});

export const reorder = mutation({
  args: {
    weddingId: v.id("weddings"),
    orderedIds: v.array(v.id("mediaItems")),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const items = await ctx.db
      .query("mediaItems")
      .withIndex("by_wedding", (q) => q.eq("weddingId", args.weddingId))
      .collect();

    const validIds = new Set(items.map((item) => item._id));
    for (const id of args.orderedIds) {
      if (!validIds.has(id)) {
        throw new Error("Media item does not belong to this wedding");
      }
    }

    await Promise.all(
      args.orderedIds.map((id, index) =>
        ctx.db.patch(id, { order: index })
      )
    );
  },
});

export const deleteItem = mutation({
  args: {
    id: v.id("mediaItems"),
  },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);

    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Media item not found");
    }

    await ctx.storage.delete(item.storageId);
    await ctx.db.delete(args.id);
  },
});
