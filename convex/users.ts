import { query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Get the current authenticated user.
 */
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

