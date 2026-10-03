import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type TrackOption = { value: string; label: string };

interface TrackMultiSelectProps {
  options: TrackOption[];
  value: string[];
  onChange: (value: string[]) => void;
  ariaLabel: string;
  className?: string;
}

export function TrackMultiSelect({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: TrackMultiSelectProps) {
  function toggle(id: string) {
    const next = value.includes(id) ? value.filter((item) => item !== id) : [...value, id];
    onChange(options.map((option) => option.value).filter((item) => next.includes(item)));
  }

  const allSelected = options.length > 0 && value.length === options.length;

  return (
    <div className={className}>
      <div role="group" aria-label={ariaLabel} className="grid gap-1.5 sm:grid-cols-2">
        {options.map((option) => {
          const checked = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggle(option.value)}
              className={cn(
                "flex h-9 items-center gap-2 border px-2.5 text-left text-[12.5px] font-medium transition-colors",
                checked
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-white text-muted-foreground hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center border",
                  checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
                aria-hidden
              >
                {checked ? <Check className="size-3" strokeWidth={3} /> : null}
              </span>
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {value.length === 0
            ? "Select at least one track"
            : `${value.length} track${value.length === 1 ? "" : "s"} selected`}
        </span>
        <button
          type="button"
          onClick={() => onChange(allSelected ? [] : options.map((option) => option.value))}
          className="font-semibold text-primary hover:underline"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>
    </div>
  );
}
