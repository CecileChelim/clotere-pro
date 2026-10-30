"use client";

import { useState } from "react";
import { IconChevronDown } from "@/components/ui/icons";

const COLLAPSED_LENGTH = 280;

export function ExpandableBio({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > COLLAPSED_LENGTH;
  const shown = expanded || !isLong ? text : `${text.slice(0, COLLAPSED_LENGTH).trimEnd()}…`;

  return (
    <div>
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-body">{shown}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-ink-2 underline underline-offset-2"
        >
          {expanded ? "Voir moins" : "Voir plus"}
          <IconChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
