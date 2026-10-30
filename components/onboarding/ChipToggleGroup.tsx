"use client";

export function ChipToggleGroup({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={active}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              active
                ? "border-ink-2 bg-ink-2 text-cream"
                : "border-chip-line bg-white text-body hover:border-ink-2"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
