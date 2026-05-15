import Link from "next/link";
import { DifficultyChip } from "./DifficultyChip";
import type { QuestionRow } from "./QuestionListRow";

export function QuestionGridCard({ q }: { q: QuestionRow }) {
  return (
    <Link
      href={`/q/${q._id}`}
      className="card flex flex-col gap-3 p-5 hover:border-ink-900 transition-colors min-h-[120px]"
    >
      <h2 className="text-base font-medium tracking-tight line-clamp-2">
        {q.title}
      </h2>
      <div className="mt-auto flex items-center justify-between gap-3">
        <DifficultyChip value={q.difficulty} />
        <span className="text-xs text-ink-500">
          {new Date(q._creationTime).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
}
