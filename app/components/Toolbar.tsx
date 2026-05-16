"use client";

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

        <div
          className="segmented"
          role="tablist"
          aria-label="Difficulty filter"
        >
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

        <div className="ml-auto">
          <GroupBySwitcher value={groupBy} onChange={onGroupByChange} />
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
