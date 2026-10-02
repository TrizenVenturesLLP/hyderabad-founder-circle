import { cn } from "@/lib/utils";
import { links } from "@/lib/links";

type ProblemStatementFactsProps = {
  statementId?: string;
  title?: string;
  domain?: string;
  organization?: string;
  contactInfo?: string;
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
          "text-sm leading-relaxed sm:border-l sm:border-(--color-border) sm:pl-4",
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
  statementId,
  title,
  domain,
  organization,
  contactInfo,
  industry,
  scope,
  platform,
  description,
  className,
}: ProblemStatementFactsProps) {
  return (
    <dl className={cn("rounded-md border border-(--color-border) bg-white px-4", className)}>
      {statementId ? <FactRow label="Problem Statement ID" value={statementId} /> : null}
      {title ? <FactRow label="Problem Statement Title" value={title} /> : null}
      {domain ? <FactRow label="Domain" value={domain} /> : null}
      {organization?.trim() ? <FactRow label="Organization" value={organization.trim()} /> : null}
      <FactRow label="Industry" value={industry?.trim()} />
      <FactRow label="Scope" value={scope?.trim()} multiline />
      <FactRow label="Platform / Tech" value={platform?.trim()} />
      <FactRow label="Description" value={description.trim()} multiline />
      <FactRow label="Contact Info" value={contactInfo?.trim() || links.phone} />
    </dl>
  );
}
