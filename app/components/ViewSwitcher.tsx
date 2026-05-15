"use client";

import { useEffect, useState } from "react";

export type View = "list" | "grid" | "table";

const STORAGE_KEY = "leetcode:view";

export function useView(): [View, (v: View) => void] {
  const [view, setView] = useState<View>("table");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "list" || stored === "grid" || stored === "table") {
        setView(stored);
      }
    } catch {
      // localStorage unavailable; keep default
    }
  }, []);

  const update = (v: View) => {
    setView(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      // ignore
    }
  };

  return [view, update];
}

export function ViewSwitcher({
  value,
  onChange,
}: {
  value: View;
  onChange: (v: View) => void;
}) {
  const options: { value: View; label: string }[] = [
    { value: "table", label: "Table" },
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
  ];

  return (
    <div className="segmented" role="tablist" aria-label="View">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          className={`segmented-item${value === opt.value ? " is-active" : ""}`}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
