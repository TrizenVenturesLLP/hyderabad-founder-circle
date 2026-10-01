import { Link } from "@tanstack/react-router";
import { ClipboardCheck, FileText, Gavel, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { tabIndicatorClass, useTabIndicator } from "@/components/admin/useTabIndicator";

export type HackathonSection = "statements" | "teams" | "jury" | "evaluations" | "leaderboard";

const tabClass = (active: boolean) =>
  cn(
    "relative inline-flex shrink-0 items-center gap-2 px-1 pt-1 pb-3 text-[13.5px] font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--brand-accent)",
    active ? "text-(--brand-primary)" : "text-(--color-text-secondary) hover:text-foreground",
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
  const { containerRef, indicatorStyle } = useTabIndicator("hackathon-sections", active);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Hackathon sections"
      className="relative -mx-4 flex gap-5 overflow-x-auto border-b px-4 sm:mx-0 sm:gap-6 sm:px-0 border-(--color-border) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Link
        to="/admin/hackathons"
        search={{ hackathon: hackathonId }}
        role="tab"
        data-tab-key="statements"
        aria-selected={active === "statements"}
        className={tabClass(active === "statements")}
      >
        <FileText className="size-4" strokeWidth={1.75} />
        Problem Statements
        {pendingCount > 0 ? (
          <span className="bg-amber-100 px-1.5 py-0.5 text-[10.5px] font-bold text-amber-800">
            {pendingCount}
          </span>
        ) : null}
      </Link>
      <Link
        to="/admin/hackathons"
        search={{ hackathon: hackathonId, view: "teams" }}
        role="tab"
        data-tab-key="teams"
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
        data-tab-key="jury"
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
        data-tab-key="evaluations"
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
        data-tab-key="leaderboard"
        aria-selected={active === "leaderboard"}
        className={tabClass(active === "leaderboard")}
      >
        <Trophy className="size-4" strokeWidth={1.75} />
        Leaderboard
      </Link>
      <span aria-hidden className={tabIndicatorClass} style={indicatorStyle} />
    </div>
  );
}

/** Apply to the page wrapper whose first child is `HackathonNav`; fades in everything below the tabs. */
export const hackathonSectionPageClass =
  "[&>*:not(:first-child)]:animate-in [&>*:not(:first-child)]:fade-in-0 [&>*:not(:first-child)]:slide-in-from-bottom-1 [&>*:not(:first-child)]:duration-300 motion-reduce:[&>*]:animate-none";
