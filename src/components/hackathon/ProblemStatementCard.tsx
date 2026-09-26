import { useState } from "react";
import { Check, Copy, ChevronDown, ChevronUp, Layers, Target } from "lucide-react";
import { toast } from "sonner";
import type { ProblemStatement } from "@/lib/hackathon";

interface ProblemStatementCardProps {
  statement: ProblemStatement;
  domainName: string;
}

export function ProblemStatementCard({ statement, domainName }: ProblemStatementCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const difficultyStyles = {
    Beginner: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    Intermediate: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    Advanced: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  }[statement.difficulty] || "bg-muted text-foreground border-border";

  function handleCopyId() {
    navigator.clipboard.writeText(`${statement.id}: ${statement.title}`);
    setCopied(true);
    toast.success(`Copied ${statement.id} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-card">
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
              {statement.id}
            </span>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${difficultyStyles}`}
            >
              {statement.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <Layers className="size-3" />
              {statement.category}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              title="Copy ID & Title"
              className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-95"
            >
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-3.5 font-display text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {statement.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {statement.description}
        </p>

        {/* Deliverables / Key Objectives */}
        {statement.deliverables && statement.deliverables.length > 0 && (
          <div className="mt-4 border-t border-border/70 pt-3">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between text-xs font-semibold text-foreground/80 hover:text-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <Target className="size-3.5 text-primary" />
                Key Deliverables & Objectives ({statement.deliverables.length})
              </span>
              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>

            {expanded && (
              <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                {statement.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
        <span>Domain: {domainName}</span>
        <button
          type="button"
          onClick={handleCopyId}
          className="font-medium text-primary hover:underline"
        >
          Copy Reference
        </button>
      </div>
    </article>
  );
}
