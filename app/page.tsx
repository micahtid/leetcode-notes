"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Plus, Sparkles } from "lucide-react";
import { api } from "../convex/_generated/api";
import { PageHeader } from "./components/PageHeader";
import { Toolbar, type DifficultyFilter } from "./components/Toolbar";
import type { GroupBy } from "./components/GroupBySwitcher";
import { QuestionListRow, type QuestionRow } from "./components/QuestionListRow";

const GROUP_STORAGE_KEY = "leetcode:groupBy";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default function Home() {
  const data = useQuery(api.questions.list);
  const allTags = useQuery(api.questions.listTags) ?? [];

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>("none");

  useEffect(() => {
    try {
      const v = localStorage.getItem(GROUP_STORAGE_KEY);
      if (v === "none" || v === "date" || v === "tag" || v === "due") {
        setGroupBy(v);
      }
    } catch {}
  }, []);

  function changeGroup(v: GroupBy) {
    setGroupBy(v);
    try {
      localStorage.setItem(GROUP_STORAGE_KEY, v);
    } catch {}
  }

  function toggleTag(t: string) {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  const rows: QuestionRow[] | undefined = data as QuestionRow[] | undefined;

  const filtered = useMemo(() => {
    if (!rows) return undefined;
    const term = search.trim().toLowerCase();
    return rows.filter((q) => {
      if (difficulty !== "All" && q.difficulty !== difficulty) return false;
      if (term && !q.title.toLowerCase().includes(term)) return false;
      if (selectedTags.length > 0) {
        const tagSet = new Set((q.tags ?? []).map((t) => t.toLowerCase()));
        const wantAll = selectedTags.every((t) => tagSet.has(t.toLowerCase()));
        if (!wantAll) return false;
      }
      return true;
    });
  }, [rows, search, difficulty, selectedTags]);

  const dueCount = useMemo(() => {
    if (!rows) return 0;
    const now = Date.now();
    return rows.filter((q) => (q.dueDate ?? q._creationTime) <= now).length;
  }, [rows]);

  const grouped = useMemo(() => {
    if (!filtered) return undefined;
    return groupRows(filtered, groupBy);
  }, [filtered, groupBy]);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12 animate-page-in">
      <PageHeader
        title="LeetCode Notes"
        subtitle="A quiet place to take notes on problems."
        action={
          <div className="flex items-center gap-2">
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
        }
      />

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        groupBy={groupBy}
        onGroupByChange={changeGroup}
        allTags={allTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onClearTags={() => setSelectedTags([])}
      />

      {grouped === undefined ? (
        <LoadingState />
      ) : grouped.length === 0 ? (
        rows && rows.length === 0 ? (
          <EmptyState />
        ) : (
          <NoMatchesState />
        )
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map((g) => (
            <section key={g.key}>
              {groupBy !== "none" ? (
                <h2 className="eyebrow mb-3 flex items-center gap-2">
                  <span>{g.label}</span>
                  <span className="text-ink-400">·</span>
                  <span className="text-ink-400 tabular-nums">
                    {g.items.length}
                  </span>
                </h2>
              ) : null}
              <ul className="flex flex-col gap-3">
                {g.items.map((q) => (
                  <li key={q._id}>
                    <QuestionListRow q={q} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function LoadingState() {
  return (
    <div className="card p-10 text-center animate-fade-in">
      <p className="text-sm text-ink-500">Loading...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-10 text-center">
      <p className="text-sm text-ink-600 mb-4">No Questions Yet.</p>
      <Link href="/q/new" className="btn btn-primary">
        Add Your First Question
      </Link>
    </div>
  );
}

function NoMatchesState() {
  return (
    <div className="card p-10 text-center">
      <p className="text-sm text-ink-500">No Questions Match Your Filters.</p>
    </div>
  );
}

type Group = { key: string; label: string; items: QuestionRow[] };

function groupRows(rows: QuestionRow[], by: GroupBy): Group[] {
  if (by === "none") {
    return rows.length === 0 ? [] : [{ key: "all", label: "All", items: rows }];
  }
  if (by === "date") return groupByDate(rows);
  if (by === "tag") return groupByTag(rows);
  return groupByDue(rows);
}

function groupByDate(rows: QuestionRow[]): Group[] {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfWeek = startOfToday - 6 * MS_PER_DAY;
  const startOfMonth = startOfToday - 29 * MS_PER_DAY;

  const buckets: Group[] = [
    { key: "today", label: "Today", items: [] },
    { key: "week", label: "This Week", items: [] },
    { key: "month", label: "This Month", items: [] },
    { key: "older", label: "Older", items: [] },
  ];

  for (const q of rows) {
    const t = q._creationTime;
    if (t >= startOfToday) buckets[0].items.push(q);
    else if (t >= startOfWeek) buckets[1].items.push(q);
    else if (t >= startOfMonth) buckets[2].items.push(q);
    else buckets[3].items.push(q);
  }

  return buckets.filter((b) => b.items.length > 0);
}

function groupByTag(rows: QuestionRow[]): Group[] {
  const map = new Map<string, QuestionRow[]>();
  const untagged: QuestionRow[] = [];
  for (const q of rows) {
    const tags = q.tags ?? [];
    if (tags.length === 0) {
      untagged.push(q);
      continue;
    }
    for (const t of tags) {
      const list = map.get(t) ?? [];
      list.push(q);
      map.set(t, list);
    }
  }
  const groups: Group[] = Array.from(map.entries())
    .sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()))
    .map(([tag, items]) => ({ key: `tag:${tag}`, label: tag, items }));
  if (untagged.length > 0) {
    groups.push({ key: "untagged", label: "Untagged", items: untagged });
  }
  return groups;
}

function groupByDue(rows: QuestionRow[]): Group[] {
  const now = Date.now();
  const inOneDay = now + MS_PER_DAY;
  const inOneWeek = now + 7 * MS_PER_DAY;
  const inOneMonth = now + 30 * MS_PER_DAY;

  const buckets: Group[] = [
    { key: "due", label: "Due Now", items: [] },
    { key: "soon", label: "Within a Day", items: [] },
    { key: "week", label: "This Week", items: [] },
    { key: "month", label: "This Month", items: [] },
    { key: "later", label: "Later", items: [] },
  ];

  // Within each bucket, keep items sorted by ascending dueDate
  // so the most-imminent one shows first.
  const sorted = [...rows].sort(
    (a, b) =>
      (a.dueDate ?? a._creationTime) - (b.dueDate ?? b._creationTime),
  );

  for (const q of sorted) {
    const due = q.dueDate ?? q._creationTime;
    if (due <= now) buckets[0].items.push(q);
    else if (due <= inOneDay) buckets[1].items.push(q);
    else if (due <= inOneWeek) buckets[2].items.push(q);
    else if (due <= inOneMonth) buckets[3].items.push(q);
    else buckets[4].items.push(q);
  }

  return buckets.filter((b) => b.items.length > 0);
}
