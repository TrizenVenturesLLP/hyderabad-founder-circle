import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Eye, FilePlus2, Hand, Plus, Send, Undo2, Users } from "lucide-react";
import { toast } from "sonner";
import { AppSelect } from "@/components/AppSelect";
import { FormField, FormSection, SegmentedControl, formFieldClass } from "@/components/FormLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProblemStatementFacts } from "@/components/hackathon/ProblemStatementFacts";
import { JuryPageHeader } from "@/components/jury/JuryPageHeader";
import { JuryBadge, JuryButton, JuryFilterSelect, JuryToolbar } from "@/components/jury/JuryTable";
import {
  claimJuryProblemStatement,
  createJuryProblemStatement,
  getJuryProblemStatements,
  unclaimJuryProblemStatement,
  type JuryProblemStatement,
} from "@/lib/jury-api";
import { getStatementDomainIds } from "@/lib/hackathon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/jury/hackathons/$hackathonId/problem-statements")({
  component: JuryProblemStatementsPage,
});

const domainLabels: Record<string, string> = {
  "ui-ux": "UI/UX",
  "web-dev": "Web Development",
  "vibe-coding": "Vibe Coding",
  "agentic-ai": "Agentic AI",
};

function trackLabels(statement: JuryProblemStatement) {
  return getStatementDomainIds(statement)
    .map((id) => domainLabels[id] || id)
    .join(", ");
}

const emptyForm = {
  domainId: "ui-ux",
  title: "",
  industry: "",
  scope: "",
  platform: "",
  difficulty: "Intermediate",
  description: "",
  deliverablesText: "",
};

const difficulties = ["Beginner", "Intermediate", "Advanced"] as const;
const fieldClass = formFieldClass;

function StatusBadge({ status }: { status: JuryProblemStatement["status"] }) {
  if (status === "pending_approval") return <JuryBadge tone="amber">Pending approval</JuryBadge>;
  if (status === "rejected") return <JuryBadge tone="red">Rejected</JuryBadge>;
  return <JuryBadge tone="green">Live</JuryBadge>;
}

function JuryProblemStatementsPage() {
  const { hackathonId } = Route.useParams();
  const [statements, setStatements] = useState<JuryProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [claimFilter, setClaimFilter] = useState("all");
  const [claimLimit, setClaimLimit] = useState(20);
  const [claimedCount, setClaimedCount] = useState(0);
  const [claimingId, setClaimingId] = useState("");
  const [viewing, setViewing] = useState<JuryProblemStatement | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await getJuryProblemStatements(hackathonId);
      setStatements(data.statements);
      setClaimLimit(data.claimLimit ?? 20);
      setClaimedCount(data.claimedCount ?? 0);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load problem statements.");
    } finally {
      setLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return statements.filter((statement) => {
      if (domainFilter !== "all" && !getStatementDomainIds(statement).includes(domainFilter))
        return false;
      if (statusFilter !== "all" && statement.status !== statusFilter) return false;
      if (claimFilter === "mine" && !statement.claimedByMe) return false;
      if (claimFilter === "mine-picked" && !(statement.claimedByMe && statement.teamCount))
        return false;
      if (claimFilter === "mine-unpicked" && !(statement.claimedByMe && !statement.teamCount))
        return false;
      if (claimFilter === "available" && (statement.claimed || statement.status !== "active"))
        return false;
      if (
        claimFilter === "available-picked" &&
        (statement.claimed || statement.status !== "active" || !statement.teamCount)
      )
        return false;
      if (!query) return true;
      return [
        statement.id,
        statement.title,
        statement.description,
        statement.category,
        statement.industry,
        statement.platform,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [claimFilter, domainFilter, search, statements, statusFilter]);

  const limitReached = claimedCount >= claimLimit;

  async function claim(statement: JuryProblemStatement) {
    if (
      !window.confirm(
        `Claim ${statement.id} — "${statement.title}"?\n\nYou will score every team that picks this statement, and no other Jury member can claim it. You can unclaim it until you start scoring one of its teams.`,
      )
    )
      return;
    setClaimingId(statement.id);
    try {
      const result = await claimJuryProblemStatement(hackathonId, statement.id);
      setClaimedCount(result.claimedCount);
      toast.success(
        `${statement.id} claimed. ${result.claimedCount} of ${result.claimLimit} used.`,
      );
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not claim this statement.");
      await load();
    } finally {
      setClaimingId("");
    }
  }

  async function unclaim(statement: JuryProblemStatement) {
    const teams = statement.teamCount || 0;
    if (
      !window.confirm(
        `Unclaim ${statement.id} — "${statement.title}"?\n\n${
          teams
            ? `${teams} team${teams === 1 ? " has" : "s have"} picked this statement. They won't have a Jury member until someone else claims it.`
            : "Another Jury member will be able to claim it."
        }`,
      )
    )
      return;
    setClaimingId(statement.id);
    try {
      const result = await unclaimJuryProblemStatement(hackathonId, statement.id);
      setClaimedCount(result.claimedCount);
      toast.success(
        `${statement.id} unclaimed. ${result.claimedCount} of ${result.claimLimit} used.`,
      );
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not unclaim this statement.");
    } finally {
      setClaimingId("");
    }
  }

  const liveCount = statements.filter((statement) => statement.status === "active").length;
  const myPickedCount = statements.filter(
    (statement) => statement.claimedByMe && statement.teamCount,
  ).length;
  const pendingCount = statements.filter(
    (statement) => statement.status === "pending_approval",
  ).length;
  const deliverableCount = form.deliverablesText.split("\n").filter((line) => line.trim()).length;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const result = await createJuryProblemStatement(hackathonId, {
        domainId: form.domainId,
        title: form.title,
        category: form.industry,
        difficulty: form.difficulty,
        industry: form.industry,
        scope: form.scope,
        platform: form.platform,
        description: form.description,
        deliverables: form.deliverablesText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      });
      setForm(emptyForm);
      setFormOpen(false);
      setNotice(
        `${result.statement.id} was sent to the Super Admin for approval. It will go live once approved.`,
      );
      await load();
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Could not create problem statement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <JuryPageHeader
        title="Problem Statements"
        description={`Claim up to ${claimLimit} live statements — you score every team that picks them, and no other Jury member can claim them. You can unclaim a statement until you start scoring its teams. Statements you propose go live after Super Admin approval.`}
        actions={
          <JuryButton
            variant="primary"
            size="md"
            onClick={() => {
              setFormError("");
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" /> Propose statement
          </JuryButton>
        }
      />

      {notice ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {notice}
        </p>
      ) : null}
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
        placeholder="Search ID, title, or keyword"
        summary={
          <>
            <span
              className={
                limitReached ? "font-semibold text-amber-700" : "font-semibold text-foreground"
              }
            >
              {claimedCount} of {claimLimit} claimed
            </span>
            {claimedCount ? ` · ${myPickedCount} of yours picked by teams` : ""}
            {` · ${liveCount} live${pendingCount ? ` · ${pendingCount} awaiting approval` : ""}`}
          </>
        }
      >
        <JuryFilterSelect
          label="Filter by claim"
          value={claimFilter}
          onChange={setClaimFilter}
          options={[
            { value: "all", label: "All statements" },
            { value: "mine", label: "Claimed by me" },
            { value: "mine-picked", label: "Claimed by me · picked by teams" },
            { value: "mine-unpicked", label: "Claimed by me · no team yet" },
            { value: "available", label: "Available to claim" },
            { value: "available-picked", label: "Unclaimed · confirmed by teams" },
          ]}
        />
        <JuryFilterSelect
          label="Filter by domain"
          value={domainFilter}
          onChange={setDomainFilter}
          options={[
            { value: "all", label: "All domains" },
            ...Object.entries(domainLabels).map(([value, label]) => ({ value, label })),
          ]}
        />
        <JuryFilterSelect
          label="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All statuses" },
            { value: "active", label: "Live" },
            { value: "pending_approval", label: "Pending approval" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
      </JuryToolbar>

      <div className="mt-4 overflow-hidden rounded-2xl border border-(--color-border) bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-(--color-border) px-4 py-3">
          <p className="text-[12px] font-bold tracking-[0.06em] uppercase">
            {domainFilter === "all" ? "All domains" : domainLabels[domainFilter] || domainFilter}{" "}
            <span className="font-medium tracking-normal text-(--color-text-muted) normal-case">
              ({filtered.length} challenge{filtered.length === 1 ? "" : "s"})
            </span>
          </p>
        </div>

        {loading ? (
          <p className="px-4 py-12 text-center text-sm text-(--color-text-muted)">
            Loading statements…
          </p>
        ) : !filtered.length ? (
          <p className="px-4 py-12 text-center text-sm text-(--color-text-muted)">
            {statements.length ? "No statements match your search." : "No statements yet."}
          </p>
        ) : (
          <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3">
            {filtered.map((statement) => {
              const tracks = getStatementDomainIds(statement);
              const busy = claimingId === statement.id;
              return (
                <article
                  key={statement.id}
                  className={cn(
                    "flex min-h-[280px] flex-col border bg-white transition-shadow hover:shadow-md",
                    statement.claimedByMe
                      ? "border-(--brand-accent)/50"
                      : statement.status === "pending_approval"
                        ? "border-amber-300"
                        : statement.status === "rejected"
                          ? "border-red-200"
                          : "border-(--color-border)",
                  )}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-(--color-border) px-4 py-2.5">
                    <span className="truncate font-mono text-[11px] font-bold text-(--brand-accent)">
                      {statement.id}
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {statement.status !== "active" ? (
                        <StatusBadge status={statement.status} />
                      ) : null}
                      <span className="bg-(--color-background-alt) px-2 py-0.5 text-[10.5px] font-semibold text-(--color-text-secondary)">
                        {statement.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col px-4 py-3.5">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug">
                      <button
                        type="button"
                        onClick={() => setViewing(statement)}
                        title={statement.title}
                        className="text-left hover:text-(--brand-accent) hover:underline"
                      >
                        {statement.title}
                      </button>
                    </h3>

                    {statement.industry || statement.platform || statement.scope ? (
                      <dl className="mt-2 space-y-0.5 text-[11.5px]">
                        {[
                          ["Industry", statement.industry],
                          ["Tech", statement.platform],
                          ["Scope", statement.scope],
                        ]
                          .filter(([, value]) => value)
                          .map(([label, value]) => (
                            <div key={label} className="flex gap-1">
                              <dt className="shrink-0 text-(--color-text-muted)">{label}:</dt>
                              <dd className="truncate text-foreground/80" title={value}>
                                {value}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    ) : null}

                    <p
                      className="mt-2.5 line-clamp-4 text-xs leading-relaxed text-(--color-text-secondary)"
                      title={statement.description}
                    >
                      {statement.description}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                      {statement.teamProposal ? (
                        <span className="bg-sky-50 px-2 py-0.5 text-[10.5px] font-semibold text-sky-800">
                          Team idea
                        </span>
                      ) : null}
                      <span
                        className="bg-(--brand-accent-soft) px-2 py-0.5 text-[10.5px] font-semibold text-(--brand-accent)"
                        title={trackLabels(statement)}
                      >
                        {tracks.length > 1 ? `${tracks.length} tracks` : trackLabels(statement)}
                      </span>
                      {statement.deliverables?.length ? (
                        <span
                          className="bg-(--color-background-alt) px-2 py-0.5 text-[10.5px] font-medium text-(--color-text-secondary)"
                          title={statement.deliverables.join("\n")}
                        >
                          {statement.deliverables.length} deliverable
                          {statement.deliverables.length === 1 ? "" : "s"}
                        </span>
                      ) : null}
                      {statement.teamCount ? (
                        <span className="inline-flex items-center gap-1 bg-(--color-background-alt) px-2 py-0.5 text-[10.5px] font-medium text-(--color-text-secondary)">
                          <Users className="size-3" />
                          {statement.teamCount} team{statement.teamCount === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-(--color-border) bg-(--color-background-alt)/50 px-4 py-2.5">
                    <div className="min-w-0 text-[11px]">
                      <p className="truncate text-(--color-text-muted)">
                        {statement.teamProposal
                          ? "Team idea"
                          : statement.createdByMe
                            ? "Added by you"
                            : statement.createdBy?.name
                              ? `Added by Jury · ${statement.createdBy.name}`
                              : "Added by Admin"}
                      </p>
                      <p
                        className={cn(
                          "truncate font-semibold",
                          statement.claimedByMe
                            ? "text-(--brand-accent)"
                            : statement.claimed
                              ? "text-(--color-text-secondary)"
                              : "text-amber-700",
                        )}
                      >
                        {statement.claimedByMe
                          ? "Claimed by you"
                          : statement.claimed
                            ? `Claimed by ${statement.claimedByName || "another Jury member"}`
                            : statement.status === "active"
                              ? "Unclaimed"
                              : "Not live yet"}
                      </p>
                      {statement.claimedByMe ||
                      (!statement.claimed && statement.status === "active") ? (
                        <p
                          className={cn(
                            "truncate",
                            !statement.confirmedTeams?.length
                              ? "text-(--color-text-muted)"
                              : statement.claimedByMe
                                ? "font-semibold text-emerald-700"
                                : "font-semibold text-red-700",
                          )}
                          title={statement.confirmedTeams?.join(", ")}
                        >
                          {statement.confirmedTeams?.length
                            ? `${statement.claimedByMe ? "Confirmed" : "Needs a Jury · confirmed"} by ${statement.confirmedTeams.join(", ")}`
                            : "No team has confirmed it yet"}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewing(statement)}
                        aria-label={`View ${statement.title}`}
                        title="View"
                        className="inline-flex size-7 items-center justify-center border border-(--color-border) bg-white text-(--color-text-secondary) hover:bg-(--color-background-alt) hover:text-foreground"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      {statement.claimedByMe ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void unclaim(statement)}
                          className="inline-flex h-7 items-center gap-1 border border-red-200 bg-white px-2 text-[11px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          <Undo2 className="size-3" />
                          {busy ? "Unclaiming…" : "Unclaim"}
                        </button>
                      ) : !statement.claimed && statement.status === "active" ? (
                        <button
                          type="button"
                          disabled={limitReached || busy}
                          title={
                            limitReached ? `You've claimed ${claimLimit} statements` : undefined
                          }
                          onClick={() => void claim(statement)}
                          className="inline-flex h-7 items-center gap-1 bg-(--brand-accent) px-2.5 text-[11px] font-semibold text-white hover:bg-(--brand-accent-hover) disabled:opacity-60"
                        >
                          <Hand className="size-3" />
                          {busy ? "Claiming…" : "Claim"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto sm:rounded-2xl">
          {viewing ? (
            <>
              <DialogHeader>
                <p className="font-mono text-xs font-semibold text-(--brand-accent)">
                  {viewing.id} · {trackLabels(viewing)}
                </p>
                <DialogTitle className="text-xl">{viewing.title}</DialogTitle>
                <DialogDescription>
                  {viewing.difficulty} · Added by{" "}
                  {viewing.teamProposal
                    ? "a team (team idea)"
                    : viewing.createdByMe
                      ? "you"
                      : viewing.createdBy?.name || "Administrator"}{" "}
                  on {new Date(viewing.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div>
                <StatusBadge status={viewing.status} />
              </div>
              {viewing.claimedByMe || (!viewing.claimed && viewing.status === "active") ? (
                <div className="rounded-xl border border-(--color-border) bg-(--color-background-alt) px-3 py-2.5 text-sm">
                  <p className="text-[11px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
                    {viewing.claimedByMe
                      ? "Teams you will score"
                      : "Confirmed by teams · no Jury yet"}{" "}
                    ({viewing.confirmedTeams?.length || 0})
                  </p>
                  {viewing.confirmedTeams?.length ? (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 font-medium">
                      {viewing.confirmedTeams.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-(--color-text-secondary)">
                      No team has confirmed this statement yet.
                    </p>
                  )}
                </div>
              ) : null}
              {viewing.status === "rejected" && viewing.rejectionReason ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  Rejection reason: {viewing.rejectionReason}
                </p>
              ) : null}
              <ProblemStatementFacts
                industry={viewing.industry}
                scope={viewing.scope}
                platform={viewing.platform}
                description={viewing.description}
              />
              {viewing.deliverables?.length ? (
                <div>
                  <h3 className="text-sm font-semibold">Deliverables</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-(--color-text-secondary)">
                    {viewing.deliverables.map((item, index) => (
                      <li key={`${viewing.id}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="flex max-h-[92dvh] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl p-0">
          <div className="border-b border-(--color-border) px-5 pt-5 pb-4 sm:px-7">
            <DialogHeader className="text-left">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--brand-accent-soft) text-(--brand-accent)">
                  <FilePlus2 className="size-5" />
                </span>
                <div className="space-y-1">
                  <DialogTitle className="font-(family-name:--font-brand) text-xl">
                    Propose a Problem Statement
                  </DialogTitle>
                  <DialogDescription>
                    Hidden from teams until the Super Admin approves it.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <ol className="mt-4 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
              {["You submit", "Pending approval", "Super Admin approves", "Live for teams"].map(
                (step, index, steps) => (
                  <li key={step} className="flex items-center gap-1.5">
                    <span
                      className={
                        index === 0
                          ? "rounded-full bg-(--brand-accent) px-2.5 py-1 text-white"
                          : "rounded-full bg-(--color-background-alt) px-2.5 py-1 text-(--color-text-secondary)"
                      }
                    >
                      {step}
                    </span>
                    {index < steps.length - 1 ? (
                      <ChevronRight className="size-3.5 text-(--color-text-muted)" />
                    ) : null}
                  </li>
                ),
              )}
            </ol>
          </div>

          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
              <FormSection title="Basics">
                <FormField label="Title" htmlFor="ps-title" counter={`${form.title.length}/200`}>
                  <input
                    id="ps-title"
                    required
                    maxLength={200}
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    placeholder="e.g. Smart queue management for clinics"
                    className={fieldClass}
                  />
                </FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Industry" htmlFor="ps-industry">
                    <input
                      id="ps-industry"
                      required
                      maxLength={120}
                      value={form.industry}
                      onChange={(event) => setForm({ ...form, industry: event.target.value })}
                      placeholder="e.g. Healthcare, FinTech"
                      className={fieldClass}
                    />
                  </FormField>
                  <FormField label="Platform / Tech" htmlFor="ps-platform">
                    <input
                      id="ps-platform"
                      required
                      maxLength={200}
                      value={form.platform}
                      onChange={(event) => setForm({ ...form, platform: event.target.value })}
                      placeholder="e.g. Web, React, Node.js"
                      className={fieldClass}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Classification">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Domain" htmlFor="ps-domain">
                    <AppSelect
                      id="ps-domain"
                      value={form.domainId}
                      onValueChange={(domainId) => setForm({ ...form, domainId })}
                      options={Object.entries(domainLabels).map(([value, label]) => ({
                        value,
                        label,
                      }))}
                    />
                  </FormField>
                  <FormField label="Difficulty">
                    <SegmentedControl
                      ariaLabel="Difficulty"
                      value={form.difficulty}
                      onChange={(difficulty) => setForm({ ...form, difficulty })}
                      options={difficulties}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Details">
                <FormField
                  label="Scope"
                  htmlFor="ps-scope"
                  hint="What is in and out of scope for this problem."
                  counter={`${form.scope.length}/3000`}
                >
                  <textarea
                    id="ps-scope"
                    required
                    maxLength={3000}
                    rows={3}
                    value={form.scope}
                    onChange={(event) => setForm({ ...form, scope: event.target.value })}
                    className={`${fieldClass} resize-y`}
                  />
                </FormField>
                <FormField
                  label="Description"
                  htmlFor="ps-description"
                  hint="Explain the problem, who it affects, and any constraints."
                  counter={`${form.description.length}/10000`}
                >
                  <textarea
                    id="ps-description"
                    required
                    maxLength={10000}
                    rows={6}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    className={`${fieldClass} resize-y`}
                  />
                </FormField>
                <FormField
                  label="Deliverables"
                  htmlFor="ps-deliverables"
                  optional
                  hint="One deliverable per line."
                  counter={deliverableCount ? `${deliverableCount} listed` : undefined}
                >
                  <textarea
                    id="ps-deliverables"
                    rows={4}
                    value={form.deliverablesText}
                    onChange={(event) => setForm({ ...form, deliverablesText: event.target.value })}
                    placeholder={"Working prototype\nPitch deck\nDemo video"}
                    className={`${fieldClass} resize-y`}
                  />
                </FormField>
              </FormSection>

              {formError ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {formError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-(--color-border) bg-(--color-background-alt) px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="text-xs text-(--color-text-muted)">
                You can track its status on this page.
              </p>
              <div className="flex justify-end gap-2">
                <JuryButton size="md" onClick={() => setFormOpen(false)}>
                  Cancel
                </JuryButton>
                <JuryButton type="submit" variant="primary" size="md" disabled={saving}>
                  <Send className="size-4" />
                  {saving ? "Submitting…" : "Submit for approval"}
                </JuryButton>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
