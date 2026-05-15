"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { PageHeader } from "./components/PageHeader";
import { Toolbar, type DifficultyFilter } from "./components/Toolbar";
import { useView } from "./components/ViewSwitcher";
import { QuestionListRow, type QuestionRow } from "./components/QuestionListRow";
import { QuestionGridCard } from "./components/QuestionGridCard";
import { QuestionTable } from "./components/QuestionTable";

export default function Home() {
  const data = useQuery(api.questions.list);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [view, setView] = useView();

  const rows: QuestionRow[] | undefined = data as
    | QuestionRow[]
    | undefined;

  const filtered = useMemo(() => {
    if (!rows) return undefined;
    const term = search.trim().toLowerCase();
    return rows.filter((q) => {
      if (difficulty !== "All" && q.difficulty !== difficulty) return false;
      if (term && !q.title.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [rows, search, difficulty]);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12 animate-page-in">
      <PageHeader
        title="LeetCode Notes"
        subtitle="A quiet place to take notes on problems."
      />

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        view={view}
        onViewChange={setView}
      />

      {filtered === undefined ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        rows && rows.length === 0 ? (
          <EmptyState />
        ) : (
          <NoMatchesState />
        )
      ) : view === "table" ? (
        <QuestionTable rows={filtered} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((q) => (
            <QuestionGridCard key={q._id} q={q} />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((q) => (
            <li key={q._id}>
              <QuestionListRow q={q} />
            </li>
          ))}
        </ul>
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
