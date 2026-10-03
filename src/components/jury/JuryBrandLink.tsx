import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

export function JuryBrandLink({
  tone = "light",
  subtitle = "Jury workspace",
  className,
  onNavigate,
  reloadDocument = false,
}: {
  tone?: "light" | "dark";
  subtitle?: string;
  className?: string;
  onNavigate?: () => void;
  reloadDocument?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <Link
      to="/"
      reloadDocument={reloadDocument}
      preload={reloadDocument ? false : "intent"}
      onClick={onNavigate}
      aria-label="Go to Trizen Community home page"
      title="Go to home page"
      className={cn(
        "group inline-flex min-w-0 cursor-pointer items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-(--brand-accent) focus-visible:ring-offset-2",
        dark && "focus-visible:ring-offset-(--brand-primary)",
        className,
      )}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center transition-transform duration-200 group-hover:scale-105",
          dark ? "size-10 rounded-xl bg-white p-1.5" : "size-9",
        )}
      >
        <BrandLogo className="size-full" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className={cn(
            "truncate text-[15px] font-semibold tracking-tight transition-colors",
            dark ? "text-white group-hover:text-white/80" : "group-hover:text-(--brand-accent)",
          )}
          style={{ fontFamily: "var(--font-brand)" }}
        >
          Trizen Community
        </span>
        <span
          className={cn(
            "truncate text-[10.5px] font-medium",
            dark ? "text-white/60" : "text-(--color-text-muted)",
          )}
        >
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
