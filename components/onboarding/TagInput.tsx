"use client";

import { useState } from "react";
import { IconCross } from "@/components/ui/icons";

export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const clean = draft.trim();
    if (clean && !value.includes(clean)) {
      onChange([...value, clean]);
    }
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-white px-3 py-2 focus-within:border-ink-2">
      {value.map((tag) => (
        <span key={tag} className="chip gap-1.5 text-xs">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((v) => v !== tag))}
            aria-label={`Retirer ${tag}`}
            className="text-muted hover:text-ink-2"
          >
            <IconCross className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 border-none bg-transparent py-1 text-sm text-ink-2 outline-none"
      />
    </div>
  );
}
