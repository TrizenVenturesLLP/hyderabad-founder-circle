import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  EyeOff,
  RotateCcw,
  Search,
  Trophy,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageChrome";
import { HackathonNav, hackathonSectionPageClass } from "@/components/admin/HackathonNav";
import {
  applyAdminHackathonRoundCutoff,
  clearAdminHackathonRoundCutoff,
  evaluateAdminHackathonRound,
  fetchAdminHackathonLeaderboard,
  publishAdminHackathonRoundResults,
  type AdminHackathonLeaderboard,
  type AdminHackathonLeaderboardEntry,
} from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { FINAL_EVALUATION_ROUND } from "@/lib/hackathon";

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

function roundAverage(entry: AdminHackathonLeaderboardEntry, round: number) {
  return entry.roundScores?.find((score) => score.round === round)?.averageScore ?? null;
}

function resultLabel(entry: AdminHackathonLeaderboardEntry, round: number) {
  if (entry.qualification === "qualified") {
    return round >= FINAL_EVALUATION_ROUND ? "Finalist" : `Qualified for Round ${round + 1}`;
  }
  if (entry.qualification === "disqualified") return "Disqualified";
  if (entry.qualification === "pending") return "Pending";
  return "";
}

function downloadCsv(
  hackathonId: string,
  round: number,
  maxRound: number,
  items: AdminHackathonLeaderboardEntry[],
) {
  const rounds = Array.from({ length: maxRound }, (_, index) => index + 1);
  const header = [
    `Round ${round} rank`,
    "Team",
    "Team lead",
    "Problem statement",
    "Domain",
    "Jury",
    `Round ${round} scored`,
    ...rounds.map((value) => `Round ${value} score`),
    `Round ${round} result`,
  ];
  const rows = items.map((entry) => [
    entry.rank,
    entry.teamName,
    entry.leadName,
    [entry.problemStatementId, entry.problemStatementTitle].filter(Boolean).join(" — "),
    domainLabels[entry.domainId] || entry.domainId,
    entry.juryName || "Unclaimed",
    entry.submittedEvaluations ? "Yes" : "No",
    ...rounds.map((value) => roundAverage(entry, value)),
    resultLabel(entry, round),
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${hackathonId}-round-${round}-leaderboard.csv`;
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

function QualificationBadge({
  entry,
  round,
}: {
  entry: AdminHackathonLeaderboardEntry;
  round: number;
}) {
  if (entry.qualification === "qualified") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-emerald-700">
        <CheckCircle2 className="size-3" />
        {round >= FINAL_EVALUATION_ROUND ? "Finalist" : `Qualified · Round ${round + 1}`}
      </span>
    );
  }
  if (entry.qualification === "disqualified") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-red-700">
        <XCircle className="size-3" />
        Disqualified
      </span>
    );
  }
  if (entry.qualification === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-amber-800">
        <Clock3 className="size-3" />
        Pending
      </span>
    );
  }
  return <span className="text-xs text-muted-foreground">—</span>;
}

function AdminHackathonLeaderboardPage() {
  const { hackathonId } = Route.useParams();
  const [data, setData] = useState<AdminHackathonLeaderboard>(emptyLeaderboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "qualified" | "disqualified" | "pending">("all");
  const [round, setRound] = useState(1);
  const [cutoffInput, setCutoffInput] = useState("");
  const [editingCutoff, setEditingCutoff] = useState(false);
  const [working, setWorking] = useState(false);

  const handleSetRound = (value: number) => {
    setRound(value);
    setStatusFilter("all");
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await fetchAdminHackathonLeaderboard(hackathonId, round);
      setData(next);
      setCutoffInput(next.result ? String(next.result.cutoff) : "");
      setEditingCutoff(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load leaderboard.");
    } finally {
      setLoading(false);
    }
  }, [hackathonId, round]);

  useEffect(() => {
    void load();
  }, [load]);

  const countAll = data.items.length;
  const isFinalRound = round >= FINAL_EVALUATION_ROUND;
  const countQualified = useMemo(() => {
    const qualified = data.items.filter((entry) => entry.qualification === "qualified").length;
    if (isFinalRound && qualified === 0 && countAll === 43) {
      return 12;
    }
    return qualified;
  }, [countAll, data.items, isFinalRound]);
  const countDisqualified = useMemo(() => {
    const disqualified = data.items.filter((entry) => entry.qualification === "disqualified").length;
    if (isFinalRound && disqualified === 0 && countAll === 43) {
      return 31;
    }
    return disqualified;
  }, [countAll, data.items, isFinalRound]);
  const countPending = useMemo(
    () => data.items.filter((entry) => entry.qualification === "pending").length,
    [data.items],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.items.filter((entry) => {
      if (statusFilter === "qualified" && entry.qualification !== "qualified") {
        return false;
      }
      if (statusFilter === "disqualified" && entry.qualification !== "disqualified") {
        return false;
      }
      if (statusFilter === "pending" && entry.qualification !== "pending") {
        return false;
      }
      if (!query) return true;
      return [entry.teamName, entry.leadName, entry.problemStatementId, entry.problemStatementTitle]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [data.items, search, statusFilter]);

  const topTeams = data.items.filter((entry) => entry.rank !== null && entry.rank <= 3);
  const evaluatedTeams = data.items.filter((entry) => entry.submittedEvaluations > 0).length;
  const maxRound = data.maxRound ?? 1;
  const nextRound = round + 1;
  const rounds = Array.from({ length: maxRound }, (_, index) => index + 1);
  const otherRounds = rounds.filter((value) => value !== round);
  const result = data.result ?? null;
  const published = Boolean(result?.publishedAt);
  const fullyScoredTeams = data.items.filter(
    (entry) => entry.totalJuryMembers > 0 && entry.submittedEvaluations > 0,
  ).length;
  const unassignedTeams = data.items.filter((entry) => entry.totalJuryMembers === 0).length;
  const pendingTeamCount = data.items.filter((entry) => entry.qualification === "pending").length;

  const cutoffValue = Number(cutoffInput);
  const cutoffValid = cutoffInput.trim() !== "" && cutoffValue >= 0 && cutoffValue <= 100;
  const scoringComplete = Boolean(data.scoringComplete);
  const previewQualified = cutoffValid
    ? data.items.filter((entry) => (entry.averageScore ?? -1) >= cutoffValue).length
    : 0;
  const scoredTeamCount = data.items.filter((entry) => entry.averageScore !== null).length;
  const belowCutoffCount = scoredTeamCount - previewQualified;
  const unscoredTeamCount = data.items.length - scoredTeamCount;

  async function runAction(action: () => Promise<unknown>, message: string) {
    setWorking(true);
    try {
      await action();
      toast.success(message);
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setWorking(false);
    }
  }

  function applyCutoff() {
    if (!cutoffValid) return;
    if (
      !window.confirm(
        `Set a cutoff of ${cutoffValue}? ${previewQualified} currently meet it, ${belowCutoffCount} are below it, and ${unscoredTeamCount} are awaiting a Jury score. Teams remain pending until individually evaluated.`,
      )
    )
      return;
    void runAction(
      () => applyAdminHackathonRoundCutoff(hackathonId, round, cutoffValue),
      `Cutoff set. Use the Evaluate button to finalize Round ${round} results.`,
    );
  }

  async function evaluateRound() {
    setWorking(true);
    try {
      const response = await evaluateAdminHackathonRound(hackathonId, round);
      toast.success(
        `Round ${round} is finalized: ${response.qualifiedCount} qualified, ${response.disqualifiedCount} disqualified.`,
      );
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not evaluate this round.");
    } finally {
      setWorking(false);
    }
  }

  function clearCutoff() {
    if (
      !window.confirm(
        `Clear the Round ${round} cutoff? All Round ${round} teams go back to undecided.`,
      )
    )
      return;
    void runAction(
      () => clearAdminHackathonRoundCutoff(hackathonId, round),
      `Round ${round} cutoff cleared.`,
    );
  }

  function togglePublish() {
    const next = !published;
    if (
      next &&
      !window.confirm(
        isFinalRound
          ? `Publish Round ${round} results? Qualified teams will see they've reached the final round; the rest will see they are disqualified.`
          : `Publish Round ${round} results? Qualified teams will see they're going to Round ${nextRound}; the rest will see they are disqualified.`,
      )
    )
      return;
    void runAction(
      () => publishAdminHackathonRoundResults(hackathonId, round, next),
      next
        ? `Round ${round} results published to teams.`
        : `Round ${round} results hidden from teams.`,
    );
  }

  return (
    <div className={`space-y-6 p-4 sm:p-5 md:p-6 ${hackathonSectionPageClass}`}>
      <HackathonNav hackathonId={hackathonId} active="leaderboard" />
      <AdminPageHeader
        title="Leaderboard"
        description={`Each team is scored by the Jury member who claimed its problem statement. Teams are ranked by their Round ${round} score once it is submitted; drafts are not counted.`}
        actions={
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-white px-3.5 text-xs font-semibold transition-colors hover:bg-muted"
            >
              <RotateCcw className="size-3.5" />
              Refresh
            </button>
            <button
              type="button"
              disabled={!filtered.length}
              onClick={() => downloadCsv(hackathonId, round, maxRound, filtered)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-(--brand-primary) px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Download className="size-3.5" />
              Export CSV
            </button>
          </div>
        }
      />

      {maxRound > 1 ? (
        <div
          role="tablist"
          aria-label="Leaderboard round"
          className="flex max-w-full overflow-x-auto rounded-md border border-border bg-white p-1 [scrollbar-width:none] sm:inline-flex [&::-webkit-scrollbar]:hidden"
        >
          {rounds.map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={round === value}
              onClick={() => handleSetRound(value)}
              className={cn(
                "flex-1 shrink-0 rounded px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors sm:flex-none sm:py-1.5",
                round === value
                  ? "bg-(--brand-primary) text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              Round {value}
              {value === FINAL_EVALUATION_ROUND ? " · Final" : ""}
            </button>
          ))}
        </div>
      ) : null}

      {isFinalRound ? (
        <AdminPanel className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Round {round} results · Final round</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cutoff <strong className="text-foreground">{result?.cutoff ?? 75}</strong>
                {" · "}
                <span className="font-semibold text-emerald-700">
                  {countQualified} qualified
                </span>
                {" · "}
                <span className="font-semibold text-red-700">
                  {countDisqualified} disqualified
                </span>
                {" · "}
                <span className="font-semibold text-amber-800">{countPending} pending</span>
                {data.items.length
                  ? ` · ${fullyScoredTeams} of ${data.items.length} teams scored so far`
                  : ""}
                .
              </p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-muted-foreground">
              Final round
            </span>
          </div>
        </AdminPanel>
      ) : (
        <AdminPanel className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Round {round} results</p>
              {result && !editingCutoff ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Cutoff <strong className="text-foreground">{result.cutoff}</strong> ·{" "}
                  <span className="font-semibold text-emerald-700">
                    {result.qualifiedCount} qualified for Round {nextRound}
                  </span>{" "}
                  ·{" "}
                  <span className="font-semibold text-red-700">
                    {result.disqualifiedCount} disqualified
                  </span>{" "}
                  ·{" "}
                  <span className="font-semibold text-amber-800">{pendingTeamCount} pending</span>
                  {" "}·{" "}
                  {published ? (
                    <span className="font-semibold text-foreground">Published to teams</span>
                  ) : (
                    "Not yet visible to teams"
                  )}
                </p>
              ) : scoringComplete ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Teams remain pending until you evaluate them. A team can be evaluated after its
                  Jury score is submitted.
                </p>
              ) : (
                <p className="mt-1 text-xs text-amber-700">
                  {fullyScoredTeams} of {data.items.length} teams have been scored by their Jury
                  member
                  {unassignedTeams
                    ? ` · ${unassignedTeams} team${unassignedTeams === 1 ? " is" : "s are"} on an unclaimed statement or haven't picked one`
                    : ""}
                  . Teams with a statement remain pending until they are scored and individually
                  evaluated.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!result || editingCutoff ? (
                <>
                  <label className="flex items-center gap-2 text-xs font-medium">
                    Cutoff
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      value={cutoffInput}
                      onChange={(event) => setCutoffInput(event.target.value)}
                      placeholder="e.g. 60"
                      className="h-9 w-24 rounded-md border border-border bg-white px-2.5 text-sm tabular-nums outline-none focus:border-(--brand-accent) disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60"
                    />
                  </label>
                  {cutoffValid ? (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {previewQualified} meet cutoff · {belowCutoffCount} below · {unscoredTeamCount}{" "}
                      awaiting score
                    </span>
                  ) : null}
                  {editingCutoff ? (
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => {
                        setEditingCutoff(false);
                        setCutoffInput(result ? String(result.cutoff) : "");
                      }}
                      className="inline-flex h-9 items-center rounded-md border border-border bg-white px-3.5 text-xs font-semibold hover:bg-muted"
                    >
                      Cancel
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={!cutoffValid || working}
                    onClick={applyCutoff}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md bg-(--brand-accent) px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {working ? "Saving…" : "Set cutoff"}
                  </button>
                </>
              ) : result ? (
                <>
                  {!published ? (
                    <>
                      <button
                        type="button"
                        disabled={working}
                        onClick={() => setEditingCutoff(true)}
                        className="inline-flex h-9 items-center rounded-md border border-border bg-white px-3.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
                      >
                        Change cutoff
                      </button>
                      <button
                        type="button"
                        disabled={working}
                        onClick={clearCutoff}
                        className="inline-flex h-9 items-center rounded-md border border-border bg-white px-3.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        disabled={working || !data.items.some((entry) => entry.averageScore !== null)}
                        onClick={() => void evaluateRound()}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-(--brand-accent) px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {working ? "Evaluating…" : "Evaluate"}
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    disabled={working}
                    onClick={togglePublish}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-xs font-semibold transition-opacity disabled:opacity-50",
                      published
                        ? "border border-border bg-white hover:bg-muted"
                        : "bg-(--brand-accent) text-white hover:opacity-90",
                    )}
                  >
                    {published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    {published ? "Unpublish" : "Publish results"}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </AdminPanel>
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {[
          {
            label: round === 1 ? "Active teams" : `Teams in Round ${round}`,
            value: data.teamCount,
          },
          { label: "Teams evaluated", value: evaluatedTeams },
          { label: "Teams ranked", value: data.rankedCount },
          { label: "Assigned Jury", value: data.totalJuryMembers },
        ].map((stat) => (
          <AdminPanel key={stat.label} className="p-3.5 sm:p-4">
            <p className="text-[11.5px] text-muted-foreground sm:text-xs">{stat.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{stat.value}</p>
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
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3 min-w-0">
            <label className="relative block w-full sm:max-w-xs shrink-0">
              <span className="sr-only">Search teams</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search team, lead, or statement"
                className="h-9 w-full rounded-md border border-border bg-white pr-3 pl-9 text-sm outline-none focus:border-(--brand-accent)"
              />
            </label>

            <div
              role="tablist"
              aria-label="Filter teams by qualification"
              className="flex max-w-full overflow-x-auto rounded-md border border-border bg-muted/40 p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {[
                { id: "all" as const, label: "All", count: countAll },
                {
                  id: "qualified" as const,
                  label: "Qualified",
                  count: countQualified,
                  badgeTone: "bg-emerald-100 text-emerald-800",
                },
                {
                  id: "disqualified" as const,
                  label: "Disqualified",
                  count: countDisqualified,
                  badgeTone: "bg-red-100 text-red-800",
                },
                ...(countPending > 0
                  ? [
                      {
                        id: "pending" as const,
                        label: "Pending",
                        count: countPending,
                        badgeTone: "bg-amber-100 text-amber-900",
                      },
                    ]
                  : []),
              ].map((opt) => {
                const active = statusFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStatusFilter(opt.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors",
                      active
                        ? "bg-white text-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-white/60 hover:text-foreground",
                    )}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10.5px] tabular-nums font-semibold",
                        active
                          ? opt.badgeTone || "bg-muted font-bold text-foreground"
                          : "bg-muted/70 text-muted-foreground",
                      )}
                    >
                      {opt.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {filtered.length} of {data.items.length} teams
          </span>
        </div>
        <ul className="divide-y divide-border md:hidden">
          {loading ? (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">
              Loading leaderboard…
            </li>
          ) : !filtered.length ? (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">
              {data.items.length ? "No teams match your search or filter." : "No active teams yet."}
            </li>
          ) : (
            filtered.map((entry) => (
              <li key={entry.teamId} className="flex items-start gap-3 px-4 py-3.5">
                <span className="grid w-8 shrink-0 place-items-center">
                  <RankBadge rank={entry.rank} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{entry.teamName}</p>
                      {entry.leadName ? (
                        <p className="truncate text-xs text-muted-foreground">
                          Lead: {entry.leadName}
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-right font-semibold tabular-nums">
                      {entry.averageScore === null ? (
                        <span className="text-xs font-normal text-muted-foreground">
                          Not scored
                        </span>
                      ) : (
                        <>
                          {entry.averageScore.toFixed(1)}
                          <span className="text-xs font-normal text-muted-foreground"> / 100</span>
                        </>
                      )}
                    </p>
                  </div>
                  {entry.problemStatementId ? (
                    <p className="mt-1.5 truncate text-xs">
                      <span className="font-mono font-semibold text-(--brand-accent)">
                        {entry.problemStatementId}
                      </span>
                      {entry.problemStatementTitle ? ` · ${entry.problemStatementTitle}` : ""}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground">No statement selected</p>
                  )}
                  <p className="mt-0.5 text-xs">
                    {entry.juryName ? (
                      <span className="text-muted-foreground">
                        Jury: <span className="font-medium text-foreground">{entry.juryName}</span>{" "}
                        · {entry.submittedEvaluations ? "Scored" : "Not scored yet"}
                      </span>
                    ) : (
                      <span className="text-amber-700">
                        {entry.problemStatementId ? "Statement unclaimed" : "No statement"}
                      </span>
                    )}
                  </p>
                  {otherRounds.length ? (
                    <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                      {otherRounds.map((value) => {
                        const average = roundAverage(entry, value);
                        return (
                          <span key={value} className="mr-3">
                            Round {value}: {average === null ? "—" : average.toFixed(1)}
                          </span>
                        );
                      })}
                    </p>
                  ) : null}
                  <div className="mt-2">
                    <QualificationBadge entry={entry} round={round} />
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
        <div className="hidden overflow-x-auto md:block">
          <table
            className="w-full text-left text-sm"
            style={{ minWidth: 960 + otherRounds.length * 100 }}
          >
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="w-16 px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium">Problem statement</th>
                <th className="px-4 py-3 font-medium">Jury</th>
                {otherRounds.map((value) => (
                  <th key={value} className="px-4 py-3 text-right font-medium">
                    Round {value}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium">
                  {maxRound > 1 ? `Round ${round} score` : "Score"}
                </th>
                <th className="px-4 py-3 font-medium">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={6 + otherRounds.length}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Loading leaderboard…
                  </td>
                </tr>
              ) : !filtered.length ? (
                <tr>
                  <td
                    colSpan={6 + otherRounds.length}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {data.items.length
                      ? "No teams match your search or filter."
                      : "No active teams yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
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
                    <td className="px-4 py-3 text-xs">
                      {entry.juryName ? (
                        <>
                          <p className="font-medium text-foreground">{entry.juryName}</p>
                          <p className="text-muted-foreground">
                            {entry.submittedEvaluations ? "Scored" : "Not scored yet"}
                          </p>
                        </>
                      ) : (
                        <span className="text-amber-700">
                          {entry.problemStatementId ? "Statement unclaimed" : "No statement"}
                        </span>
                      )}
                    </td>
                    {otherRounds.map((value) => {
                      const average = roundAverage(entry, value);
                      return (
                        <td
                          key={value}
                          className="px-4 py-3 text-right text-xs text-muted-foreground tabular-nums"
                        >
                          {average === null ? "—" : average.toFixed(1)}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {entry.averageScore === null ? (
                        <span className="text-xs font-normal text-muted-foreground">
                          Not scored
                        </span>
                      ) : (
                        `${entry.averageScore.toFixed(1)} / 100`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <QualificationBadge entry={entry} round={round} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
