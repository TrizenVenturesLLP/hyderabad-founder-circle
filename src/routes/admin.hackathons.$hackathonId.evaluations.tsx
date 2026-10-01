import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminPageChrome";
import { HackathonNav } from "@/components/admin/HackathonNav";
import {
  fetchAdminHackathonEvaluations,
  reopenAdminHackathonEvaluation,
  type AdminHackathonEvaluation,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/hackathons/$hackathonId/evaluations")({
  component: AdminHackathonEvaluationsPage,
});

type Results = {
  items: AdminHackathonEvaluation[];
  teamCount: number;
  assignedJuryCount: number;
  submittedCount: number;
  pendingCount: number;
  rubric: { id: string; name: string; maxMarks: number; order: number }[];
};

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

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResults(await fetchAdminHackathonEvaluations(hackathonId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load evaluations.");
    } finally {
      setLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = new Map<string, AdminHackathonEvaluation[]>();
  for (const item of results.items) {
    const key = item.teamId?._id || item.teamId?.team_name || "unknown";
    grouped.set(key, [...(grouped.get(key) || []), item]);
  }
  const leaderboard = [...grouped.entries()]
    .map(([teamKey, items]) => {
      const submitted = items.filter((item) => item.status === "submitted");
      return {
        teamKey,
        teamName: items[0].teamId.team_name,
        submittedCount: submitted.length,
        averageScore: submitted.length
          ? submitted.reduce((sum, item) => sum + item.totalScore, 0) / submitted.length
          : null,
      };
    })
    .filter((item) => item.averageScore !== null)
    .sort(
      (left, right) =>
        right.averageScore! - left.averageScore! || left.teamName.localeCompare(right.teamName),
    );
  let lastAverage: number | null = null;
  let currentRank = 0;
  const rankedLeaderboard = leaderboard.map((item, index) => {
    if (item.averageScore !== lastAverage) currentRank = index + 1;
    lastAverage = item.averageScore;
    return { ...item, rank: currentRank };
  });

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

  return (
    <div className="space-y-6 p-4 sm:p-5 md:p-6">
      <HackathonNav hackathonId={hackathonId} active="evaluations" />
      <AdminPageHeader
        title="Evaluations"
        description="Jury scores per team, averaged from submitted evaluations."
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-xs font-semibold transition-colors hover:bg-muted"
          >
            <RotateCcw className="size-3.5" />
            Refresh
          </button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-4">
        <AdminPanel className="p-4">
          <p className="text-xs text-muted-foreground">Active teams</p>
          <p className="mt-1 text-2xl font-semibold">{results.teamCount}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-xs text-muted-foreground">Assigned Jury</p>
          <p className="mt-1 text-2xl font-semibold">{results.assignedJuryCount}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-xs text-muted-foreground">Submitted evaluations</p>
          <p className="mt-1 text-2xl font-semibold">{results.submittedCount}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-xs text-muted-foreground">Pending evaluations</p>
          <p className="mt-1 text-2xl font-semibold">{results.pendingCount}</p>
        </AdminPanel>
      </div>
      {error ? (
        <AdminPanel className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </AdminPanel>
      ) : null}
      {loading ? (
        <AdminPanel className="p-8 text-center text-sm text-muted-foreground">
          Loading evaluation results…
        </AdminPanel>
      ) : null}
      <AdminPanel className="overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <h2 className="font-semibold">Leaderboard</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Team averages use submitted evaluations only; pending reviews are shown separately.
          </p>
        </div>
        {rankedLeaderboard.length ? (
          <div className="divide-y divide-border">
            {rankedLeaderboard.map((item) => (
              <div
                key={item.teamKey}
                className="grid grid-cols-[3rem_1fr_auto_auto] items-center gap-3 px-4 py-3"
              >
                <span className="font-mono text-sm font-semibold text-muted-foreground">
                  #{item.rank}
                </span>
                <span className="text-sm font-semibold">{item.teamName}</span>
                <span className="text-xs text-muted-foreground">
                  {item.submittedCount} / {results.assignedJuryCount} submitted
                </span>
                <span className="text-sm font-semibold">
                  {item.averageScore?.toFixed(1)} / 100
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-5 text-sm text-muted-foreground">No submitted evaluations to rank yet.</p>
        )}
      </AdminPanel>
      {!loading && !results.items.length ? (
        <AdminPanel className="p-8 text-center text-sm text-muted-foreground">
          No Jury evaluations have been submitted.
        </AdminPanel>
      ) : null}
      <div className="space-y-4">
        {[...grouped.entries()].map(([teamKey, items]) => {
          const submitted = items.filter((item) => item.status === "submitted");
          const average = submitted.length
            ? submitted.reduce((sum, item) => sum + item.totalScore, 0) / submitted.length
            : null;
          const team = items[0].teamId;
          return (
            <AdminPanel key={teamKey} className="overflow-hidden">
              <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
                <div>
                  <h2 className="font-semibold">{team.team_name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {items.length} evaluation record{items.length === 1 ? "" : "s"} ·{" "}
                    {submitted.length} submitted
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  Submitted-score average: {average === null ? "—" : `${average.toFixed(1)} / 100`}
                </p>
              </div>
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <article
                    key={item._id}
                    className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto_auto] md:items-start"
                  >
                    <div>
                      <p className="font-medium">
                        {item.juryMemberId.name}{" "}
                        <span className="font-normal text-muted-foreground">
                          ({item.juryMemberId.email})
                        </span>
                      </p>
                      <p className="mt-1 text-xs capitalize text-muted-foreground">
                        {item.status}
                        {item.submittedAt
                          ? ` · ${new Date(item.submittedAt).toLocaleString()}`
                          : ""}
                      </p>
                      <p className="mt-2 text-sm">{item.comments || "No comments"}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.criteriaScores.map((score) => (
                          <span
                            key={score.criterionId}
                            className="border border-border bg-white px-2 py-1 text-xs"
                          >
                            {results.rubric.find((criterion) => criterion.id === score.criterionId)
                              ?.name || score.criterionId}
                            : {score.score} /{" "}
                            {results.rubric.find((criterion) => criterion.id === score.criterionId)
                              ?.maxMarks ?? "?"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-lg font-semibold">
                      {item.status === "pending" ? "—" : item.totalScore}
                      <span className="text-sm text-muted-foreground"> / 100</span>
                    </p>
                    {item.status === "submitted" ? (
                      <button
                        type="button"
                        disabled={workingId === item._id}
                        onClick={() => void reopen(item)}
                        className="border border-border px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-60"
                      >
                        Reopen
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {item.status === "draft" ? "Draft" : "Pending"}
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </AdminPanel>
          );
        })}
      </div>
    </div>
  );
}
