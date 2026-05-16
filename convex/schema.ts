import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  leetcodeQuestions: defineTable({
    title: v.string(),
    difficulty: v.union(
      v.literal("Easy"),
      v.literal("Medium"),
      v.literal("Hard"),
    ),
    body: v.string(),
    tags: v.optional(v.array(v.string())),

    // SM-2 spaced repetition state. All optional so legacy rows still load;
    // a missing dueDate is treated as "due now" by the review queue.
    easeFactor: v.optional(v.number()),
    intervalDays: v.optional(v.number()),
    repetitions: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    lastReviewedAt: v.optional(v.number()),
  })
    .index("by_title", ["title"])
    .index("by_due", ["dueDate"]),
});
