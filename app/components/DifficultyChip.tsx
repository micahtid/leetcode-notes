export type Difficulty = "Easy" | "Medium" | "Hard";

export function DifficultyChip({ value }: { value: Difficulty }) {
  if (value === "Hard") {
    return <span className="chip chip-on">{value}</span>;
  }
  if (value === "Medium") {
    return (
      <span className="chip border-ink-400 text-ink-900">{value}</span>
    );
  }
  return <span className="chip">{value}</span>;
}
