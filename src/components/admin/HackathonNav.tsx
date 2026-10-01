import { Link } from "@tanstack/react-router";
import { ChevronRight, ClipboardCheck, FileText, Gavel, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { findAdminHackathon } from "@/lib/admin-hackathons";

export type HackathonSection = "statements" | "teams" | "jury" | "evaluations" | "leaderboard";

const tabClass = (active: boolean) =>
  cn(
    "relative inline-flex shrink-0 items-center gap-2 px-1 pt-1 pb-3 text-[13.5px] font-medium whitespace-nowrap transition-colors",
    active
      ? "text-(--brand-primary) after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-(--brand-accent)"
      : "text-(--color-text-secondary) hover:text-foreground",
  );

export function HackathonNav({
  hackathonId,
  active,
  pendingCount = 0,
}: {
  hackathonId: string;
  active: HackathonSection;
  pendingCount?: number;
}) {
  const hackathon = findAdminHackathon(hackathonId);
  const title = hackathon?.title || hackathonId;

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
        <Link
          to="/admin/hackathons"
          search={{}}
          className="font-medium text-(--color-text-secondary) transition-colors hover:text-(--brand-accent)"
        >
          Hackathons
        </Link>
        <ChevronRight className="size-3.5 text-(--color-text-muted)" aria-hidden />
        <span className="truncate font-semibold text-foreground">{title}</span>
        {hackathon ? (
          <span className="ml-1 rounded-full bg-(--brand-accent-soft) px-2 py-0.5 text-[11px] font-semibold text-(--brand-accent)">
            {hackathon.status}
          </span>
        ) : null}
      </nav>

      <div
        role="tablist"
        aria-label="Hackathon sections"
        className="flex gap-6 overflow-x-auto border-b border-(--color-border) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Link
          to="/admin/hackathons"
          search={{ hackathon: hackathonId }}
          role="tab"
          aria-selected={active === "statements"}
          className={tabClass(active === "statements")}
        >
          <FileText className="size-4" strokeWidth={1.75} />
          Problem Statements
          {pendingCount > 0 ? (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10.5px] font-bold text-amber-800">
              {pendingCount}
            </span>
          ) : null}
        </Link>
        <Link
          to="/admin/hackathons"
          search={{ hackathon: hackathonId, view: "teams" }}
          role="tab"
          aria-selected={active === "teams"}
          className={tabClass(active === "teams")}
        >
          <Users className="size-4" strokeWidth={1.75} />
          Registered Teams
        </Link>
        <Link
          to="/admin/hackathons/$hackathonId/jury"
          params={{ hackathonId }}
          role="tab"
          aria-selected={active === "jury"}
          className={tabClass(active === "jury")}
        >
          <Gavel className="size-4" strokeWidth={1.75} />
          Jury
        </Link>
        <Link
          to="/admin/hackathons/$hackathonId/evaluations"
          params={{ hackathonId }}
          role="tab"
          aria-selected={active === "evaluations"}
          className={tabClass(active === "evaluations")}
        >
          <ClipboardCheck className="size-4" strokeWidth={1.75} />
          Evaluations
        </Link>
        <Link
          to="/admin/hackathons/$hackathonId/leaderboard"
          params={{ hackathonId }}
          role="tab"
          aria-selected={active === "leaderboard"}
          className={tabClass(active === "leaderboard")}
        >
          <Trophy className="size-4" strokeWidth={1.75} />
          Leaderboard
        </Link>
      </div>
    </div>
  );
}
