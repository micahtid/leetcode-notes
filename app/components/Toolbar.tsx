"use client";

import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { GroupBySwitcher, type GroupBy } from "./GroupBySwitcher";
import { TagFilter } from "./TagFilter";
import type { Difficulty } from "./DifficultyChip";

export type DifficultyFilter = "All" | Difficulty;

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  difficulty: DifficultyFilter;
  onDifficultyChange: (v: DifficultyFilter) => void;
  groupBy: GroupBy;
  onGroupByChange: (v: GroupBy) => void;
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  dueCount: number;
};

const DIFFICULTIES: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard"];

export function Toolbar({
  search,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  groupBy,
  onGroupByChange,
  allTags,
  selectedTags,
  onToggleTag,
  onClearTags,
  dueCount,
}: Props) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-wrap items-center gap-3">
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
          <GroupBySwitcher value={groupBy} onChange={onGroupByChange} />
          <Link
            href="/review"
            className={`btn ${dueCount > 0 ? "btn-primary" : "btn-ghost"}`}
            aria-label={`Review ${dueCount} due cards`}
          >
            <Sparkles size={14} strokeWidth={2} />
            <span>Review{dueCount > 0 ? ` (${dueCount})` : ""}</span>
          </Link>
          <Link href="/q/new" className="btn btn-primary">
            <Plus size={14} strokeWidth={2} />
            <span>New Question</span>
          </Link>
        </div>
      </div>

      {allTags.length > 0 ? (
        <TagFilter
          tags={allTags}
          selected={selectedTags}
          onToggle={onToggleTag}
          onClear={onClearTags}
        />
      ) : null}
    </div>
  );
}
