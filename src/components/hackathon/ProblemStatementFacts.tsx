import { cn } from "@/lib/utils";

type ProblemStatementFactsProps = {
  industry?: string;
  scope?: string;
  platform?: string;
  description: string;
  className?: string;
};

function FactRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-1 border-b border-(--color-border) py-2.5 last:border-b-0 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[11px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase sm:pt-0.5">
        {label}
      </dt>
      <dd
        className={cn(
          "text-sm leading-relaxed",
          value ? "text-foreground" : "text-(--color-text-muted) italic",
          multiline && "whitespace-pre-wrap",
        )}
      >
        {value || "Not specified"}
      </dd>
    </div>
  );
}

export function ProblemStatementFacts({
  industry,
  scope,
  platform,
  description,
  className,
}: ProblemStatementFactsProps) {
  return (
    <dl className={cn("rounded-md border border-(--color-border) bg-white px-4", className)}>
      <FactRow label="Industry" value={industry?.trim()} />
      <FactRow label="Scope" value={scope?.trim()} multiline />
      <FactRow label="Platform / Tech" value={platform?.trim()} />
      <FactRow label="Description" value={description.trim()} multiline />
    </dl>
  );
}
