"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Difficulty } from "./DifficultyChip";
import { TagsInput } from "./TagsInput";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

type Initial = {
  title: string;
  difficulty: Difficulty;
  body: string;
  tags: string[];
};

type Props = {
  initial?: Initial;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (values: Initial) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function QuestionForm({
  initial,
  submitLabel,
  cancelHref,
  onSubmit,
  onDelete,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initial?.difficulty ?? "Easy",
  );
  const [body, setBody] = useState(initial?.body ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [saving, setSaving] = useState(false);

  const suggestions = useQuery(api.questions.listTags) ?? [];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), difficulty, body, tags });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm("Delete this question? This cannot be undone.")) return;
    setSaving(true);
    try {
      await onDelete();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="Two Sum"
          required
          autoFocus
        />
      </div>

      <div>
        <span className="label">Difficulty</span>
        <div className="segmented" role="radiogroup" aria-label="Difficulty">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={difficulty === d}
              className={`segmented-item${difficulty === d ? " is-active" : ""}`}
              onClick={() => setDifficulty(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="label">Tags</span>
        <TagsInput
          value={tags}
          onChange={setTags}
          suggestions={suggestions}
          placeholder="Add tags..."
        />
        <p className="mt-2 text-xs text-ink-500">
          Pick from existing tags or type a new one and hit Enter.
        </p>
      </div>

      <div>
        <label htmlFor="body" className="label">
          Notes
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="input font-mono text-[13px] leading-relaxed min-h-[60vh] resize-y"
          placeholder={"- Approach: two pointers\n- Time: O(n), Space: O(1)\n\n```python\ndef twoSum(nums, target):\n    ...\n```"}
        />
        <p className="mt-2 text-xs text-ink-500">
          Markdown: bullets with <code className="font-mono">- </code>, code
          fences with <code className="font-mono">```</code>.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving || !title.trim()}
        >
          {saving ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.push(cancelHref)}
          disabled={saving}
        >
          Cancel
        </button>
        {onDelete ? (
          <button
            type="button"
            className="btn btn-danger ml-auto"
            onClick={handleDelete}
            disabled={saving}
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
