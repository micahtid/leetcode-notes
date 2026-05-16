"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "convex/react";
import { Pencil } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { PageHeader } from "../../components/PageHeader";
import { DifficultyChip, type Difficulty } from "../../components/DifficultyChip";
import { Markdown } from "../../components/Markdown";

export default function QuestionViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const question = useQuery(api.questions.get, {
    id: id as Id<"leetcodeQuestions">,
  });

  if (question === undefined) {
    return (
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12">
        <p className="text-sm text-ink-500">Loading...</p>
      </main>
    );
  }

  if (question === null) {
    return (
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12">
        <PageHeader
          title="Not Found"
          back={{ href: "/", label: "All Questions" }}
          subtitle="That question does not exist or was deleted."
        />
      </main>
    );
  }

  const tags = question.tags ?? [];

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12 animate-page-in">
      <PageHeader
        title={question.title}
        back={{ href: "/", label: "All Questions" }}
        titleSuffix={
          <DifficultyChip value={question.difficulty as Difficulty} />
        }
        action={
          <Link href={`/q/${id}/edit`} className="btn btn-ghost">
            <Pencil size={14} strokeWidth={2} />
            <span>Edit</span>
          </Link>
        }
      />

      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      ) : null}

      {question.body.trim() ? (
        <Markdown source={question.body} />
      ) : (
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-500 mb-4">No Notes Yet.</p>
          <Link href={`/q/${id}/edit`} className="btn btn-primary">
            Add Notes
          </Link>
        </div>
      )}
    </main>
  );
}
