import { createFileRoute, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  Layers,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";

import {
  areProblemStatementsReleased,
  getHackathonDetails,
  getHackathonStudentProfile,
  logoutHackathonStudent,
  saveSelectedProblemStatementId,
} from "@/lib/hackathon-storage";

import {
  confirmHackathonProblem,
  getHackathonProblemStatements,
  getHackathonUserDetails,
} from "@/lib/hackathon-api";
import { getStatementDomainIds, type ProblemStatement } from "@/lib/hackathon";
import { StudentShell } from "@/components/student/StudentShell";
import { ProjectSubmissionDialog } from "@/components/student/ProjectSubmissionDialog";

export const Route = createFileRoute("/hackathon/problems/$problemId")({
  beforeLoad: () => {
    const profile = getHackathonStudentProfile();

    if (!profile) {
      throw redirect({ to: "/hackathon" });
    }
  },
  loader: async ({ params }) => {
    if (!areProblemStatementsReleased()) {
      throw redirect({ to: "/dashboard" });
    }

    const profile = getHackathonStudentProfile();
    const [data, teamResponse] = await Promise.all([
      getHackathonProblemStatements(),
      profile
        ? getHackathonUserDetails({ email: profile.email, phone: profile.mobile }).catch(() => null)
        : null,
    ]);
    const team = teamResponse?.user ?? null;
    const isLead = !!team && team.email?.toLowerCase() === profile?.email?.toLowerCase();
    const teamStatementId = team?.problem_statement_id?.toUpperCase() || null;

    if (!isLead && teamStatementId !== params.problemId.toUpperCase()) {
      throw redirect({ to: "/dashboard" });
    }

    const statement = data.statements?.find(
      (item: ProblemStatement) => item.id.toLowerCase() === params.problemId.toLowerCase(),
    );

    if (!statement) {
      throw notFound();
    }

    const domains = getHackathonDetails().domains;
    const domainNames = getStatementDomainIds(statement).map(
      (id) => domains.find((item) => item.id === id)?.name || id,
    );

    return {
      statement,
      domainNames,
      details: getHackathonDetails(),
      isLead,
      teamStatementId,
      leadName: team?.lead_name || "your Team Lead",
      teamName: team?.team_name || null,
      memberCount: team?.members?.length || null,
      submittedAt: team?.submission?.submitted_at || null,
    };
  },

  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.statement.id}: ${loaderData.statement.title} — AI HACK X MRDU`
          : "Problem Statement — AI HACK X MRDU",
      },
      ...(loaderData
        ? [
            {
              name: "description",
              content: loaderData.statement.description,
            },
          ]
        : []),
    ],
  }),

  component: ProblemStatementDetailsPage,
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-(--color-border) px-5 py-5 sm:px-6">
      <h3 className="text-[11px] font-semibold tracking-[0.08em] text-(--color-text-muted) uppercase">
        {title}
      </h3>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function ProblemStatementDetailsPage() {
  const navigate = useNavigate();
  const {
    statement,
    domainNames,
    details,
    isLead,
    leadName,
    teamName,
    memberCount,
    ...loaderData
  } = Route.useLoaderData();

  const profile = getHackathonStudentProfile();

  const [copied, setCopied] = useState(false);
  const [teamStatementId, setTeamStatementId] = useState(loaderData.teamStatementId);
  const [isConfirming, setIsConfirming] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(loaderData.submittedAt);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const confirmed = teamStatementId === String(statement.id).toUpperCase();
  const lockedToOther = !!teamStatementId && !confirmed;
  const roleLabel = isLead ? "Team Lead" : "Team Member";
  const pathname = `/hackathon/problems/${statement.id}`;

  function handleCopyReference() {
    void navigator.clipboard.writeText(`${statement.id}: ${statement.title}`);
    setCopied(true);
    toast.success(`Copied ${statement.id} to clipboard`);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleConfirmStatement() {
    if (!profile?.email || !profile?.mobile) {
      toast.error("You must be logged in to confirm a problem statement.");
      return;
    }
    if (!isLead || teamStatementId) return;
    if (
      !window.confirm(
        `Confirm ${statement.id} for your team?\n\nA team can confirm only one problem statement, and it can't be changed afterwards.`,
      )
    ) {
      return;
    }

    setIsConfirming(true);
    try {
      await confirmHackathonProblem({
        email: profile.email,
        phone: profile.mobile,
        problem_statement_id: statement.id,
      });
      saveSelectedProblemStatementId(statement.id);
      setTeamStatementId(String(statement.id).toUpperCase());
      toast.success(`${statement.id} confirmed as your problem statement`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm statement");
    } finally {
      setIsConfirming(false);
    }
  }

  function handleLogout() {
    logoutHackathonStudent();
    void navigate({ to: "/hackathon", replace: true });
  }

  const statusTone = confirmed
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : lockedToOther
      ? "border-(--color-border) bg-(--color-background-alt) text-(--color-text-secondary)"
      : "border-amber-200 bg-amber-50 text-amber-800";

  const competitionFacts = [
    { Icon: CalendarDays, label: details.venue.dateLabel, hint: "Hackathon dates" },
    { Icon: Clock3, label: details.durationBadge, hint: `${details.venue.format} event` },
    { Icon: Users, label: details.venue.teamSize, hint: "Eligible team size" },
    { Icon: MapPin, label: details.venue.name, hint: details.venue.area },
  ];

  return (
    <StudentShell
      pathname={pathname}
      teamName={teamName}
      roleLabel={roleLabel}
      memberCount={memberCount}
      displayName={profile?.name || "Student"}
      email={profile?.email}
      confirmedStatementId={teamStatementId}
      onLogout={handleLogout}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
            {confirmed ? "Your team's challenge" : "Review challenge"}
          </p>
          <h1 className="mt-1 font-display text-xl font-bold tracking-tight sm:text-2xl">
            Problem statement
          </h1>
        </div>
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="border border-(--color-border) bg-white">
          <header className="px-5 pt-5 pb-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="bg-(--brand-accent-soft) px-2 py-0.5 font-mono text-[11px] font-bold text-(--brand-accent)">
                {statement.id}
              </span>
              <span className="bg-(--color-background-alt) px-2 py-0.5 text-[11px] font-semibold text-(--color-text-secondary)">
                {statement.difficulty}
              </span>
              {statement.category ? (
                <span className="inline-flex items-center gap-1 bg-(--color-background-alt) px-2 py-0.5 text-[11px] font-medium text-(--color-text-secondary)">
                  <Layers className="size-3" />
                  {statement.category}
                </span>
              ) : null}
            </div>

            <h2 className="mt-3 font-display text-xl leading-tight font-bold tracking-tight text-foreground sm:text-[1.6rem]">
              {statement.title}
            </h2>

            {domainNames.length ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {domainNames.map((name) => (
                  <span
                    key={name}
                    className="border border-(--brand-accent)/25 px-2 py-0.5 text-[11px] font-semibold text-(--brand-accent)"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : null}

            {statement.industry || statement.platform ? (
              <dl className="mt-4 grid grid-cols-2 border border-(--color-border)">
                <div className="px-3 py-2">
                  <dt className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
                    Industry
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-semibold text-foreground">
                    {statement.industry || "Not specified"}
                  </dd>
                </div>
                <div className="border-l border-(--color-border) px-3 py-2">
                  <dt className="text-[10.5px] font-semibold tracking-wider text-(--color-text-muted) uppercase">
                    Platform / Tech
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-semibold text-foreground">
                    {statement.platform || "Not specified"}
                  </dd>
                </div>
              </dl>
            ) : null}
          </header>

          {statement.scope ? (
            <Section title="Scope">
              <p className="text-[13.5px] leading-6 whitespace-pre-line text-(--color-text-secondary)">
                {statement.scope}
              </p>
            </Section>
          ) : null}

          <Section title="Description">
            <p className="text-[13.5px] leading-6 whitespace-pre-line text-(--color-text-secondary)">
              {statement.description}
            </p>
          </Section>

          {statement.deliverables && statement.deliverables.length > 0 ? (
            <Section title="Key deliverables">
              <ul className="grid gap-2">
                {statement.deliverables.map((item: string) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[13.5px] leading-6 text-(--color-text-secondary)"
                  >
                    <CheckCircle2 className="mt-1 size-3.5 shrink-0 text-(--brand-accent)" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="border border-(--color-border) bg-white">
            <div className={`flex items-start gap-2.5 border-b px-4 py-3 ${statusTone}`}>
              {confirmed ? (
                <Check className="mt-0.5 size-4 shrink-0" />
              ) : lockedToOther ? (
                <LockKeyhole className="mt-0.5 size-4 shrink-0" />
              ) : (
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">
                  {confirmed
                    ? "Confirmed for your team"
                    : lockedToOther
                      ? `Your team chose ${teamStatementId}`
                      : "Not confirmed yet"}
                </p>
                <p className="mt-0.5 text-[11.5px] leading-5 opacity-90">
                  {confirmed
                    ? `Confirmed by ${isLead ? "you" : leadName}. It can't be changed.`
                    : lockedToOther
                      ? "A team can confirm only one problem statement."
                      : isLead
                        ? "You can confirm only one statement, and it can't be changed afterwards."
                        : `Only ${leadName} can confirm a statement.`}
                </p>
              </div>
            </div>

            <div className="space-y-2 p-4">
              {confirmed ? (
                <div className="flex items-center justify-between gap-2 border border-(--color-border) bg-(--color-background-alt) px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase">
                      Final submission
                    </p>
                    <p className="truncate text-[12.5px] font-medium text-foreground">
                      {submittedAt
                        ? `Submitted ${new Date(submittedAt).toLocaleString(undefined, {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          })}`
                        : isLead
                          ? "Not submitted yet"
                          : `${leadName} submits for your team`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-1.5 py-0.5 text-[10.5px] font-semibold ${submittedAt ? "bg-emerald-50 text-emerald-700" : "bg-white text-(--color-text-secondary)"}`}
                  >
                    {submittedAt ? "Submitted" : "Pending"}
                  </span>
                </div>
              ) : null}
              {confirmed && isLead && !submittedAt ? (
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(true)}
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 bg-(--brand-primary) px-4 text-[13px] font-semibold text-white transition hover:bg-(--brand-primary-hover)"
                >
                  <Upload className="size-4" />
                  Submit project
                </button>
              ) : null}
              {isLead && !confirmed && !lockedToOther && statement.available === false ? (
                <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
                  This statement was proposed by another team and is reserved for them. Please
                  choose another one.
                </p>
              ) : isLead && !confirmed && !lockedToOther ? (
                <button
                  type="button"
                  onClick={() => void handleConfirmStatement()}
                  disabled={isConfirming}
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 bg-(--brand-accent) px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
                >
                  <Check className="size-4" />
                  {isConfirming ? "Confirming..." : "Confirm this statement"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleCopyReference}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 border border-(--color-border) bg-white px-4 text-[13px] font-semibold text-(--color-text-secondary) transition-colors hover:bg-(--color-background-alt) hover:text-foreground"
              >
                {copied ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />}
                {copied ? "Copied" : "Copy reference"}
              </button>
            </div>
          </div>

          <div className="border border-(--color-border) bg-white p-4">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-(--color-text-muted) uppercase">
              Competition details
            </p>
            <dl className="mt-3 space-y-3">
              {competitionFacts.map(({ Icon, label, hint }) => (
                <div key={hint} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 size-4 shrink-0 text-(--brand-accent)" />
                  <div className="min-w-0">
                    <dt className="text-[13px] leading-5 font-semibold text-foreground">{label}</dt>
                    <dd className="text-[11.5px] text-(--color-text-muted)">{hint}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      {isLead && confirmed && profile?.email && profile?.mobile ? (
        <ProjectSubmissionDialog
          open={isSubmitOpen}
          onOpenChange={setIsSubmitOpen}
          email={profile.email}
          phone={profile.mobile}
          statementId={statement.id}
          onSubmitted={(user) =>
            setSubmittedAt(user?.submission?.submitted_at || new Date().toISOString())
          }
        />
      ) : null}
    </StudentShell>
  );
}
