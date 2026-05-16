"use client";

type Props = {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
};

export function TagFilter({ tags, selected, onToggle, onClear }: Props) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow">Tags</span>
      {tags.map((t) => {
        const on = selected.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => onToggle(t)}
            className={`chip ${on ? "chip-on" : ""} hover:border-ink-900 transition-colors`}
          >
            {t}
          </button>
        );
      })}
      {selected.length > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-ink-500 hover:text-ink-900 underline underline-offset-2 decoration-ink-300"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
