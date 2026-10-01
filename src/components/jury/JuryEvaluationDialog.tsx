import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Eye, Pencil, Save, Send, Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppSelect } from "@/components/AppSelect";
import { JuryBadge, JuryButton } from "@/components/jury/JuryTable";
import { SubmissionViewerDialog } from "@/components/jury/SubmissionViewerDialog";
import {
  getJuryEvaluation,
  getJuryTeam,
  saveJuryEvaluationDraft,
  submitJuryEvaluation,
  type JuryCriterion,
  type JuryEvaluation,
  type JuryTeam,
} from "@/lib/jury-api";

type JuryEvaluationDialogProps = {
  hackathonId: string;
  teamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function scoresFrom(evaluation: JuryEvaluation | null) {
  return Object.fromEntries(
    (evaluation?.criteriaScores || []).map((item) => [item.criterionId, String(item.score)]),
  );
}

const quickLinkClass =
  "inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-white px-2.5 py-1 font-semibold text-(--brand-accent) transition-colors hover:border-(--brand-accent)/40 hover:bg-(--brand-accent-soft)";

function scoreOptions(maxMarks: number) {
  return Array.from({ length: maxMarks + 1 }, (_, index) => {
    const value = String(maxMarks - index);
    return { value, label: value };
  });
}

export function JuryEvaluationDialog({
  hackathonId,
  teamId,
  open,
  onOpenChange,
}: JuryEvaluationDialogProps) {
  const [team, setTeam] = useState<JuryTeam | null>(null);
  const [rubric, setRubric] = useState<JuryCriterion[]>([]);
  const [evaluation, setEvaluation] = useState<JuryEvaluation | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [comments, setComments] = useState("");
  const [editing, setEditing] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setEditing(false);
    setError("");
    setNotice("");
    void Promise.all([getJuryTeam(hackathonId, teamId), getJuryEvaluation(hackathonId, teamId)])
      .then(([teamData, evaluationData]) => {
        if (!active) return;
        setTeam(teamData.team);
        setRubric(evaluationData.rubric);
        setEvaluation(evaluationData.evaluation);
        setComments(evaluationData.evaluation?.comments || "");
        setScores(scoresFrom(evaluationData.evaluation));
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load evaluation.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hackathonId, open, teamId]);

  const total = useMemo(
    () => rubric.reduce((sum, criterion) => sum + (Number(scores[criterion.id]) || 0), 0),
    [rubric, scores],
  );
  const scoredCount = rubric.filter((criterion) => (scores[criterion.id] ?? "") !== "").length;
  const submitted = evaluation?.status === "submitted";
  const readOnly = submitted && !editing;

  function scorePayload() {
    return Object.fromEntries(
      Object.entries(scores)
        .filter(([, value]) => value !== "")
        .map(([key, value]) => [key, Number(value)]),
    );
  }

  function startEditing() {
    setEditing(true);
    setError("");
    setNotice("");
  }

  function cancelEditing() {
    setScores(scoresFrom(evaluation));
    setComments(evaluation?.comments || "");
    setEditing(false);
    setError("");
  }

  async function saveDraft() {
    setSaving("draft");
    setError("");
    setNotice("");
    try {
      const result = await saveJuryEvaluationDraft(hackathonId, teamId, {
        criteriaScores: scorePayload(),
        comments,
        status: "draft",
      });
      setEvaluation(result.evaluation);
      setNotice("Draft saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save draft.");
    } finally {
      setSaving(null);
    }
  }

  async function submit() {
    if (scoredCount < rubric.length) {
      setError("Select a mark for every criterion before submitting.");
      return;
    }
    const wasSubmitted = submitted;
    setSaving("submit");
    setError("");
    setNotice("");
    try {
      const result = await submitJuryEvaluation(hackathonId, teamId, {
        criteriaScores: scorePayload(),
        comments,
      });
      setEvaluation(result.evaluation);
      setEditing(false);
      setNotice(wasSubmitted ? "Score updated." : "Evaluation submitted.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not submit evaluation.");
    } finally {
      setSaving(null);
    }
  }

  const statusBadge = editing ? (
    <JuryBadge tone="blue">Editing</JuryBadge>
  ) : submitted ? (
    <JuryBadge tone="green">Submitted</JuryBadge>
  ) : evaluation ? (
    <JuryBadge tone="amber">Draft</JuryBadge>
  ) : (
    <JuryBadge tone="gray">Not started</JuryBadge>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[94dvh] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl p-0 [&>button:last-child]:hidden">
        <div className="border-b border-(--color-border) px-5 pt-5 pb-4 sm:px-7">
          <div className="flex items-start justify-between gap-3">
            <DialogHeader className="min-w-0 space-y-1 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold tracking-[0.12em] text-(--brand-accent) uppercase">
                  Team evaluation
                </p>
                {team && !loading ? statusBadge : null}
              </div>
              <DialogTitle className="truncate font-(family-name:--font-brand) text-xl sm:text-2xl">
                {team?.teamName || "Score team"}
              </DialogTitle>
              <DialogDescription>
                {readOnly
                  ? "Your submitted score. Use Edit score to change it."
                  : "Review the submission, then pick a mark for each criterion."}
              </DialogDescription>
            </DialogHeader>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="-mt-1 -mr-2 shrink-0 rounded-full p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-background-alt) hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          {team ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-(--color-text-secondary)">
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-(--color-background-alt) px-2.5 py-1">
                <Users className="size-3.5 shrink-0" />
                <span className="truncate">{team.members.join(", ") || "No members listed"}</span>
              </span>
              <span className="rounded-full bg-(--color-background-alt) px-2.5 py-1 font-mono">
                {team.problemStatementId || "No problem selected"}
              </span>
              <span className="mx-1 hidden h-4 w-px bg-(--color-border) sm:block" aria-hidden />
              {team.submission.hasFile ? (
                <button
                  type="button"
                  onClick={() => setViewerOpen(true)}
                  className={quickLinkClass}
                >
                  <Eye className="size-3.5" /> View PPT / PDF
                </button>
              ) : null}
              {team.submission.githubRepo ? (
                <a
                  href={team.submission.githubRepo}
                  target="_blank"
                  rel="noreferrer"
                  className={quickLinkClass}
                >
                  <ExternalLink className="size-3.5" /> Repository
                </a>
              ) : null}
              {team.submission.videoUrl ? (
                <a
                  href={team.submission.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={quickLinkClass}
                >
                  <ExternalLink className="size-3.5" /> Demo
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-(--color-background-alt)/50 px-5 py-5 sm:px-7">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-12 text-sm text-(--color-text-secondary)">
              <span className="size-8 animate-spin rounded-full border-2 border-(--brand-accent-soft) border-t-(--brand-accent)" />
              Loading evaluation…
            </div>
          ) : null}
          {error && !team ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          ) : null}
          {team && !loading ? (
            <>
              <div className="mb-3 flex items-center justify-between text-xs text-(--color-text-muted)">
                <span className="font-semibold tracking-[0.06em] uppercase">Scoring criteria</span>
                <span className="tabular-nums">
                  {scoredCount} of {rubric.length} scored
                </span>
              </div>
              <ol className="grid gap-2.5">
                {rubric.map((criterion, index) => {
                  const value = scores[criterion.id] ?? "";
                  const percent = value === "" ? 0 : (Number(value) / criterion.maxMarks) * 100;
                  return (
                    <li
                      key={criterion.id}
                      className={`rounded-xl border bg-white px-4 py-3.5 transition-colors ${value === "" && !readOnly ? "border-(--color-border)" : "border-(--brand-accent)/25"}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <span
                          className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold tabular-nums ${value === "" ? "bg-(--color-background-alt) text-(--color-text-muted)" : "bg-(--brand-accent) text-white"}`}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{criterion.name}</p>
                          {criterion.description ? (
                            <p className="mt-0.5 text-xs leading-relaxed text-(--color-text-secondary)">
                              {criterion.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <AppSelect
                            ariaLabel={`${criterion.name} score`}
                            value={value}
                            onValueChange={(next) =>
                              setScores((current) => ({ ...current, [criterion.id]: next }))
                            }
                            options={scoreOptions(criterion.maxMarks)}
                            placeholder="Score"
                            disabled={readOnly}
                            className="w-24 tabular-nums"
                            contentClassName="max-h-64"
                          />
                          <span className="w-9 shrink-0 text-sm text-(--color-text-muted) tabular-nums">
                            / {criterion.maxMarks}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-(--color-background-alt)">
                        <div
                          className="h-full rounded-full bg-(--brand-accent) transition-[width] duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>

              <label className="mt-5 block text-sm font-medium">
                Comments <span className="font-normal text-(--color-text-muted)">(optional)</span>
                <textarea
                  rows={3}
                  maxLength={3000}
                  disabled={readOnly}
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                  placeholder="Strengths, gaps and feedback for the team"
                  className="mt-1.5 block w-full rounded-xl border border-(--color-border) bg-white px-3.5 py-2.5 text-sm font-normal outline-none transition-[border-color,box-shadow] focus:border-(--brand-accent) focus:ring-4 focus:ring-(--brand-accent)/12 disabled:bg-(--color-background-alt)"
                />
              </label>
              {error ? (
                <p
                  role="alert"
                  className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              ) : null}
              {notice ? (
                <p
                  role="status"
                  className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
                >
                  <CheckCircle2 className="size-4" /> {notice}
                </p>
              ) : null}
            </>
          ) : null}
        </div>

        {team && !loading ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--color-border) bg-white px-5 py-4 sm:px-7">
            <div className="min-w-[180px] flex-1 sm:max-w-xs">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">
                  Total{" "}
                  <span className="ml-1 font-(family-name:--font-brand) text-2xl tabular-nums">
                    {total}
                  </span>
                  <span className="text-sm font-normal text-(--color-text-muted)"> / 100</span>
                </p>
                {readOnly && evaluation?.submittedAt ? (
                  <p className="text-[11px] text-(--color-text-muted)">
                    {new Date(evaluation.submittedAt).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--color-background-alt)">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-accent),var(--brand-primary))] transition-[width] duration-300"
                  style={{ width: `${Math.min(total, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {readOnly ? (
                <JuryButton variant="primary" size="md" onClick={startEditing}>
                  <Pencil className="size-4" />
                  Edit score
                </JuryButton>
              ) : editing ? (
                <>
                  <JuryButton size="md" disabled={saving !== null} onClick={cancelEditing}>
                    <X className="size-4" />
                    Cancel
                  </JuryButton>
                  <JuryButton
                    variant="primary"
                    size="md"
                    disabled={saving !== null}
                    onClick={() => void submit()}
                  >
                    <Send className="size-4" />
                    {saving === "submit" ? "Updating…" : "Update score"}
                  </JuryButton>
                </>
              ) : (
                <>
                  <JuryButton size="md" disabled={saving !== null} onClick={() => void saveDraft()}>
                    <Save className="size-4" />
                    {saving === "draft" ? "Saving…" : "Save draft"}
                  </JuryButton>
                  <JuryButton
                    variant="primary"
                    size="md"
                    disabled={saving !== null}
                    onClick={() => void submit()}
                  >
                    <Send className="size-4" />
                    {saving === "submit" ? "Submitting…" : "Submit evaluation"}
                  </JuryButton>
                </>
              )}
            </div>
          </div>
        ) : null}
        {team?.submission.hasFile ? (
          <SubmissionViewerDialog
            hackathonId={hackathonId}
            teamId={teamId}
            teamName={team.teamName}
            open={viewerOpen}
            onOpenChange={setViewerOpen}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
