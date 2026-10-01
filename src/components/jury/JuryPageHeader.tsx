import type { ReactNode } from "react";
import { useJuryWorkspace } from "./JuryWorkspaceContext";

type JuryPageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function JuryPageHeader({ title, description, actions }: JuryPageHeaderProps) {
  const { currentHackathon } = useJuryWorkspace();
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {currentHackathon ? (
          <p className="text-[11.5px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
            {currentHackathon.name}
          </p>
        ) : null}
        <h1
          className="mt-1.5 font-semibold leading-[1.1] tracking-[-0.03em] text-foreground"
          style={{ fontFamily: "var(--font-brand)", fontSize: "clamp(1.4rem, 2.4vw, 1.85rem)" }}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-[60ch] text-[13.5px] leading-relaxed text-(--color-text-secondary)">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
