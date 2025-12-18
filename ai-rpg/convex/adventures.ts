import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveAdventure = mutation({
  args: {
    id: v.optional(v.id("adventures")),
    title: v.string(),
    character: v.any(),
    gameState: v.object({
      currentPhase: v.string(),
      history: v.array(v.any()),
      currentChapter: v.number(),
      adventureTitle: v.optional(v.string()),
    }),
    inventory: v.any(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    const timestamp = Date.now();

    if (id) {
      const existing = await ctx.db.get(id);
      if (existing) {
        await ctx.db.patch(id, { ...data, lastUpdated: timestamp });
        return id;
      }
    }
    
    return await ctx.db.insert("adventures", { ...data, lastUpdated: timestamp });
  },
});

export const listAdventures = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("adventures")
      .withIndex("by_lastUpdated")
      .order("desc")
      .collect();
  },
});

export const getAdventure = query({
  args: { id: v.id("adventures") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const deleteAdventure = mutation({
  args: { id: v.id("adventures") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
