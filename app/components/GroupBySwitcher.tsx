"use client";

export type GroupBy = "none" | "date" | "tag" | "due";

type Props = {
  value: GroupBy;
  onChange: (v: GroupBy) => void;
};

const OPTS: { value: GroupBy; label: string }[] = [
  { value: "none", label: "Flat" },
  { value: "date", label: "Date" },
  { value: "tag", label: "Tag" },
  { value: "due", label: "Next Review" },
];

export function GroupBySwitcher({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="eyebrow">Group</span>
      <div className="segmented" role="tablist" aria-label="Group by">
        {OPTS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={value === o.value}
            className={`segmented-item${value === o.value ? " is-active" : ""}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
