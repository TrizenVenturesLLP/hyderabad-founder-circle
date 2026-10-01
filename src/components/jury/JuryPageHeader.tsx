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
    <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
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
          <p className="mt-1.5 max-w-[60ch] text-[13px] leading-relaxed text-(--color-text-secondary) sm:text-[13.5px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2 max-sm:has-[>button]:w-full max-sm:[&>button]:flex-1">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
