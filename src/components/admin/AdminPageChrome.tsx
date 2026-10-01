import { useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AdminShellContext } from "./AdminShellContext";

export function AdminPageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
  className?: string;
}) {
  const { workspaceLabel } = useContext(AdminShellContext);
  return (
    <div
      className={cn(
        "hero-reveal flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[11.5px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
          {eyebrow ?? workspaceLabel}
        </p>
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
      {actions ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function AdminPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-(--color-border) bg-white shadow-(--shadow-small) transition-shadow duration-300",
        className,
      )}
    >
      {children}
    </div>
  );
}
