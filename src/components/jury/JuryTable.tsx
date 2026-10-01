import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Search, X } from "lucide-react";
import { AppSelect } from "@/components/AppSelect";
import { cn } from "@/lib/utils";

export function JuryToolbar({
  search,
  onSearchChange,
  placeholder,
  children,
  summary,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  children?: ReactNode;
  summary?: ReactNode;
}) {
  return (
    <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative block w-full sm:w-80">
          <span className="sr-only">Search</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--color-text-muted)"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={placeholder}
            className="h-10 w-full rounded-full border border-(--color-border) bg-white pr-9 pl-10 text-sm outline-none transition-colors focus:border-(--brand-accent) [&::-webkit-search-cancel-button]:hidden"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-(--color-text-muted) hover:bg-(--color-background-alt) hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </label>
        {children}
      </div>
      {summary ? <p className="text-xs text-(--color-text-muted)">{summary}</p> : null}
    </div>
  );
}

export function JuryFilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <AppSelect
      ariaLabel={label}
      value={value}
      onValueChange={onChange}
      options={options}
      shape="pill"
      className="w-full sm:w-auto sm:min-w-44"
    />
  );
}

export function JuryTable({
  columns,
  children,
  minWidth = 720,
}: {
  columns: { label: string; className?: string }[];
  children: ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-(--color-border) bg-white shadow-(--shadow-small)">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          <thead className="border-b border-(--color-border) bg-(--color-background-alt)">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-[11px] font-semibold tracking-[0.06em] whitespace-nowrap text-(--color-text-muted) uppercase",
                    column.className,
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function JuryTableMessage({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-10 text-center text-sm text-(--color-text-secondary)"
      >
        {children}
      </td>
    </tr>
  );
}

const badgeTones = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-sky-50 text-sky-800 ring-sky-200",
  gray: "bg-(--color-background-alt) text-(--color-text-secondary) ring-(--color-border)",
};

export function JuryBadge({
  tone,
  children,
}: {
  tone: keyof typeof badgeTones;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        badgeTones[tone],
      )}
    >
      {children}
    </span>
  );
}

const buttonVariants = {
  primary:
    "bg-(--brand-accent) text-white shadow-[0_6px_16px_-10px_var(--brand-accent)] hover:bg-(--brand-accent-hover)",
  secondary:
    "border border-(--color-border) bg-white text-foreground hover:border-(--color-border-strong) hover:bg-(--color-background-alt)",
};

export function JuryButton({
  variant = "secondary",
  size = "sm",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "h-8 px-3.5 text-xs" : "h-10 px-5 text-sm",
        buttonVariants[variant],
        className,
      )}
    />
  );
}
