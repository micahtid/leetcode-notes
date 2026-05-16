import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const difficulty = v.union(
  v.literal("Easy"),
  v.literal("Medium"),
  v.literal("Hard"),
);

const rating = v.union(
  v.literal("forgot"),
  v.literal("hard"),
  v.literal("good"),
  v.literal("easy"),
);

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("leetcodeQuestions").collect();
    return rows.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const listDue = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("leetcodeQuestions").collect();
    const now = Date.now();
    return rows
      .filter((q) => (q.dueDate ?? q._creationTime) <= now)
      .sort(
        (a, b) =>
          (a.dueDate ?? a._creationTime) - (b.dueDate ?? b._creationTime),
      );
  },
});

export const listTags = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("leetcodeQuestions").collect();
    const set = new Set<string>();
    for (const r of rows) {
      for (const t of r.tags ?? []) set.add(t);
    }
    return Array.from(set).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    );
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
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("leetcodeQuestions", {
      ...args,
      tags: normalizeTags(args.tags),
      easeFactor: 2.5,
      intervalDays: 0,
      repetitions: 0,
      dueDate: now,
      lastReviewedAt: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("leetcodeQuestions"),
    title: v.string(),
    difficulty,
    body: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, {
      ...patch,
      tags: normalizeTags(patch.tags),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("leetcodeQuestions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const review = mutation({
  args: { id: v.id("leetcodeQuestions"), rating },
  handler: async (ctx, { id, rating }) => {
    const card = await ctx.db.get(id);
    if (!card) return;
    const next = applyReview(
      {
        easeFactor: card.easeFactor,
        intervalDays: card.intervalDays,
        repetitions: card.repetitions,
        dueDate: card.dueDate,
        lastReviewedAt: card.lastReviewedAt,
      },
      rating,
      Date.now(),
    );
    await ctx.db.patch(id, next);
  },
});

function normalizeTags(tags?: string[]): string[] {
  if (!tags) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const t = raw.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

// Inlined SM-2 (the lib/srs.ts version is for the client; Convex functions
// can't import outside the convex/ folder, so duplicating the math here.)
type Rating = "forgot" | "hard" | "good" | "easy";

function qualityFor(r: Rating): number {
  return r === "forgot" ? 1 : r === "hard" ? 3 : r === "good" ? 4 : 5;
}

function applyReview(
  prev: {
    easeFactor?: number;
    intervalDays?: number;
    repetitions?: number;
    dueDate?: number;
    lastReviewedAt?: number;
  },
  rating: Rating,
  now: number,
) {
  let easeFactor = prev.easeFactor ?? 2.5;
  let intervalDays = prev.intervalDays ?? 0;
  let repetitions = prev.repetitions ?? 0;

  const quality = qualityFor(rating);

  if (rating === "forgot") {
    repetitions = 0;
    intervalDays = 0;
  } else if (repetitions === 0) {
    if (rating === "hard") intervalDays = 1;
    else if (rating === "good") intervalDays = 3;
    else intervalDays = 7;
    repetitions = 1;
  } else {
    if (rating === "hard") {
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
    } else if (rating === "good") {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor * 1.3));
    }
    repetitions += 1;
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return {
    easeFactor,
    intervalDays,
    repetitions,
    dueDate: now + intervalDays * MS_PER_DAY,
    lastReviewedAt: now,
  };
}
