import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DifficultyChip, type Difficulty } from "./DifficultyChip";
import { relativeDueLabel } from "../../lib/srs";

export type QuestionRow = {
  _id: string;
  _creationTime: number;
  title: string;
  difficulty: Difficulty;
  tags?: string[];
  dueDate?: number;
};

export function QuestionListRow({ q }: { q: QuestionRow }) {
  const dueDate = q.dueDate ?? q._creationTime;
  const dueLabel = relativeDueLabel(dueDate);
  const isDue = dueDate <= Date.now();

  return (
    <Link
      href={`/q/${q._id}`}
      className="card group flex items-center gap-4 p-4 sm:p-5 hover:border-ink-900 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-medium tracking-tight truncate">
            {q.title}
          </h2>
          <DifficultyChip value={q.difficulty} />
          {(q.tags ?? []).map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
        <p className="mt-1 text-xs text-ink-500 flex items-center gap-2">
          <span>
            {new Date(q._creationTime).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="text-ink-400">·</span>
          <span className={isDue ? "text-ink-900 font-medium" : "text-ink-500"}>
            {dueLabel}
          </span>
        </p>
      </div>
      <span
        className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl text-ink-400 group-hover:text-ink-900 transition-colors"
        aria-hidden
      >
        <ChevronRight size={18} strokeWidth={2} />
      </span>
    </Link>
  );
}
