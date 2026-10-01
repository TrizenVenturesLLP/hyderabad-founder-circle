import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, LayoutDashboard, LogOut, Menu, Users, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

type StudentShellProps = {
  pathname: string;
  teamName?: string | null;
  roleLabel: string;
  memberCount?: number | null;
  displayName: string;
  email?: string | null;
  confirmedStatementId?: string | null;
  onLogout: () => void;
  children: ReactNode;
};

const linkClass = (active: boolean) =>
  cn(
    "group relative flex h-9 items-center gap-2.5 px-2.5 text-[13px] font-medium transition-colors",
    active
      ? "bg-(--brand-accent-soft) text-(--brand-primary) before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:bg-(--brand-accent)"
      : "text-(--color-text-secondary) hover:bg-(--color-background-alt) hover:text-foreground",
  );

const iconClass = (active: boolean) =>
  cn(
    "size-4 shrink-0 transition-colors",
    active ? "text-(--brand-accent)" : "text-(--color-text-muted) group-hover:text-foreground",
  );

const bottomLinkClass = (active: boolean) =>
  cn(
    "relative flex h-15 flex-col items-center justify-center gap-1 text-[10.5px] font-semibold transition-colors",
    active ? "text-(--brand-accent)" : "text-(--color-text-muted) hover:text-foreground",
  );

function BottomIndicator({ active }: { active: boolean }) {
  return active ? (
    <span
      aria-hidden
      className="absolute top-0 left-1/2 h-[3px] w-8 -translate-x-1/2 bg-(--brand-accent)"
    />
  ) : null;
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex min-w-0 items-center gap-2.5" aria-label="Dashboard">
      <span className="grid size-8 shrink-0 place-items-center">
        <BrandLogo className="size-full" />
      </span>
      <span className="min-w-0 leading-tight">
        <span
          className="block truncate text-[14px] font-semibold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-brand)" }}
        >
          Trizen Ventures
        </span>
        <span className="block truncate text-[10.5px] font-medium text-(--color-text-muted)">
          Student dashboard
        </span>
      </span>
    </Link>
  );
}

export function StudentShell({
  pathname,
  teamName,
  roleLabel,
  memberCount,
  displayName,
  email,
  confirmedStatementId,
  onLogout,
  children,
}: StudentShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const onProblemPage = pathname.startsWith("/hackathon/problems/");

  return (
    <div className="min-h-dvh bg-(--color-background-alt) text-foreground">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-(--color-border) bg-white/90 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="student-sidebar"
          className="-ml-1.5 flex size-9 items-center justify-center text-foreground transition-colors hover:bg-(--color-background-alt)"
        >
          <Menu className="size-5" strokeWidth={1.75} />
        </button>
        <Brand />
        <span
          className="ml-auto grid size-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--brand-accent),var(--brand-primary))] text-[11px] font-semibold text-white"
          title={teamName ? `${displayName} · ${teamName}` : displayName}
          aria-hidden
        >
          {initials}
        </span>
      </header>

      <div
        aria-hidden
        onClick={() => setMenuOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-[rgba(15,23,42,0.35)] backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        id="student-sidebar"
        aria-label="Student sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[240px] max-w-[85vw] flex-col border-r border-(--color-border) bg-white transition-[transform,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:visible lg:translate-x-0",
          menuOpen
            ? "visible translate-x-0 shadow-(--shadow-large)"
            : "invisible -translate-x-full",
        )}
      >
        <div className="flex h-15 shrink-0 items-center justify-between gap-2 border-b border-(--color-border) px-4">
          <Brand />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-background-alt) hover:text-foreground lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="border-b border-(--color-border) px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.08em] text-(--color-text-muted) uppercase">
            Your team
          </p>
          <p className="mt-0.5 truncate text-[13.5px] font-semibold text-foreground">
            {teamName || "Loading…"}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-(--color-text-secondary)">
            <span
              className={cn(
                "px-1.5 py-px text-[10.5px] font-semibold",
                roleLabel === "Team Lead"
                  ? "bg-(--brand-accent-soft) text-(--brand-accent)"
                  : "bg-(--color-background-alt) text-(--color-text-secondary)",
              )}
            >
              {roleLabel}
            </span>
            {memberCount ? `${memberCount} member${memberCount === 1 ? "" : "s"}` : null}
          </p>
        </div>

        <nav
          aria-label="Student navigation"
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5"
        >
          <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-semibold tracking-[0.08em] text-(--color-text-muted) uppercase">
            Hackathon
          </p>
          <Link
            to="/dashboard"
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            className={linkClass(pathname === "/dashboard")}
          >
            <LayoutDashboard className={iconClass(pathname === "/dashboard")} strokeWidth={1.75} />
            Overview
          </Link>
          {confirmedStatementId ? (
            <Link
              to="/hackathon/problems/$problemId"
              params={{ problemId: confirmedStatementId }}
              aria-current={onProblemPage ? "page" : undefined}
              className={linkClass(onProblemPage)}
            >
              <FileText className={iconClass(onProblemPage)} strokeWidth={1.75} />
              <span className="min-w-0 flex-1 truncate">Problem statement</span>
            </Link>
          ) : null}
          <Link
            to="/dashboard/team"
            aria-current={pathname === "/dashboard/team" ? "page" : undefined}
            className={linkClass(pathname === "/dashboard/team")}
          >
            <Users className={iconClass(pathname === "/dashboard/team")} strokeWidth={1.75} />
            My Team
          </Link>

          <div className="mt-auto pt-2">
            <Link to="/hackathon" className={linkClass(false)}>
              <ArrowLeft className={iconClass(false)} strokeWidth={1.75} />
              Hackathon page
            </Link>
          </div>
        </nav>

        <div className="flex items-center gap-2.5 border-t border-(--color-border) px-3 py-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--brand-accent),var(--brand-primary))] text-[11px] font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[12.5px] font-semibold text-foreground">{displayName}</p>
            <p
              className="truncate text-[11px] text-(--color-text-muted)"
              title={email || undefined}
            >
              {email || roleLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sign out"
            title="Sign out"
            className="grid size-8 shrink-0 place-items-center text-(--color-text-muted) transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </aside>

      <main id="main-content" className="min-w-0 p-4 pb-24 sm:p-6 sm:pb-24 lg:ml-[240px] lg:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <nav
        aria-label="Student sections"
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 grid border-t border-(--color-border) bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden",
          confirmedStatementId ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        <Link
          to="/dashboard"
          aria-current={pathname === "/dashboard" ? "page" : undefined}
          className={bottomLinkClass(pathname === "/dashboard")}
        >
          <BottomIndicator active={pathname === "/dashboard"} />
          <LayoutDashboard className="size-5" strokeWidth={1.75} />
          Overview
        </Link>
        {confirmedStatementId ? (
          <Link
            to="/hackathon/problems/$problemId"
            params={{ problemId: confirmedStatementId }}
            aria-current={onProblemPage ? "page" : undefined}
            className={bottomLinkClass(onProblemPage)}
          >
            <BottomIndicator active={onProblemPage} />
            <FileText className="size-5" strokeWidth={1.75} />
            Problem
          </Link>
        ) : null}
        <Link
          to="/dashboard/team"
          aria-current={pathname === "/dashboard/team" ? "page" : undefined}
          className={bottomLinkClass(pathname === "/dashboard/team")}
        >
          <BottomIndicator active={pathname === "/dashboard/team"} />
          <Users className="size-5" strokeWidth={1.75} />
          My Team
        </Link>
      </nav>
    </div>
  );
}
