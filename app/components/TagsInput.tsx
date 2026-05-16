"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: string[];
  placeholder?: string;
};

export function TagsInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: Props) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const valueLower = new Set(value.map((t) => t.toLowerCase()));
  const inputLower = input.trim().toLowerCase();
  const filtered = suggestions.filter(
    (s) =>
      !valueLower.has(s.toLowerCase()) &&
      (inputLower === "" || s.toLowerCase().includes(inputLower)),
  );
  const canCreate =
    inputLower !== "" &&
    !valueLower.has(inputLower) &&
    !suggestions.some((s) => s.toLowerCase() === inputLower);

  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean) return;
    if (valueLower.has(clean.toLowerCase())) return;
    onChange([...value, clean]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) addTag(filtered[0]);
      else if (canCreate) addTag(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={wrapRef}>
      <div
        className="input flex flex-wrap items-center gap-1.5 cursor-text"
        onClick={() => setOpen(true)}
      >
        {value.map((t) => (
          <span key={t} className="chip chip-on">
            {t}
            <button
              type="button"
              className="ml-1 -mr-1 inline-flex items-center justify-center hover:text-ink-300"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(t);
              }}
              aria-label={`Remove ${t}`}
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={value.length === 0 ? (placeholder ?? "Add tags...") : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm p-0 leading-[1.4]"
        />
      </div>

      {open && (filtered.length > 0 || canCreate) ? (
        <div className="absolute z-10 left-0 right-0 mt-1 card overflow-hidden">
          <ul className="max-h-56 overflow-y-auto">
            {filtered.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-ink-50"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(s);
                  }}
                >
                  {s}
                </button>
              </li>
            ))}
            {canCreate ? (
              <li className="border-t border-ink-100">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-ink-50 text-ink-700"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(input);
                  }}
                >
                  Create <span className="font-medium">"{input.trim()}"</span>
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
