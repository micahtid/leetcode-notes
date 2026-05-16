"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { PageHeader } from "../../../components/PageHeader";
import { QuestionForm } from "../../../components/QuestionForm";
import type { Difficulty } from "../../../components/DifficultyChip";

export default function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const typedId = id as Id<"leetcodeQuestions">;
  const question = useQuery(api.questions.get, { id: typedId });
  const update = useMutation(api.questions.update);
  const remove = useMutation(api.questions.remove);

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

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12 animate-page-in">
      <PageHeader
        title="Edit Question"
        back={{ href: `/q/${id}`, label: question.title }}
      />
      <QuestionForm
        submitLabel="Save Changes"
        cancelHref={`/q/${id}`}
        initial={{
          title: question.title,
          difficulty: question.difficulty as Difficulty,
          body: question.body,
          tags: question.tags ?? [],
        }}
        onSubmit={async (values) => {
          await update({ id: typedId, ...values });
          router.push(`/q/${id}`);
        }}
        onDelete={async () => {
          await remove({ id: typedId });
          router.push("/");
        }}
      />
    </main>
  );
}
