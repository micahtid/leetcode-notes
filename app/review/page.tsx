"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { PageHeader } from "../components/PageHeader";
import { DifficultyChip, type Difficulty } from "../components/DifficultyChip";
import { Markdown } from "../components/Markdown";
import {
  applyReview,
  relativeDueLabel,
  type Rating,
} from "../../lib/srs";

type DueCard = {
  _id: Id<"leetcodeQuestions">;
  _creationTime: number;
  title: string;
  difficulty: Difficulty;
  body: string;
  tags?: string[];
  easeFactor?: number;
  intervalDays?: number;
  repetitions?: number;
  dueDate?: number;
  lastReviewedAt?: number;
};

export default function ReviewPage() {
  const due = useQuery(api.questions.listDue);
  const review = useMutation(api.questions.review);

  // Freeze the queue from when the page loaded so reviewing a card doesn't
  // immediately recompute Convex's view and skip the card you just rated.
  const [queue, setQueue] = useState<DueCard[] | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (queue === undefined && due !== undefined) {
      setQueue(due as DueCard[]);
    }
  }, [due, queue]);

  const current = queue?.[index];

  const previews = useMemo(() => {
    if (!current) return null;
    const ratings: Rating[] = ["forgot", "hard", "good", "easy"];
    const now = Date.now();
    return Object.fromEntries(
      ratings.map((r) => {
        const next = applyReview(current, r, now);
        return [r, relativeDueLabel(next.dueDate, now)];
      }),
    ) as Record<Rating, string>;
  }, [current]);

  async function rate(rating: Rating) {
    if (!current || pending) return;
    setPending(true);
    try {
      await review({ id: current._id, rating });
      setReviewedCount((n) => n + 1);
      setIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setPending(false);
    }
  }

  function restart() {
    setQueue(undefined);
    setIndex(0);
    setReviewedCount(0);
  }

  if (queue === undefined) {
    return (
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12">
        <PageHeader
          title="Review"
          back={{ href: "/", label: "All Questions" }}
        />
        <p className="text-sm text-ink-500">Loading...</p>
      </main>
    );
  }

  if (queue.length === 0) {
    return (
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12 animate-page-in">
        <PageHeader
          title="Review"
          back={{ href: "/", label: "All Questions" }}
        />
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-700 font-medium mb-2">
            Nothing Due Right Now.
          </p>
          <p className="text-sm text-ink-500 mb-6">
            New questions and ones you've rated will surface here when they're
            scheduled for review.
          </p>
          <Link href="/" className="btn btn-ghost">
            Back to List
          </Link>
        </div>
      </main>
    );
  }

  if (!current) {
    return (
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12 animate-page-in">
        <PageHeader
          title="Review Complete"
          back={{ href: "/", label: "All Questions" }}
        />
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-700 font-medium mb-2">
            All Done — {reviewedCount} Reviewed.
          </p>
          <p className="text-sm text-ink-500 mb-6">
            Come back tomorrow, or keep going if more cards have come due.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/" className="btn btn-ghost">
              Back to List
            </Link>
            <button onClick={restart} className="btn btn-primary">
              Check Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const tags = current.tags ?? [];
  const remaining = queue.length - index;
  const progress = `${remaining} card${remaining === 1 ? "" : "s"} to go${
    reviewedCount > 0 ? ` · ${reviewedCount} done` : ""
  }`;

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12 animate-page-in">
      <PageHeader
        title="Review"
        back={{ href: "/", label: "All Questions" }}
        subtitle={progress}
      />

      <article>
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight">
            {current.title}
          </h2>
          <DifficultyChip value={current.difficulty} />
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {current.body.trim() ? (
          <Markdown source={current.body} />
        ) : (
          <p className="text-sm text-ink-500 italic">
            No notes for this card yet.
          </p>
        )}
      </article>

      <div className="mt-10 pt-6 border-t border-ink-200">
        <p className="eyebrow mb-3">How well did you remember it?</p>
        {previews ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <RateButton
              label="Forgot"
              sub={previews.forgot}
              disabled={pending}
              onClick={() => rate("forgot")}
            />
            <RateButton
              label="Hard"
              sub={previews.hard}
              disabled={pending}
              onClick={() => rate("hard")}
            />
            <RateButton
              label="Good"
              sub={previews.good}
              disabled={pending}
              onClick={() => rate("good")}
            />
            <RateButton
              label="Easy"
              sub={previews.easy}
              disabled={pending}
              onClick={() => rate("easy")}
              emphasize
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}

function RateButton({
  label,
  sub,
  onClick,
  disabled,
  emphasize,
}: {
  label: string;
  sub: string;
  onClick: () => void;
  disabled: boolean;
  emphasize?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border bg-ink-0 transition-colors flex flex-col items-center justify-center gap-0.5 px-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed ${
        emphasize
          ? "border-ink-900 hover:bg-ink-900 hover:text-ink-0"
          : "border-ink-200 hover:border-ink-900 hover:bg-ink-50"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`text-[11px] tabular-nums ${emphasize ? "text-ink-500" : "text-ink-500"}`}
      >
        {sub}
      </span>
    </button>
  );
}
