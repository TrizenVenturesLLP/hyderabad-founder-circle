import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, RotateCcw, Search, Trophy } from "lucide-react";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageChrome";
import { HackathonNav, hackathonSectionPageClass } from "@/components/admin/HackathonNav";
import {
  fetchAdminHackathonLeaderboard,
  type AdminHackathonLeaderboard,
  type AdminHackathonLeaderboardEntry,
} from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/hackathons/$hackathonId/leaderboard")({
  component: AdminHackathonLeaderboardPage,
});

const domainLabels: Record<string, string> = {
  "ui-ux": "UI/UX",
  "web-dev": "Web Development",
  "vibe-coding": "Vibe Coding",
  "agentic-ai": "Agentic AI",
};

const emptyLeaderboard: AdminHackathonLeaderboard = {
  requiredEvaluations: 1,
  totalJuryMembers: 0,
  teamCount: 0,
  rankedCount: 0,
  items: [],
};

function csvCell(value: string | number | null) {
  const text = value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(hackathonId: string, items: AdminHackathonLeaderboardEntry[]) {
  const header = [
    "Rank",
    "Team",
    "Team lead",
    "Problem statement",
    "Domain",
    "Evaluations submitted",
    "Assigned jury",
    "Average score",
    "Highest score",
    "Lowest score",
  ];
  const rows = items.map((entry) => [
    entry.rank,
    entry.teamName,
    entry.leadName,
    [entry.problemStatementId, entry.problemStatementTitle].filter(Boolean).join(" — "),
    domainLabels[entry.domainId] || entry.domainId,
    entry.submittedEvaluations,
    entry.totalJuryMembers,
    entry.averageScore,
    entry.highestScore,
    entry.lowestScore,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${hackathonId}-leaderboard.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null) return <span className="text-muted-foreground">—</span>;
  const tone =
    rank === 1
      ? "bg-amber-100 text-amber-800"
      : rank === 2
        ? "bg-slate-200 text-slate-700"
        : rank === 3
          ? "bg-orange-100 text-orange-800"
          : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-xs font-bold tabular-nums",
        tone,
      )}
    >
      {rank}
    </span>
  );
}

function AdminHackathonLeaderboardPage() {
  const { hackathonId } = Route.useParams();
  const [data, setData] = useState<AdminHackathonLeaderboard>(emptyLeaderboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchAdminHackathonLeaderboard(hackathonId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load leaderboard.");
    } finally {
      setLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data.items;
    return data.items.filter((entry) =>
      [entry.teamName, entry.leadName, entry.problemStatementId, entry.problemStatementTitle]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [data.items, search]);

  const topTeams = data.items.filter((entry) => entry.rank !== null && entry.rank <= 3);
  const evaluatedTeams = data.items.filter((entry) => entry.submittedEvaluations > 0).length;
  const thresholdText =
    data.requiredEvaluations === 1
      ? "1 submitted Jury evaluation"
      : `${data.requiredEvaluations} submitted Jury evaluations`;

  return (
    <div className={`space-y-6 p-4 sm:p-5 md:p-6 ${hackathonSectionPageClass}`}>
      <HackathonNav hackathonId={hackathonId} active="leaderboard" />
      <AdminPageHeader
        title="Leaderboard"
        description={`Teams are ranked by their average Jury score once they have ${thresholdText}. Drafts are not counted.`}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3.5 text-xs font-semibold transition-colors hover:bg-muted"
            >
              <RotateCcw className="size-3.5" />
              Refresh
            </button>
            <button
              type="button"
              disabled={!data.items.length}
              onClick={() => downloadCsv(hackathonId, data.items)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-(--brand-primary) px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Download className="size-3.5" />
              Export CSV
            </button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Active teams", value: data.teamCount },
          { label: "Teams evaluated", value: evaluatedTeams },
          { label: "Teams ranked", value: data.rankedCount },
          { label: "Assigned Jury", value: data.totalJuryMembers },
        ].map((stat) => (
          <AdminPanel key={stat.label} className="p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</p>
          </AdminPanel>
        ))}
      </div>

      {topTeams.length ? (
        <div className="grid gap-3 md:grid-cols-3">
          {topTeams.map((entry) => (
            <AdminPanel key={entry.teamId} className="flex items-center gap-3 p-4">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-md",
                  entry.rank === 1
                    ? "bg-amber-100 text-amber-700"
                    : entry.rank === 2
                      ? "bg-slate-200 text-slate-700"
                      : "bg-orange-100 text-orange-700",
                )}
              >
                <Trophy className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  Rank {entry.rank}
                </p>
                <p className="truncate font-semibold">{entry.teamName}</p>
              </div>
              <p className="text-lg font-bold tabular-nums">
                {entry.averageScore?.toFixed(1)}
                <span className="text-xs font-medium text-muted-foreground"> / 100</span>
              </p>
            </AdminPanel>
          ))}
        </div>
      ) : null}

      {error ? (
        <AdminPanel className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </AdminPanel>
      ) : null}

      <AdminPanel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Search teams</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search team, lead, or statement"
              className="h-9 w-full rounded-md border border-border bg-white pr-3 pl-9 text-sm outline-none focus:border-(--brand-accent)"
            />
          </label>
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {data.items.length} teams
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="w-16 px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium">Problem statement</th>
                <th className="px-4 py-3 font-medium">Evaluations</th>
                <th className="px-4 py-3 font-medium">Score range</th>
                <th className="px-4 py-3 text-right font-medium">Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Loading leaderboard…
                  </td>
                </tr>
              ) : !filtered.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    {data.items.length ? "No teams match your search." : "No active teams yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => {
                  const missing = Math.max(
                    0,
                    data.requiredEvaluations - entry.submittedEvaluations,
                  );
                  return (
                    <tr key={entry.teamId} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <RankBadge rank={entry.rank} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{entry.teamName}</p>
                        {entry.leadName ? (
                          <p className="text-xs text-muted-foreground">Lead: {entry.leadName}</p>
                        ) : null}
                      </td>
                      <td className="max-w-[280px] px-4 py-3">
                        {entry.problemStatementId ? (
                          <>
                            <p className="font-mono text-xs font-semibold text-(--brand-accent)">
                              {entry.problemStatementId}
                              {entry.domainId ? (
                                <span className="ml-1.5 font-sans font-normal text-muted-foreground">
                                  · {domainLabels[entry.domainId] || entry.domainId}
                                </span>
                              ) : null}
                            </p>
                            <p className="truncate text-xs">{entry.problemStatementTitle}</p>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not selected</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                        {entry.submittedEvaluations} of {entry.totalJuryMembers} submitted
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                        {entry.highestScore === null
                          ? "—"
                          : `${entry.lowestScore} – ${entry.highestScore}`}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {entry.averageScore === null ? (
                          <span className="text-xs font-normal text-muted-foreground">
                            {entry.submittedEvaluations ? `Needs ${missing} more` : "Not evaluated"}
                          </span>
                        ) : (
                          `${entry.averageScore.toFixed(1)} / 100`
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
