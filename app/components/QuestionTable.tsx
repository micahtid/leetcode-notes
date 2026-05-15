"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DifficultyChip } from "./DifficultyChip";
import type { QuestionRow } from "./QuestionListRow";

type SortKey = "title" | "difficulty" | "created";
type SortDir = "asc" | "desc";

const DIFFICULTY_ORDER: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };

export function QuestionTable({ rows }: { rows: QuestionRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "difficulty")
        cmp = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      else cmp = a._creationTime - b._creationTime;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const toggle = (k: SortKey) => {
    if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(k === "created" ? "desc" : "asc");
    }
  };

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <Th
              label="Title"
              onClick={() => toggle("title")}
              active={sortKey === "title"}
              dir={sortDir}
            />
            <Th
              label="Difficulty"
              onClick={() => toggle("difficulty")}
              active={sortKey === "difficulty"}
              dir={sortDir}
              width="160px"
            />
            <Th
              label="Created"
              onClick={() => toggle("created")}
              active={sortKey === "created"}
              dir={sortDir}
              width="140px"
            />
          </tr>
        </thead>
        <tbody>
          {sorted.map((q) => (
            <tr
              key={q._id}
              className="hover:bg-ink-50 transition-colors border-t border-ink-100"
            >
              <td className="py-3 px-5">
                <Link
                  href={`/q/${q._id}`}
                  className="font-medium text-ink-900 hover:underline underline-offset-2 decoration-ink-400"
                >
                  {q.title}
                </Link>
              </td>
              <td className="py-3 px-5">
                <DifficultyChip value={q.difficulty} />
              </td>
              <td className="py-3 px-5 text-ink-500 tabular-nums">
                {new Date(q._creationTime).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  label,
  onClick,
  active,
  dir,
  width,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  dir: SortDir;
  width?: string;
}) {
  return (
    <th
      style={width ? { width } : undefined}
      className="text-left text-[12px] font-medium text-ink-500 border-b border-ink-200 py-3 px-5 select-none"
    >
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 hover:text-ink-900 transition-colors"
      >
        <span>{label}</span>
        {active ? (
          dir === "asc" ? (
            <ChevronUp size={14} strokeWidth={2} />
          ) : (
            <ChevronDown size={14} strokeWidth={2} />
          )
        ) : null}
      </button>
    </th>
  );
}
