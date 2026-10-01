import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

export function JuryBrandLink({
  tone = "light",
  subtitle = "Jury workspace",
  className,
  onNavigate,
}: {
  tone?: "light" | "dark";
  subtitle?: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const dark = tone === "dark";
  return (
    <Link
      to="/"
      onClick={onNavigate}
      aria-label="Trizen Community home"
      className={cn("group inline-flex min-w-0 items-center gap-2.5 rounded-xl", className)}
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
