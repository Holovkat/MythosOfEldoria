import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  adventures: defineTable({
    title: v.string(),
    character: v.any(), // Stores the full Character object
    gameState: v.object({
      currentPhase: v.string(),
      history: v.array(v.any()), // Stores ChatMessage array
      currentChapter: v.number(),
      adventureTitle: v.optional(v.string()),
    }),
    inventory: v.any(), // Stores the Inventory object
    lastUpdated: v.number(), // timestamp
  }).index("by_lastUpdated", ["lastUpdated"]),
});
