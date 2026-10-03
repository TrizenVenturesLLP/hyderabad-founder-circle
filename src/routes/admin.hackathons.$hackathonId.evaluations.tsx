import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, Pencil, RotateCcw, Search, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { AppSelect } from "@/components/AppSelect";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageChrome";
import { HackathonNav, hackathonSectionPageClass } from "@/components/admin/HackathonNav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchAdminHackathonEvaluations,
  reopenAdminHackathonEvaluation,
  updateAdminHackathonEvaluation,
  type AdminHackathonEvaluation,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/hackathons/$hackathonId/evaluations")({
  component: AdminHackathonEvaluationsPage,
});

type Results = {
  maxRound?: number;
  items: AdminHackathonEvaluation[];
  teamCount: number;
  assignedJuryCount: number;
  submittedCount: number;
  pendingCount: number;
  rubric: { id: string; name: string; maxMarks: number; order: number }[];
};

type Progress = "complete" | "in-progress" | "not-started";
type ProgressFilter = "all" | Progress;
type SortKey = "rank" | "name" | "progress";

type TeamSummary = {
  teamKey: string;
  team: AdminHackathonEvaluation["teamId"];
  items: AdminHackathonEvaluation[];
  submittedCount: number;
  average: number | null;
  criterionAverages: { id: string; name: string; maxMarks: number; average: number | null }[];
  progress: Progress;
  rank: number | null;
};

const progressMeta: Record<Progress, { label: string; tone: string }> = {
  complete: { label: "Complete", tone: "bg-emerald-50 text-emerald-700" },
  "in-progress": { label: "In progress", tone: "bg-amber-50 text-amber-700" },
  "not-started": { label: "Not started", tone: "bg-muted text-muted-foreground" },
};

const evaluationStatusTone: Record<AdminHackathonEvaluation["status"], string> = {
  submitted: "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
  pending: "bg-muted text-muted-foreground",
};

const juryDotTone: Record<AdminHackathonEvaluation["status"], string> = {
  submitted: "bg-emerald-500",
  draft: "bg-amber-400",
  pending: "bg-muted-foreground/25",
};

const filterOptions: { id: ProgressFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "complete", label: "Complete" },
  { id: "in-progress", label: "In progress" },
  { id: "not-started", label: "Not started" },
];

function AdminHackathonEvaluationsPage() {
  const { hackathonId } = Route.useParams();
  const [results, setResults] = useState<Results>({
    items: [],
    teamCount: 0,
    assignedJuryCount: 0,
    submittedCount: 0,
    pendingCount: 0,
    rubric: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");
  const [search, setSearch] = useState("");
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [openTeamKey, setOpenTeamKey] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScores, setEditScores] = useState<Record<string, number>>({});
  const [editComments, setEditComments] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResults(await fetchAdminHackathonEvaluations(hackathonId, round));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load evaluations.");
    } finally {
      setLoading(false);
    }
  }, [hackathonId, round]);

  function startEditingScore(item: AdminHackathonEvaluation) {
    const initialScores: Record<string, number> = {};
    rubric.forEach((criterion) => {
      const existing = item.criteriaScores.find((s) => s.criterionId === criterion.id);
      initialScores[criterion.id] = existing ? existing.score : 0;
    });
    setEditScores(initialScores);
    setEditComments(item.comments || "");
    setEditingId(item._id);
  }

  async function handleSaveScore(item: AdminHackathonEvaluation) {
    setWorkingId(item._id);
    try {
      const criteriaScores = rubric.map((criterion) => ({
        criterionId: criterion.id,
        score: Number(editScores[criterion.id]) || 0,
      }));
      await updateAdminHackathonEvaluation(hackathonId, item._id, {
        teamId: item.teamId._id,
        juryMemberId: item.juryMemberId._id || "",
        round,
        criteriaScores,
        comments: editComments,
        status: "submitted",
      });
      toast.success("Evaluation score updated successfully.");
      setEditingId(null);
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not save evaluation score.");
    } finally {
      setWorkingId("");
    }
  }

  const maxRound = results.maxRound ?? 1;

  useEffect(() => {
    void load();
  }, [load]);

  const rubric = useMemo(
    () => [...results.rubric].sort((left, right) => left.order - right.order),
    [results.rubric],
  );

  const teams = useMemo<TeamSummary[]>(() => {
    const grouped = new Map<string, AdminHackathonEvaluation[]>();
    for (const item of results.items) {
      const key = item.teamId?._id || item.teamId?.team_name || "unknown";
      grouped.set(key, [...(grouped.get(key) || []), item]);
    }
    const summaries = [...grouped.entries()].map(([teamKey, items]) => {
      const submitted = items.filter((item) => item.status === "submitted");
      const average = submitted.length
        ? submitted.reduce((sum, item) => sum + item.totalScore, 0) / submitted.length
        : null;
      const criterionAverages = rubric.map((criterion) => {
        const scores = submitted.flatMap((item) =>
          item.criteriaScores
            .filter((score) => score.criterionId === criterion.id)
            .map((score) => score.score),
        );
        return {
          id: criterion.id,
          name: criterion.name,
          maxMarks: criterion.maxMarks,
          average: scores.length
            ? scores.reduce((sum, value) => sum + value, 0) / scores.length
            : null,
        };
      });
      const progress: Progress =
        submitted.length === 0
          ? "not-started"
          : submitted.length >= items.length
            ? "complete"
            : "in-progress";
      return {
        teamKey,
        team: items[0].teamId,
        items,
        submittedCount: submitted.length,
        average,
        criterionAverages,
        progress,
        rank: null as number | null,
      };
    });

    const ranked = summaries
      .filter((summary) => summary.average !== null)
      .sort(
        (left, right) =>
          right.average! - left.average! || left.team.team_name.localeCompare(right.team.team_name),
      );
    let lastAverage: number | null = null;
    let currentRank = 0;
    ranked.forEach((summary, index) => {
      if (summary.average !== lastAverage) currentRank = index + 1;
      lastAverage = summary.average;
      summary.rank = currentRank;
    });
    return summaries;
  }, [results.items, rubric]);

  const visibleTeams = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teams
      .filter((summary) => progressFilter === "all" || summary.progress === progressFilter)
      .filter(
        (summary) =>
          !query ||
          [summary.team.team_name, summary.team.lead_name, summary.team.problem_statement_id]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query)),
      )
      .sort((left, right) => {
        if (sortKey === "name") return left.team.team_name.localeCompare(right.team.team_name);
        if (sortKey === "progress") {
          return (
            right.submittedCount / Math.max(1, right.items.length) -
              left.submittedCount / Math.max(1, left.items.length) ||
            left.team.team_name.localeCompare(right.team.team_name)
          );
        }
        return (
          (left.rank ?? Number.POSITIVE_INFINITY) - (right.rank ?? Number.POSITIVE_INFINITY) ||
          left.team.team_name.localeCompare(right.team.team_name)
        );
      });
  }, [teams, search, progressFilter, sortKey]);

  const filterCounts = useMemo(() => {
    const counts: Record<ProgressFilter, number> = {
      all: teams.length,
      complete: 0,
      "in-progress": 0,
      "not-started": 0,
    };
    for (const summary of teams) counts[summary.progress] += 1;
    return counts;
  }, [teams]);

  const openTeam = teams.find((summary) => summary.teamKey === openTeamKey) ?? null;
  const expectedEvaluations = results.teamCount * results.assignedJuryCount;
  const completionPercent = expectedEvaluations
    ? Math.round((results.submittedCount / expectedEvaluations) * 100)
    : 0;

  async function reopen(item: AdminHackathonEvaluation) {
    if (
      !window.confirm(
        `Reopen ${item.juryMemberId.name}'s submitted evaluation for ${item.teamId.team_name}?`,
      )
    )
      return;
    setWorkingId(item._id);
    try {
      await reopenAdminHackathonEvaluation(hackathonId, item._id);
      toast.success("Evaluation reopened as a draft.");
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not reopen evaluation.");
    } finally {
      setWorkingId("");
    }
  }

  function criterionName(criterionId: string) {
    return rubric.find((criterion) => criterion.id === criterionId)?.name || criterionId;
  }

  function criterionMax(criterionId: string) {
    return rubric.find((criterion) => criterion.id === criterionId)?.maxMarks ?? "?";
  }

  return (
    <div className={`space-y-4 p-4 sm:p-5 md:p-6 ${hackathonSectionPageClass}`}>
      <HackathonNav hackathonId={hackathonId} active="evaluations" />
      <AdminPageHeader
        title="Evaluations"
        description={
          maxRound > 1
            ? `Round ${round} Jury scores per team, averaged from submitted evaluations.`
            : "Jury scores per team, averaged from submitted evaluations."
        }
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-8 items-center gap-1.5 border border-border bg-white px-3 text-xs font-semibold whitespace-nowrap transition-colors hover:bg-muted"
          >
            <RotateCcw className="size-3.5" />
            Refresh
          </button>
        }
      />

      {maxRound > 1 ? (
        <div
          role="tablist"
          aria-label="Evaluation round"
          className="flex max-w-full overflow-x-auto border border-border bg-white [scrollbar-width:none] sm:inline-flex [&::-webkit-scrollbar]:hidden"
        >
          {Array.from({ length: maxRound }, (_, index) => index + 1).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={round === value}
              onClick={() => {
                setOpenTeamKey(null);
                setRound(value);
              }}
              className={`h-9 flex-1 shrink-0 border-r border-border px-4 text-xs font-semibold whitespace-nowrap transition-colors last:border-r-0 sm:h-8 sm:flex-none ${
                round === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Round {value}
            </button>
          ))}
        </div>
      ) : null}

      <AdminPanel className="overflow-hidden rounded-xl">
        <dl className="grid grid-cols-2 gap-px border-b border-border bg-border sm:grid-cols-4">
          {[
            {
              label: round === 1 ? "Active teams" : `Teams in Round ${round}`,
              value: results.teamCount,
              tone: "text-foreground",
            },
            { label: "Assigned Jury", value: results.assignedJuryCount, tone: "text-foreground" },
            { label: "Submitted", value: results.submittedCount, tone: "text-emerald-700" },
            {
              label: "Pending",
              value: results.pendingCount,
              tone: results.pendingCount > 0 ? "text-amber-600" : "text-foreground",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-baseline justify-between gap-3 bg-white px-3 py-2.5 sm:px-4"
            >
              <dt className="truncate text-[11.5px] font-medium text-muted-foreground">
                {stat.label}
              </dt>
              <dd className={`text-lg leading-none font-bold tabular-nums ${stat.tone}`}>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center gap-3 px-3 py-2 sm:px-4">
          <span className="shrink-0 text-[11.5px] font-medium text-muted-foreground">
            Overall progress
          </span>
          <div className="h-1.5 flex-1 bg-muted">
            <div
              className="h-1.5 bg-primary transition-[width] duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-foreground tabular-nums">
            {completionPercent}%
          </span>
        </div>
      </AdminPanel>

      <AdminPanel className="flex flex-col gap-2 rounded-xl p-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search team, lead, or problem ID..."
            className="h-9 w-full border border-border bg-white pl-8 pr-8 text-xs text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Filter by progress"
            className="flex w-full overflow-x-auto border border-border [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden"
          >
            {filterOptions.map((option) => {
              const active = progressFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setProgressFilter(option.id)}
                  className={`inline-flex h-8 shrink-0 items-center gap-1.5 border-r border-border px-2.5 text-[11.5px] font-semibold whitespace-nowrap transition-colors last:border-r-0 ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {option.label}
                  <span className={`tabular-nums ${active ? "opacity-80" : "opacity-70"}`}>
                    {filterCounts[option.id]}
                  </span>
                </button>
              );
            })}
          </div>
          <AppSelect
            ariaLabel="Sort teams"
            value={sortKey}
            onValueChange={(value) => setSortKey(value as SortKey)}
            options={[
              { value: "rank", label: "Sort: Rank" },
              { value: "progress", label: "Sort: Progress" },
              { value: "name", label: "Sort: Team name" },
            ]}
            shape="pill"
            size="sm"
            className="w-full min-w-36 sm:w-auto"
          />
        </div>
      </AdminPanel>

      {error ? (
        <AdminPanel className="rounded-xl border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </AdminPanel>
      ) : null}

      {loading && teams.length === 0 ? (
        <AdminPanel className="rounded-xl p-8 text-center text-sm text-muted-foreground">
          Loading evaluation results…
        </AdminPanel>
      ) : teams.length === 0 ? (
        <AdminPanel className="rounded-xl p-8 text-center">
          <ClipboardCheck className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold text-foreground">No evaluations yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Teams appear here once there are active teams and at least one Jury member.
          </p>
        </AdminPanel>
      ) : visibleTeams.length === 0 ? (
        <AdminPanel className="rounded-xl p-8 text-center text-sm text-muted-foreground">
          No teams match these filters.
        </AdminPanel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleTeams.map((summary) => {
            const meta = progressMeta[summary.progress];
            const topThree = summary.rank !== null && summary.rank <= 3;
            return (
              <article
                key={summary.teamKey}
                className="flex flex-col border border-border bg-white transition-shadow hover:shadow-md sm:aspect-square sm:min-h-[300px]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                      summary.rank === null
                        ? "bg-muted text-muted-foreground"
                        : topThree
                          ? "bg-amber-100 text-amber-800"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    {topThree ? <Trophy className="size-3" /> : null}
                    {summary.rank === null ? "Unranked" : `#${summary.rank}`}
                  </span>
                  <span className={`px-1.5 py-0.5 text-[10.5px] font-semibold ${meta.tone}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="flex min-h-0 flex-1 flex-col px-3.5 py-3">
                  <h2 className="truncate text-[14px] font-semibold text-foreground">
                    {summary.team.team_name}
                  </h2>
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    Lead: {summary.team.lead_name || "—"}
                    {summary.team.problem_statement_id ? (
                      <>
                        {" · "}
                        <span className="font-mono text-primary">
                          {summary.team.problem_statement_id}
                        </span>
                      </>
                    ) : null}
                  </p>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl leading-none font-bold text-foreground tabular-nums">
                      {summary.average === null ? "—" : summary.average.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100 avg</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-muted">
                    <div
                      className="h-1.5 bg-primary transition-[width] duration-500"
                      style={{ width: `${Math.min(100, summary.average ?? 0)}%` }}
                    />
                  </div>

                  <ul className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-hidden">
                    {summary.criterionAverages.map((criterion) => (
                      <li key={criterion.id} className="text-[11.5px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-muted-foreground">{criterion.name}</span>
                          <span className="shrink-0 font-semibold text-foreground tabular-nums">
                            {criterion.average === null ? "—" : criterion.average.toFixed(1)}
                            <span className="font-normal text-muted-foreground">
                              /{criterion.maxMarks}
                            </span>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border px-3.5 py-2">
                  <div className="min-w-0">
                    <div className="flex gap-1" aria-hidden>
                      {summary.items.map((item) => (
                        <span
                          key={item._id}
                          title={`${item.juryMemberId.name}: ${item.status}`}
                          className={`h-1.5 w-4 ${juryDotTone[item.status]}`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {summary.submittedCount} of {summary.items.length} Jury submitted
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenTeamKey(summary.teamKey)}
                    className="h-7 shrink-0 border border-border bg-white px-2.5 text-[11.5px] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    View details
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={openTeam !== null} onOpenChange={(open) => !open && setOpenTeamKey(null)}>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:border-0 sm:rounded-none">
          {openTeam ? (
            <>
              <DialogHeader className="border-b border-border px-5 py-4 pr-12 text-left">
                <DialogTitle className="text-base">
                  {openTeam.team.team_name}
                  {maxRound > 1 ? (
                    <span className="ml-2 text-xs font-semibold text-muted-foreground">
                      Round {round}
                    </span>
                  ) : null}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Lead: {openTeam.team.lead_name || "—"}
                  {openTeam.team.problem_statement_id
                    ? ` · ${openTeam.team.problem_statement_id}`
                    : ""}
                  {" · "}
                  {openTeam.average === null
                    ? "No submitted scores yet"
                    : `Average ${openTeam.average.toFixed(1)} / 100`}
                </DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
                {openTeam.items.map((item) => {
                  const isEditingThis = editingId === item._id;

                  if (isEditingThis) {
                    const currentTotal = rubric.reduce(
                      (sum, c) => sum + (Number(editScores[c.id]) || 0),
                      0,
                    );

                    return (
                      <section key={item._id} className="bg-slate-50 p-4 border-b border-border">
                        <div className="flex items-center justify-between gap-2 pb-2">
                          <p className="text-xs font-bold text-foreground">
                            Edit Scores for {item.juryMemberId.name}
                          </p>
                          <span className="text-xs font-bold text-primary tabular-nums">
                            Total: {currentTotal} / 100
                          </span>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2 mt-2">
                          {rubric.map((criterion) => (
                            <label key={criterion.id} className="block text-[11.5px] font-semibold text-foreground">
                              {criterion.name} (Max {criterion.maxMarks})
                              <input
                                type="number"
                                min={0}
                                max={criterion.maxMarks}
                                value={editScores[criterion.id] ?? 0}
                                onChange={(e) => {
                                  const val = Math.max(0, Math.min(criterion.maxMarks, Number(e.target.value) || 0));
                                  setEditScores((prev) => ({ ...prev, [criterion.id]: val }));
                                }}
                                className="mt-1 block w-full border border-border bg-white px-2.5 py-1 text-xs outline-none focus:border-primary"
                              />
                            </label>
                          ))}
                        </div>

                        <label className="block text-[11.5px] font-semibold text-foreground mt-3">
                          Comments
                          <textarea
                            rows={2}
                            value={editComments}
                            onChange={(e) => setEditComments(e.target.value)}
                            placeholder="Add evaluation comments..."
                            className="mt-1 block w-full border border-border bg-white px-2.5 py-1.5 text-xs outline-none focus:border-primary resize-none"
                          />
                        </label>

                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="h-7 border border-border bg-white px-3 text-[11.5px] font-semibold text-foreground hover:bg-muted"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={workingId === item._id}
                            onClick={() => void handleSaveScore(item)}
                            className="h-7 bg-primary px-3 text-[11.5px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                          >
                            {workingId === item._id ? "Saving…" : "Save Score"}
                          </button>
                        </div>
                      </section>
                    );
                  }

                  return (
                    <section key={item._id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-foreground">
                            {item.juryMemberId.name}
                          </p>
                          <p className="truncate text-[11.5px] text-muted-foreground">
                            {item.juryMemberId.email}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-base font-bold text-foreground tabular-nums">
                            {item.status === "pending" ? "—" : item.totalScore}
                            <span className="text-xs font-normal text-muted-foreground"> / 100</span>
                          </span>
                          <span
                            className={`px-1.5 py-0.5 text-[10.5px] font-semibold capitalize ${evaluationStatusTone[item.status]}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                      {item.criteriaScores.length ? (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {item.criteriaScores.map((score) => (
                            <span
                              key={score.criterionId}
                              className="border border-border bg-white px-2 py-0.5 text-[11px] text-muted-foreground"
                            >
                              {criterionName(score.criterionId)}:{" "}
                              <strong className="text-foreground">{score.score}</strong>/
                              {criterionMax(score.criterionId)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {item.comments ? (
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-muted-foreground">Decision:</span>
                          <span
                            className={`px-2.5 py-0.5 text-xs font-bold ${
                              item.comments.toLowerCase().includes("approve")
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : item.comments.toLowerCase().includes("reject")
                                  ? "bg-red-100 text-red-800 border border-red-300"
                                  : "bg-slate-100 text-slate-800 border border-slate-300"
                            }`}
                          >
                            {item.comments}
                          </span>
                        </div>
                      ) : null}
                      <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span>
                          {item.submittedAt
                            ? `Submitted ${new Date(item.submittedAt).toLocaleString(undefined, {
                                day: "numeric",
                                month: "short",
                                hour: "numeric",
                                minute: "2-digit",
                              })}`
                            : item.status === "draft"
                              ? "Saved as draft"
                              : "Not evaluated yet"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingScore(item)}
                            className="inline-flex h-7 items-center gap-1 border border-border bg-white px-2.5 text-[11.5px] font-semibold text-foreground transition-colors hover:bg-muted"
                          >
                            <Pencil className="size-3" />
                            Edit score
                          </button>
                          {item.status === "submitted" ? (
                            <button
                              type="button"
                              disabled={workingId === item._id}
                              onClick={() => void reopen(item)}
                              className="h-7 border border-border bg-white px-2.5 text-[11.5px] font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
                            >
                              {workingId === item._id ? "Reopening…" : "Reopen"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
