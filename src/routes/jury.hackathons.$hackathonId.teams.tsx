import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ClipboardPenLine, Eye } from "lucide-react";
import { JuryEvaluationDialog } from "@/components/jury/JuryEvaluationDialog";
import { JuryPageHeader } from "@/components/jury/JuryPageHeader";
import {
  JuryBadge,
  JuryButton,
  JuryFilterSelect,
  JuryTable,
  JuryTableMessage,
  JuryToolbar,
} from "@/components/jury/JuryTable";
import { getJuryTeams, type JuryTeam } from "@/lib/jury-api";

export const Route = createFileRoute("/jury/hackathons/$hackathonId/teams")({
  component: JuryTeamsPage,
});

function EvaluationBadge({ status }: { status: JuryTeam["evaluationStatus"] }) {
  if (status === "submitted") return <JuryBadge tone="green">Evaluated</JuryBadge>;
  if (status === "draft") return <JuryBadge tone="blue">Draft saved</JuryBadge>;
  return <JuryBadge tone="amber">Not evaluated</JuryBadge>;
}

function JuryTeamsPage() {
  const { hackathonId } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [teams, setTeams] = useState<JuryTeam[]>([]);
  const [scoringTeamId, setScoringTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      const data = await getJuryTeams(hackathonId);
      setTeams(data.items);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load teams.");
    } finally {
      setLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teams.filter((team) => {
      if (statusFilter !== "all" && (team.evaluationStatus || "pending") !== statusFilter) {
        return false;
      }
      if (roundFilter !== "all" && (team.round ?? 1) < Number(roundFilter)) return false;
      if (!query) return true;
      return [team.teamName, team.problemStatementId || "", ...team.members]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [roundFilter, search, statusFilter, teams]);

  if (pathname !== `/jury/hackathons/${hackathonId}/teams`) return <Outlet />;

  const evaluatedCount = teams.filter((team) => team.evaluationStatus === "submitted").length;
  const maxRound = Math.max(1, ...teams.map((team) => team.round ?? 1));

  return (
    <section>
      <JuryPageHeader
        title="Teams / Submissions"
        description="Review each team's submission and evaluate it here. Team contact details are hidden from Jury accounts."
      />

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <JuryToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search team, member, or problem ID"
        summary={`${evaluatedCount} of ${teams.length} evaluated`}
      >
        <JuryFilterSelect
          label="Filter by evaluation status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All teams" },
            { value: "pending", label: "Not evaluated" },
            { value: "draft", label: "Draft saved" },
            { value: "submitted", label: "Evaluated" },
          ]}
        />
        {maxRound > 1 ? (
          <JuryFilterSelect
            label="Filter by round"
            value={roundFilter}
            onChange={setRoundFilter}
            options={[
              { value: "all", label: "All rounds" },
              ...Array.from({ length: maxRound - 1 }, (_, index) => ({
                value: String(index + 2),
                label: `Selected for Round ${index + 2}`,
              })),
            ]}
          />
        ) : null}
      </JuryToolbar>

      <JuryTable
        minWidth={980}
        columns={[
          { label: "Team" },
          { label: "Members" },
          { label: "Problem" },
          { label: "Submission" },
          { label: "Round" },
          { label: "Score", className: "text-right" },
          { label: "Status" },
          { label: "Actions", className: "text-right" },
        ]}
      >
        {loading ? (
          <JuryTableMessage colSpan={8}>Loading teams…</JuryTableMessage>
        ) : !filtered.length ? (
          <JuryTableMessage colSpan={8}>
            {teams.length
              ? "No teams match your search."
              : "No teams yet. You only see teams that pick a problem statement you claimed — claim statements on the Problem Statements page."}
          </JuryTableMessage>
        ) : (
          filtered.map((team) => (
            <tr key={team.id} className="hover:bg-(--color-background-alt)/60">
              <td className="px-4 py-3 font-medium whitespace-nowrap">{team.teamName}</td>
              <td className="max-w-[240px] px-4 py-3">
                <p className="truncate text-xs text-(--color-text-secondary)">
                  {team.members.join(", ") || "—"}
                </p>
              </td>
              <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-(--brand-accent)">
                {team.problemStatementId || (
                  <span className="font-sans text-(--color-text-muted)">Not selected</span>
                )}
              </td>
              <td className="px-4 py-3">
                {team.submission.submittedAt ? (
                  <JuryBadge tone="green">Received</JuryBadge>
                ) : (
                  <JuryBadge tone="gray">Awaiting</JuryBadge>
                )}
              </td>
              <td className="px-4 py-3">
                <JuryBadge tone={(team.round ?? 1) > 1 ? "blue" : "gray"}>
                  Round {team.round ?? 1}
                </JuryBadge>
                {team.outcome ? (
                  <div className="mt-1">
                    {team.outcome.status === "qualified" ? (
                      <JuryBadge tone="green">Going to Round {team.outcome.nextRound}</JuryBadge>
                    ) : (
                      <JuryBadge tone="red">Disqualified in Round {team.outcome.round}</JuryBadge>
                    )}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
                {team.totalScore === null || team.totalScore === undefined ? (
                  <span className="font-normal text-(--color-text-muted)">—</span>
                ) : (
                  `${team.totalScore} / 100`
                )}
                {(team.roundScores?.length ?? 0) > 1 ? (
                  <p className="mt-0.5 text-[11px] font-normal text-(--color-text-muted)">
                    {team.roundScores!.slice(0, -1).map((score) => (
                      <span key={score.round} className="ml-2 first:ml-0">
                        R{score.round}: {score.totalScore ?? "—"}
                      </span>
                    ))}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <EvaluationBadge status={team.evaluationStatus} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                  <Link
                    to="/jury/hackathons/$hackathonId/teams/$teamId"
                    params={{ hackathonId, teamId: team.id }}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-(--color-border) bg-white px-3.5 text-xs font-semibold whitespace-nowrap transition-colors hover:border-(--color-border-strong) hover:bg-(--color-background-alt)"
                  >
                    <Eye className="size-3.5" /> View
                  </Link>
                  <JuryButton
                    variant={team.evaluationStatus === "submitted" ? "secondary" : "primary"}
                    onClick={() => setScoringTeamId(team.id)}
                    className="min-w-[96px]"
                  >
                    <ClipboardPenLine className="size-3.5" />
                    {team.evaluationStatus === "submitted"
                      ? "View / edit"
                      : team.evaluationStatus === "draft"
                        ? "Continue"
                        : "Evaluate"}
                  </JuryButton>
                </div>
              </td>
            </tr>
          ))
        )}
      </JuryTable>

      {scoringTeamId ? (
        <JuryEvaluationDialog
          hackathonId={hackathonId}
          teamId={scoringTeamId}
          open
          onOpenChange={(open) => {
            if (!open) {
              setScoringTeamId(null);
              void load();
            }
          }}
        />
      ) : null}
    </section>
  );
}
