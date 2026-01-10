import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertPlatformAdmin } from "./authz";

/**
 * Media/file upload utilities using Convex Storage.
 * Platform admins can upload images for wedding photos sections.
 */

/**
 * Generate an upload URL for a file (admin only).
 * Client uploads file to this URL, then receives a storageId.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await assertPlatformAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a public URL for a stored file.
 * Returns null if file doesn't exist.
 */
export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete a file from storage (admin only).
 * Used when removing photos from a wedding.
 */
export const deleteFile = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    await assertPlatformAdmin(ctx);
    await ctx.storage.delete(args.storageId);
  },
});
