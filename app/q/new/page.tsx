"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PageHeader } from "../../components/PageHeader";
import { QuestionForm } from "../../components/QuestionForm";

export default function NewQuestionPage() {
  const router = useRouter();
  const create = useMutation(api.questions.create);

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-10 sm:py-12 animate-page-in">
      <PageHeader
        title="New Question"
        back={{ href: "/", label: "All Questions" }}
      />
      <QuestionForm
        submitLabel="Save Question"
        cancelHref="/"
        onSubmit={async (values) => {
          const id = await create(values);
          router.push(`/q/${id}`);
        }}
      />
    </main>
  );
}
