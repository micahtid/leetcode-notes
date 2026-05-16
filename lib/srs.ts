// SM-2 (SuperMemo 2) with a sane first-review phase so the four buttons
// schedule visibly different intervals from the start.
//
// First review (repetitions = 0):
//   Forgot → due now    (re-enter queue immediately)
//   Hard   → in 1 day
//   Good   → in 3 days
//   Easy   → in 7 days
//
// Subsequent reviews:
//   Forgot → reset, due now
//   Hard   → interval * 1.2  (modest growth)
//   Good   → interval * easeFactor   (canonical SM-2 step)
//   Easy   → interval * easeFactor * 1.3 (faster growth)
//
// Ease factor adjusts after every review by the standard SM-2 formula and
// floors at 1.3.

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
    dueDate: now, // new cards are immediately due
    lastReviewedAt: 0,
  };
}

function qualityFor(rating: Rating): number {
  return rating === "forgot"
    ? 1
    : rating === "hard"
      ? 3
      : rating === "good"
        ? 4
        : 5;
}

export function applyReview(
  prev: Partial<CardState> | undefined,
  rating: Rating,
  now: number = Date.now(),
): CardState {
  let easeFactor = prev?.easeFactor ?? 2.5;
  let intervalDays = prev?.intervalDays ?? 0;
  let repetitions = prev?.repetitions ?? 0;

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

  // SM-2 ease update: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
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

// "Due now" / "Today" / "Tomorrow" / "in 3d" / "in 2w" / "in 1mo".
export function relativeDueLabel(
  dueDate: number,
  now: number = Date.now(),
): string {
  const diffMs = dueDate - now;
  if (diffMs <= 0) return "Due now";
  const days = diffMs / MS_PER_DAY;
  if (days < 1) return "Today";
  if (days < 2) return "Tomorrow";
  if (days < 14) return `in ${Math.round(days)}d`;
  if (days < 60) return `in ${Math.round(days / 7)}w`;
  if (days < 365) return `in ${Math.round(days / 30)}mo`;
  return `in ${Math.round(days / 365)}y`;
}
