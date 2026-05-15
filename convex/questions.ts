import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const difficulty = v.union(
  v.literal("Easy"),
  v.literal("Medium"),
  v.literal("Hard"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("leetcodeQuestions").collect();
    return rows.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const get = query({
  args: { id: v.id("leetcodeQuestions") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    difficulty,
    body: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leetcodeQuestions", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("leetcodeQuestions"),
    title: v.string(),
    difficulty,
    body: v.string(),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("leetcodeQuestions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
