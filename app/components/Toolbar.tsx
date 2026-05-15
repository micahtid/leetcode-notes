"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { ViewSwitcher, type View } from "./ViewSwitcher";
import type { Difficulty } from "./DifficultyChip";

export type DifficultyFilter = "All" | Difficulty;

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  difficulty: DifficultyFilter;
  onDifficultyChange: (v: DifficultyFilter) => void;
  view: View;
  onViewChange: (v: View) => void;
};

const DIFFICULTIES: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard"];

export function Toolbar({
  search,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  view,
  onViewChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <input
        type="search"
        placeholder="Search Titles..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="input max-w-xs"
        aria-label="Search by title"
      />

      <div className="segmented" role="tablist" aria-label="Difficulty filter">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            role="tab"
            aria-selected={difficulty === d}
            className={`segmented-item${difficulty === d ? " is-active" : ""}`}
            onClick={() => onDifficultyChange(d)}
            type="button"
          >
            {d}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ViewSwitcher value={view} onChange={onViewChange} />
        <Link href="/q/new" className="btn btn-primary">
          <Plus size={16} strokeWidth={2} />
          <span>New Question</span>
        </Link>
      </div>
    </div>
  );
}
