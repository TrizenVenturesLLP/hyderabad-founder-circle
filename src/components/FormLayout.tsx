import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const formFieldClass =
  "block w-full rounded-xl border border-(--color-border) bg-white px-3.5 py-2.5 text-sm text-(--color-text-primary) outline-none transition-[border-color,box-shadow] placeholder:text-(--color-text-muted) hover:border-(--brand-accent)/50 focus:border-(--brand-accent) focus:ring-4 focus:ring-(--brand-accent)/12";

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-(--color-text-muted) uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function FormField({
  label,
  htmlFor,
  optional,
  hint,
  counter,
  children,
}: {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  hint?: string;
  counter?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-(--color-text-primary)">
          {label}
          {optional ? (
            <span className="ml-1 font-normal text-(--color-text-muted)">(optional)</span>
          ) : null}
        </label>
        {counter ? (
          <span className="text-[11px] text-(--color-text-muted) tabular-nums">{counter}</span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-(--color-text-muted)">{hint}</p> : null}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "grid h-10 gap-1 rounded-xl border border-(--color-border) bg-(--color-background-alt) p-1",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={
            value === option
              ? "rounded-lg bg-white text-xs font-semibold text-(--brand-accent) shadow-(--shadow-small)"
              : "rounded-lg text-xs font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}
