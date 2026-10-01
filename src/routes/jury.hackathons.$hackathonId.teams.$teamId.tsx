import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardPenLine, ExternalLink, Eye } from "lucide-react";
import { ProblemStatementFacts } from "@/components/hackathon/ProblemStatementFacts";
import { JuryEvaluationDialog } from "@/components/jury/JuryEvaluationDialog";
import { JuryPageHeader } from "@/components/jury/JuryPageHeader";
import { JuryBadge, JuryButton } from "@/components/jury/JuryTable";
import { SubmissionViewerDialog } from "@/components/jury/SubmissionViewerDialog";
import { getJuryEvaluation, getJuryTeam, type JuryTeam } from "@/lib/jury-api";

export const Route = createFileRoute("/jury/hackathons/$hackathonId/teams/$teamId")({
  component: JuryTeamDetailPage,
});

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr className="align-top">
      <th
        scope="row"
        className="w-44 bg-(--color-background-alt) px-4 py-3 text-left text-[11px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase"
      >
        {label}
      </th>
      <td className="px-4 py-3 text-sm">{children}</td>
    </tr>
  );
}

const linkClass =
  "inline-flex items-center gap-1.5 font-medium text-(--brand-accent) hover:underline";

function JuryTeamDetailPage() {
  const { hackathonId, teamId } = Route.useParams();
  const [team, setTeam] = useState<JuryTeam | null>(null);
  const [statement, setStatement] =
    useState<Awaited<ReturnType<typeof getJuryTeam>>["problemStatement"]>(null);
  const [error, setError] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [evaluationOpen, setEvaluationOpen] = useState(false);

  const loadEvaluationStatus = useCallback(async () => {
    const { evaluation } = await getJuryEvaluation(hackathonId, teamId);
    setTeam((current) =>
      current
        ? {
            ...current,
            evaluationStatus: evaluation?.status || "pending",
            totalScore: evaluation ? evaluation.totalScore : null,
          }
        : current,
    );
  }, [hackathonId, teamId]);

  useEffect(() => {
    void getJuryTeam(hackathonId, teamId)
      .then((data) => {
        setTeam(data.team);
        setStatement(data.problemStatement);
        void loadEvaluationStatus().catch(() => undefined);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load team."));
  }, [hackathonId, loadEvaluationStatus, teamId]);

  return (
    <section>
      <Link
        to="/jury/hackathons/$hackathonId/teams"
        params={{ hackathonId }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-(--brand-accent) hover:underline"
      >
        <ArrowLeft className="size-4" /> Teams / Submissions
      </Link>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      {!team && !error ? (
        <p className="py-8 text-sm text-(--color-text-secondary)">Loading team…</p>
      ) : null}

      {team ? (
        <>
          <div className="mt-4">
            <JuryPageHeader
              title={team.teamName}
              description="Team submission details"
              actions={
                <JuryButton
                  variant={team.evaluationStatus === "submitted" ? "secondary" : "primary"}
                  size="md"
                  onClick={() => setEvaluationOpen(true)}
                >
                  <ClipboardPenLine className="size-4" />
                  {team.evaluationStatus === "submitted"
                    ? "View / edit score"
                    : team.evaluationStatus === "draft"
                      ? "Continue evaluation"
                      : "Evaluate team"}
                </JuryButton>
              }
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-(--color-border) bg-white shadow-(--shadow-small)">
            <table className="w-full">
              <tbody className="divide-y divide-(--color-border)">
                <DetailRow label="Evaluation">
                  <div className="flex flex-wrap items-center gap-2">
                    {team.evaluationStatus === "submitted" ? (
                      <JuryBadge tone="green">Evaluated</JuryBadge>
                    ) : team.evaluationStatus === "draft" ? (
                      <JuryBadge tone="blue">Draft saved</JuryBadge>
                    ) : (
                      <JuryBadge tone="amber">Not evaluated</JuryBadge>
                    )}
                    {team.totalScore !== null && team.totalScore !== undefined ? (
                      <span className="font-semibold tabular-nums">{team.totalScore} / 100</span>
                    ) : null}
                  </div>
                </DetailRow>
                <DetailRow label="Members">{team.members.join(", ") || "—"}</DetailRow>
                <DetailRow label="Problem statement">
                  {statement ? (
                    <>
                      <p className="font-mono text-xs font-semibold text-(--brand-accent)">
                        {statement.id}
                      </p>
                      <p className="mt-0.5 font-medium">{statement.title}</p>
                      <ProblemStatementFacts
                        className="mt-2"
                        industry={statement.industry}
                        scope={statement.scope}
                        platform={statement.platform}
                        description={statement.description}
                      />
                    </>
                  ) : (
                    <span className="text-(--color-text-muted)">No statement selected</span>
                  )}
                </DetailRow>
                <DetailRow label="Project description">
                  <p className="leading-relaxed whitespace-pre-wrap text-(--color-text-secondary)">
                    {team.submission.description || "No project description submitted."}
                  </p>
                </DetailRow>
                <DetailRow label="GitHub repository">
                  {team.submission.githubRepo ? (
                    <a
                      href={team.submission.githubRepo}
                      target="_blank"
                      rel="noreferrer"
                      className={linkClass}
                    >
                      Open repository <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    <span className="text-(--color-text-muted)">Not provided</span>
                  )}
                </DetailRow>
                <DetailRow label="Demo video">
                  {team.submission.videoUrl ? (
                    <a
                      href={team.submission.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={linkClass}
                    >
                      Watch demo <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    <span className="text-(--color-text-muted)">Not provided</span>
                  )}
                </DetailRow>
                <DetailRow label="PPT / PDF">
                  {team.submission.hasFile ? (
                    <JuryButton onClick={() => setViewerOpen(true)}>
                      <Eye className="size-3.5" />
                      View file
                    </JuryButton>
                  ) : (
                    <span className="text-(--color-text-muted)">Not uploaded</span>
                  )}
                </DetailRow>
                <DetailRow label="Submitted">
                  {team.submission.submittedAt ? (
                    new Date(team.submission.submittedAt).toLocaleString()
                  ) : (
                    <span className="text-(--color-text-muted)">Awaiting submission</span>
                  )}
                </DetailRow>
              </tbody>
            </table>
          </div>

          <JuryEvaluationDialog
            hackathonId={hackathonId}
            teamId={teamId}
            open={evaluationOpen}
            onOpenChange={(open) => {
              setEvaluationOpen(open);
              if (!open) void loadEvaluationStatus().catch(() => undefined);
            }}
          />
          <SubmissionViewerDialog
            hackathonId={hackathonId}
            teamId={teamId}
            teamName={team.teamName}
            open={viewerOpen}
            onOpenChange={setViewerOpen}
          />
        </>
      ) : null}
    </section>
  );
}
