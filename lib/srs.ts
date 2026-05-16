// SM-2 (SuperMemo 2) — classic Anki algorithm.
// Rating maps to "quality" 0..5; we expose 4 buttons:
//   Forgot = 1, Hard = 3, Good = 4, Easy = 5.

export type Rating = "forgot" | "hard" | "good" | "easy";

export type CardState = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueDate: number; // ms epoch
  lastReviewedAt: number; // ms epoch
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function initialCardState(now: number = Date.now()): CardState {
  return {
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueDate: now, // immediately due, so new cards enter the review queue
    lastReviewedAt: 0,
  };
}

function qualityFor(rating: Rating): number {
  switch (rating) {
    case "forgot":
      return 1;
    case "hard":
      return 3;
    case "good":
      return 4;
    case "easy":
      return 5;
  }
}

export function applyReview(
  prev: Partial<CardState> | undefined,
  rating: Rating,
  now: number = Date.now(),
): CardState {
  const state: CardState = {
    easeFactor: prev?.easeFactor ?? 2.5,
    intervalDays: prev?.intervalDays ?? 0,
    repetitions: prev?.repetitions ?? 0,
    dueDate: prev?.dueDate ?? now,
    lastReviewedAt: prev?.lastReviewedAt ?? 0,
  };

  const quality = qualityFor(rating);
  let { easeFactor, intervalDays, repetitions } = state;

  if (quality < 3) {
    // Forgot — restart the schedule.
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    if (rating === "easy") {
      intervalDays = Math.max(intervalDays, Math.round(intervalDays * 1.3));
    }
    if (rating === "hard") {
      // SM-2 doesn't specially handle "hard"; Anki dampens its growth.
      intervalDays = Math.max(1, Math.round(intervalDays * 0.6));
    }
    repetitions += 1;
  }

  // SM-2 ease update: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const dueDate = now + intervalDays * MS_PER_DAY;

  return {
    easeFactor,
    intervalDays,
    repetitions,
    dueDate,
    lastReviewedAt: now,
  };
}

// Human-readable "in X" phrase from now until target.
export function relativeIntervalLabel(intervalDays: number): string {
  if (intervalDays < 1) return "now";
  if (intervalDays === 1) return "tomorrow";
  if (intervalDays < 30) return `in ${intervalDays}d`;
  if (intervalDays < 365) return `in ${Math.round(intervalDays / 30)}mo`;
  return `in ${Math.round(intervalDays / 365)}y`;
}
