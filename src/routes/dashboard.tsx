import { useEffect, useMemo, useState } from "react";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  ArrowRight,
  Upload,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  LockKeyhole,
  MapPin,
  Search,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  getHackathonDetails,
  getSelectedProblemStatementId,
  saveSelectedProblemStatementId,
  getHackathonStudentProfile,
  logoutHackathonStudent,
} from "@/lib/hackathon-storage";
import {
  getHackathonUserDetails,
  getHackathonReleaseTimer as getServerReleaseTimer,
  getHackathonProblemStatements,
  type HackathonProblemProposal,
  type HackathonProposalSlots,
  type HackathonRegisteredUser,
  type HackathonRoundResult,
} from "@/lib/hackathon-api";
import {
  FINAL_EVALUATION_ROUND,
  getStatementDomainIds,
  type HackathonDetails,
  type HackathonStudentProfile,
  type ProblemStatement,
} from "@/lib/hackathon";
import { tabIndicatorClass, useTabIndicator } from "@/components/admin/useTabIndicator";
import { StudentShell } from "@/components/student/StudentShell";
import { ProblemProposalCard } from "@/components/student/ProblemProposalCard";
import { AppSelect } from "@/components/AppSelect";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window === "undefined") {
      return;
    }

    const profile = getHackathonStudentProfile();

    if (!profile) {
      throw redirect({ to: "/hackathon" });
    }
  },
  component: DashboardPage,
});

const cardClass = "rounded-lg border border-(--color-border) bg-white";
const ALL = "all";
const DIFFICULTY_ORDER = ["Beginner", "Intermediate", "Advanced"];

function platformTags(value?: string) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function uniqueOptions(values: string[]) {
  const seen = new Map<string, string>();
  for (const value of values) {
    const key = value.toLowerCase();
    if (!seen.has(key)) seen.set(key, value);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

function DashboardPage() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const [releaseAt, setReleaseAt] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [details] = useState<HackathonDetails>(getHackathonDetails());
  const [statements, setStatements] = useState<ProblemStatement[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string>("ui-ux");
  const trackTabs = useTabIndicator("dashboard-tracks", selectedDomainId);
  const [statementQuery, setStatementQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState(ALL);
  const [platformFilter, setPlatformFilter] = useState(ALL);
  const [difficultyFilter, setDifficultyFilter] = useState(ALL);
  const [confirmedStatementId, setConfirmedStatementId] = useState<string | null>(
    getSelectedProblemStatementId(),
  );

  const [backendUser, setBackendUser] = useState<HackathonRegisteredUser | null>(null);
  const [roundResult, setRoundResult] = useState<HackathonRoundResult | null>(null);
  const [problemProposal, setProblemProposal] = useState<HackathonProblemProposal | null>(null);
  const [proposalSlots, setProposalSlots] = useState<HackathonProposalSlots | null>(null);
  const [localProfile, setLocalProfile] = useState<HackathonStudentProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);

    const profile = getHackathonStudentProfile();
    setLocalProfile(profile);

    if (!profile) {
      return;
    }

    if (profile?.email && profile?.mobile) {
      getHackathonUserDetails({
        email: profile.email,
        phone: profile.mobile,
      })
        .then((res) => {
          setRoundResult(res.roundResult ?? null);
          setProblemProposal(res.problemProposal ?? null);
          setProposalSlots(res.proposalSlots ?? null);
          if (res.user) {
            setBackendUser(res.user);
            setConfirmedStatementId(res.user.problem_statement_id || null);
            if (res.user.problem_statement_id) {
              saveSelectedProblemStatementId(res.user.problem_statement_id);
            }
          }
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadReleaseTimer() {
      try {
        const data = await getServerReleaseTimer();

        if (mounted) {
          setReleaseAt(data.releaseAt);
          setNow(Date.now());
        }
      } catch (error) {
        console.error("Failed to load release timer:", error);
      }
    }

    void loadReleaseTimer();

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    async function loadProblemStatements() {
      try {
        const data = await getHackathonProblemStatements();
        setStatements(data.statements || []);
      } catch (error) {
        console.error("Failed to load problem statements:", error);
      }
    }

    void loadProblemStatements();
  }, []);

  useEffect(() => {
    const confirmedStatement = statements.find(
      (statement) => statement.id === confirmedStatementId,
    );

    if (confirmedStatement) {
      setSelectedDomainId(confirmedStatement.domainId);
    }
  }, [confirmedStatementId, statements]);

  const releaseTimestamp = releaseAt ? Date.parse(releaseAt) : null;
  const timeLeft = releaseTimestamp && now ? Math.max(0, releaseTimestamp - now) : 0;

  const isReleased = !releaseTimestamp || (now !== null && timeLeft === 0);

  const activeDomain = details.domains.find((domain) => domain.id === selectedDomainId);

  const domainStatements = useMemo(
    () =>
      statements.filter(
        (statement) =>
          statement.available !== false &&
          getStatementDomainIds(statement).includes(selectedDomainId),
      ),
    [selectedDomainId, statements],
  );

  const filterOptions = useMemo(
    () => ({
      industries: uniqueOptions(
        domainStatements.map((statement) => statement.industry?.trim() || "").filter(Boolean),
      ),
      platforms: uniqueOptions(
        domainStatements.flatMap((statement) => platformTags(statement.platform)),
      ),
      difficulties: DIFFICULTY_ORDER.filter((level) =>
        domainStatements.some((statement) => statement.difficulty === level),
      ),
    }),
    [domainStatements],
  );

  const filteredStatements = useMemo(() => {
    const query = statementQuery.trim().toLowerCase();
    return domainStatements.filter((statement) => {
      if (
        industryFilter !== ALL &&
        (statement.industry || "").trim().toLowerCase() !== industryFilter.toLowerCase()
      ) {
        return false;
      }
      if (
        platformFilter !== ALL &&
        !platformTags(statement.platform).some(
          (tag) => tag.toLowerCase() === platformFilter.toLowerCase(),
        )
      ) {
        return false;
      }
      if (difficultyFilter !== ALL && statement.difficulty !== difficultyFilter) return false;
      if (!query) return true;
      return [
        statement.id,
        statement.title,
        statement.description,
        statement.industry,
        statement.platform,
        statement.scope,
      ].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [difficultyFilter, domainStatements, industryFilter, platformFilter, statementQuery]);

  const hasActiveFilters =
    statementQuery.trim() !== "" ||
    industryFilter !== ALL ||
    platformFilter !== ALL ||
    difficultyFilter !== ALL;

  function clearStatementFilters() {
    setStatementQuery("");
    setIndustryFilter(ALL);
    setPlatformFilter(ALL);
    setDifficultyFilter(ALL);
  }

  function selectTrack(domainId: string) {
    setSelectedDomainId(domainId);
    clearStatementFilters();
  }

  const confirmedStatement = statements.find((statement) => statement.id === confirmedStatementId);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const countdown = isMounted
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(seconds).padStart(2, "0")}`
    : "00:00:00";

  const displayName = localProfile?.name || backendUser?.lead_name || "Participant";
  const firstName = String(displayName).split(" ")[0];
  const isLead =
    !!backendUser && backendUser.email?.toLowerCase() === localProfile?.email?.toLowerCase();
  const leadName = backendUser?.lead_name || "your Team Lead";
  const roleLabel = isLead ? "Team Lead" : "Team Member";
  const memberCount = backendUser?.members?.length || 1;
  const submittedAt = backendUser?.submission?.submitted_at;

  function handleLogout() {
    logoutHackathonStudent();
    void navigate({ to: "/hackathon", replace: true });
  }

  const availableStatementCount = statements.filter(
    (statement) => statement.available !== false,
  ).length;

  const proposalCard = (
    <ProblemProposalCard
      domains={details.domains}
      defaultDomainId={selectedDomainId}
      isLead={isLead}
      leadName={leadName}
      credentials={
        localProfile?.email && localProfile.mobile
          ? { email: localProfile.email, phone: localProfile.mobile }
          : null
      }
      proposal={problemProposal}
      slots={proposalSlots}
      onChange={(state) => {
        setProblemProposal(state.problemProposal ?? null);
        if (state.proposalSlots) setProposalSlots(state.proposalSlots);
      }}
    />
  );

  const stats = [
    {
      label: "Registration",
      value: "Registered",
      hint: "Participation confirmed",
      Icon: CheckCircle2,
    },
    {
      label: "Team",
      value: backendUser?.team_name || "Your Team",
      hint: backendUser ? `${memberCount} member${memberCount === 1 ? "" : "s"}` : "Loading…",
      Icon: Users,
    },
    {
      label: "Countdown",
      value: isReleased ? "Released" : countdown,
      hint: isReleased ? "Problem statements are open" : "Until statements release",
      Icon: Clock3,
      mono: !isReleased,
    },
    {
      label: "Prize pool",
      value: details.prizePool,
      hint: "Total prize pool",
      Icon: Trophy,
    },
  ];

  return (
    <StudentShell
      pathname={pathname}
      teamName={backendUser?.team_name}
      roleLabel={roleLabel}
      memberCount={backendUser ? memberCount : null}
      displayName={displayName}
      email={localProfile?.email}
      confirmedStatementId={confirmedStatementId}
      onLogout={handleLogout}
    >
      {pathname === "/dashboard" ? (
        <>
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                {details.title} 2026
              </p>
              <h1 className="mt-1 font-display text-xl font-bold tracking-tight sm:text-2xl">
                Welcome, {firstName}
              </h1>
              <p className="mt-1 text-[13px] text-(--color-text-secondary)">
                Track your team, problem statement and final submission.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 border border-(--color-border) bg-white px-2.5 py-1 text-[11.5px] font-medium text-(--color-text-secondary)">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              {roleLabel}
            </span>
          </section>

          {roundResult ? (
            <section
              role="status"
              className={`mt-5 flex items-start gap-3 rounded-lg border p-4 sm:p-5 ${
                roundResult.status === "qualified"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-md ${
                  roundResult.status === "qualified"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {roundResult.status === "qualified" ? (
                  <Trophy className="size-4" />
                ) : (
                  <X className="size-4" />
                )}
              </span>
              <div className="min-w-0">
                {roundResult.status === "qualified" ? (
                  <>
                    <p className="text-sm font-semibold text-emerald-900">
                      Qualified in Round {roundResult.round} — going to Round{" "}
                      {roundResult.nextRound}
                      {roundResult.nextRound === FINAL_EVALUATION_ROUND ? " (Final round)" : ""}
                    </p>
                    <p className="mt-0.5 text-[13px] text-emerald-800">
                      Congratulations! Your team cleared Round {roundResult.round} and will be
                      evaluated again by the Jury in Round {roundResult.nextRound}
                      {roundResult.nextRound === FINAL_EVALUATION_ROUND ? ", the final round" : ""}.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-red-900">
                      Disqualified in Round {roundResult.round}
                    </p>
                    <p className="mt-0.5 text-[13px] text-red-800">
                      Your team's overall score didn't reach the Round {roundResult.round} cutoff.
                      Thank you for participating.
                    </p>
                  </>
                )}
              </div>
            </section>
          ) : null}

          <section className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {stats.map(({ label, value, hint, Icon, mono }) => (
              <div key={label} className={`${cardClass} p-3.5`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10.5px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase">
                    {label}
                  </p>
                  <span className="grid size-6 place-items-center rounded-md bg-(--brand-accent-soft) text-(--brand-accent)">
                    <Icon className="size-3.5" />
                  </span>
                </div>
                <p
                  className={`mt-2 truncate text-base font-bold sm:text-lg ${mono ? "font-mono tabular-nums" : ""}`}
                >
                  {value}
                </p>
                <p className="mt-0.5 truncate text-[11.5px] text-(--color-text-muted)">{hint}</p>
              </div>
            ))}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="min-w-0 space-y-5">
              {confirmedStatement && backendUser && (
                <div className={`${cardClass} flex flex-wrap items-center gap-3 p-4 sm:p-5`}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-(--brand-accent-soft) text-(--brand-accent)">
                    <Upload className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                      Final submission
                    </p>
                    <p className="mt-0.5 text-[13px] text-(--color-text-secondary)">
                      {submittedAt
                        ? `${isLead ? "You" : leadName} submitted your team's project.`
                        : isLead
                          ? "Submit your project from your problem statement page."
                          : `${leadName} submits the project for your team.`}
                    </p>
                  </div>
                  {isLead && !submittedAt ? (
                    <Link
                      to="/hackathon/problems/$problemId"
                      params={{ problemId: confirmedStatement.id }}
                      className="inline-flex h-9 items-center justify-center gap-1.5 bg-(--brand-primary) px-3 text-[12.5px] font-semibold text-white transition hover:bg-(--brand-primary-hover) max-sm:flex-1 sm:h-8"
                    >
                      Go to submit
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : null}
                  <span
                    className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] font-semibold ${submittedAt ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-(--color-border) bg-(--color-background-alt) text-(--color-text-secondary)"}`}
                  >
                    {submittedAt ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <Clock3 className="size-3.5" />
                    )}
                    {submittedAt ? "Submitted" : "Not submitted"}
                  </span>
                </div>
              )}

              <div id="challenge-selection" className={`${cardClass} p-4 sm:p-5`}>
                {!isReleased ? (
                  <div className="flex min-h-48 flex-col items-center justify-center text-center">
                    <span className="grid size-11 place-items-center rounded-full bg-(--brand-accent-soft) text-(--brand-accent)">
                      <LockKeyhole className="size-5" />
                    </span>
                    <p className="mt-3 text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                      Problem statements locked
                    </p>
                    <h2 className="mt-1 text-base font-bold sm:text-lg">
                      Challenges will be released soon
                    </h2>
                    <p className="mt-1 max-w-sm text-[12.5px] text-(--color-text-secondary)">
                      They appear here when the countdown reaches zero.
                    </p>
                  </div>
                ) : confirmedStatementId ? (
                  <div className="border border-(--brand-accent)/40 bg-(--brand-accent-soft) p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                        <CheckCircle2 className="size-3.5" /> Your team&apos;s problem statement
                      </span>
                      {confirmedStatement ? (
                        <span className="border border-(--color-border) bg-white px-1.5 py-0.5 text-[10.5px] font-semibold text-(--color-text-secondary)">
                          {confirmedStatement.difficulty}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 font-mono text-[11.5px] font-bold text-(--brand-accent)">
                      {confirmedStatementId}
                    </p>
                    {confirmedStatement ? (
                      <>
                        <h3 className="mt-0.5 text-base font-bold">{confirmedStatement.title}</h3>
                        {confirmedStatement.industry || confirmedStatement.platform ? (
                          <p className="mt-0.5 text-[11.5px] text-(--color-text-secondary)">
                            {[confirmedStatement.industry, confirmedStatement.platform]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        ) : null}
                        <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-5 text-(--color-text-secondary)">
                          {confirmedStatement.description}
                        </p>
                        <Link
                          to="/hackathon/problems/$problemId"
                          params={{ problemId: confirmedStatement.id }}
                          className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-(--brand-accent) hover:underline"
                        >
                          View full details <ArrowRight className="size-3.5" />
                        </Link>
                      </>
                    ) : null}
                    <p className="mt-3 flex items-center gap-1.5 border-t border-(--brand-accent)/20 pt-3 text-[11.5px] text-(--color-text-secondary)">
                      <LockKeyhole className="size-3.5 shrink-0" />
                      Confirmed by {isLead ? "you" : leadName}. A team can confirm only one problem
                      statement, so this can&apos;t be changed.
                    </p>
                  </div>
                ) : !backendUser ? (
                  <p className="py-10 text-center text-[12.5px] text-(--color-text-secondary)">
                    Loading your team…
                  </p>
                ) : !isLead ? (
                  <div className="flex min-h-48 flex-col items-center justify-center text-center">
                    <span className="grid size-11 place-items-center rounded-full bg-(--brand-accent-soft) text-(--brand-accent)">
                      <Clock3 className="size-5" />
                    </span>
                    <p className="mt-3 text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                      Waiting for your Team Lead
                    </p>
                    <h2 className="mt-1 text-base font-bold sm:text-lg">
                      No problem statement confirmed yet
                    </h2>
                    <p className="mt-1 max-w-sm text-[12.5px] text-(--color-text-secondary)">
                      {leadName} selects and confirms your team&apos;s problem statement. It will
                      appear here once it&apos;s confirmed.
                    </p>
                    <div className="w-full max-w-xl text-left">{proposalCard}</div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                          Problem statements
                        </p>
                        <h2 className="mt-1 text-base font-bold sm:text-lg">
                          Choose your challenge
                        </h2>
                      </div>
                      <span className="border border-(--color-border) bg-(--color-background-alt) px-2 py-0.5 text-[11px] font-semibold text-(--color-text-secondary)">
                        {availableStatementCount} available
                      </span>
                    </div>
                    <p className="mt-2 flex items-start gap-1.5 border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-5 text-amber-800">
                      <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
                      Your team can confirm only one problem statement, and it can&apos;t be changed
                      afterwards. Review it carefully before confirming.
                    </p>
                    {proposalCard}

                    <div
                      ref={trackTabs.containerRef}
                      role="tablist"
                      aria-label="Competition tracks"
                      className="relative mt-4 flex gap-5 overflow-x-auto border-b border-(--color-border) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {details.domains.map((domain) => {
                        const active = selectedDomainId === domain.id;
                        return (
                          <button
                            key={domain.id}
                            type="button"
                            role="tab"
                            data-tab-key={domain.id}
                            aria-selected={active}
                            onClick={() => selectTrack(domain.id)}
                            className={`shrink-0 px-0.5 pt-1 pb-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--brand-accent) ${active ? "text-(--brand-accent)" : "text-(--color-text-secondary) hover:text-foreground"}`}
                          >
                            {domain.shortName}
                          </button>
                        );
                      })}
                      <span
                        aria-hidden
                        className={tabIndicatorClass}
                        style={trackTabs.indicatorStyle}
                      />
                    </div>

                    {activeDomain && (
                      <p className="mt-3 text-[12.5px] leading-5 text-(--color-text-secondary)">
                        {activeDomain.description}
                      </p>
                    )}

                    {domainStatements.length > 0 ? (
                      <div className="mt-3 border border-(--color-border) bg-(--color-background-alt) p-2.5">
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap [&>*:last-child:nth-child(even)]:col-span-2">
                          <label className="relative col-span-2 sm:min-w-48 sm:flex-1">
                            <span className="sr-only">Search problem statements</span>
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-(--color-text-muted)" />
                            <input
                              type="search"
                              value={statementQuery}
                              onChange={(event) => setStatementQuery(event.target.value)}
                              placeholder="Search title, ID or keyword"
                              className="h-9 w-full border border-(--color-border) bg-white pr-3 pl-8 text-[13px] outline-none transition placeholder:text-(--color-text-muted) hover:border-(--brand-accent)/50 focus:border-(--brand-accent)"
                            />
                          </label>
                          {filterOptions.industries.length > 0 ? (
                            <AppSelect
                              value={industryFilter}
                              onValueChange={setIndustryFilter}
                              ariaLabel="Filter by industry"
                              size="sm"
                              className="w-full rounded-none sm:w-44"
                              contentClassName="rounded-none"
                              options={[
                                { value: ALL, label: "All industries" },
                                ...filterOptions.industries.map((value) => ({
                                  value,
                                  label: value,
                                })),
                              ]}
                            />
                          ) : null}
                          {filterOptions.platforms.length > 0 ? (
                            <AppSelect
                              value={platformFilter}
                              onValueChange={setPlatformFilter}
                              ariaLabel="Filter by platform or tech"
                              size="sm"
                              className="w-full rounded-none sm:w-44"
                              contentClassName="rounded-none"
                              options={[
                                { value: ALL, label: "All platforms / tech" },
                                ...filterOptions.platforms.map((value) => ({
                                  value,
                                  label: value,
                                })),
                              ]}
                            />
                          ) : null}
                          {filterOptions.difficulties.length > 1 ? (
                            <AppSelect
                              value={difficultyFilter}
                              onValueChange={setDifficultyFilter}
                              ariaLabel="Filter by difficulty"
                              size="sm"
                              className="w-full rounded-none sm:w-36"
                              contentClassName="rounded-none"
                              options={[
                                { value: ALL, label: "All levels" },
                                ...filterOptions.difficulties.map((value) => ({
                                  value,
                                  label: value,
                                })),
                              ]}
                            />
                          ) : null}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 text-[11.5px] text-(--color-text-secondary)">
                          <span aria-live="polite">
                            Showing {filteredStatements.length} of {domainStatements.length}
                          </span>
                          {hasActiveFilters ? (
                            <button
                              type="button"
                              onClick={clearStatementFilters}
                              className="inline-flex items-center gap-1 font-semibold text-(--brand-accent) hover:underline"
                            >
                              <X className="size-3.5" />
                              Clear filters
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    <div
                      key={selectedDomainId}
                      className="mt-3 divide-y divide-(--color-border) border border-(--color-border) animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
                    >
                      {filteredStatements.length > 0 ? (
                        filteredStatements.map((statement) => (
                          <Link
                            key={statement.id}
                            to="/hackathon/problems/$problemId"
                            params={{ problemId: statement.id }}
                            aria-label={`View ${statement.id}: ${statement.title}`}
                            className="group flex items-center gap-2.5 px-3 py-3 transition-colors hover:bg-(--color-background-alt) sm:gap-3 sm:px-3.5"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] font-bold text-(--brand-accent)">
                                  {statement.id}
                                </span>
                                <span className="bg-(--color-background-alt) px-1.5 py-0.5 text-[10.5px] font-semibold text-(--color-text-secondary)">
                                  {statement.difficulty}
                                </span>
                              </div>
                              <p className="mt-1 text-[13.5px] font-semibold group-hover:text-(--brand-accent)">
                                {statement.title}
                              </p>
                              {statement.industry || statement.platform ? (
                                <p className="mt-0.5 text-[11.5px] text-(--color-text-secondary)">
                                  {[statement.industry, statement.platform]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              ) : null}
                              <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-(--color-text-muted)">
                                {statement.description}
                              </p>
                            </div>
                            <span
                              aria-hidden
                              className="inline-flex h-8 shrink-0 items-center gap-1.5 border border-(--brand-accent)/40 bg-white px-2.5 text-[12px] font-semibold text-(--brand-accent) transition-colors group-hover:border-(--brand-accent) group-hover:bg-(--brand-accent) group-hover:text-white min-[400px]:px-3"
                            >
                              <Eye className="size-3.5" />
                              <span className="hidden min-[400px]:inline">View</span>
                            </span>
                          </Link>
                        ))
                      ) : domainStatements.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-4 text-[12.5px] text-(--color-text-secondary)">
                          No problem statements match these filters.
                          <button
                            type="button"
                            onClick={clearStatementFilters}
                            className="font-semibold text-(--brand-accent) hover:underline"
                          >
                            Clear filters
                          </button>
                        </div>
                      ) : (
                        <p className="p-4 text-[12.5px] text-(--color-text-secondary)">
                          No problem statements are available in this domain yet.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <aside className={`${cardClass} h-fit p-4`}>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                Hackathon info
              </p>
              <dl className="mt-3 space-y-3">
                <InfoRow
                  Icon={CalendarDays}
                  label={details.venue.dateLabel}
                  hint={details.durationBadge}
                />
                <InfoRow Icon={MapPin} label={details.venue.name} hint={details.venue.area} />
                <InfoRow
                  Icon={Users}
                  label={backendUser?.team_name || "Your Team"}
                  hint={`Lead: ${backendUser?.lead_name || localProfile?.name || "Loading…"}`}
                />
              </dl>
              {backendUser && backendUser.members.length > 0 && (
                <div className="mt-4 border-t border-(--color-border) pt-3">
                  <p className="text-[11px] font-semibold text-(--color-text-muted)">Members</p>
                  <ul className="mt-1.5 space-y-1.5">
                    {backendUser.members.map((member, i) => (
                      <li key={member.email || i} className="flex items-center gap-2 text-[12.5px]">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-(--brand-accent-soft) text-[10px] font-semibold text-(--brand-accent)">
                          {String(member.full_name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                        <span className="truncate">{member.full_name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link
                to="/dashboard/team"
                className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-(--brand-accent) hover:underline"
              >
                Manage team <ArrowRight className="size-3.5" />
              </Link>
            </aside>
          </section>
        </>
      ) : (
        <Outlet />
      )}
    </StudentShell>
  );
}

function InfoRow({
  Icon,
  label,
  hint,
}: {
  Icon: typeof CalendarDays;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-(--brand-accent)" />
      <div className="min-w-0">
        <dt className="text-[13px] font-semibold leading-5">{label}</dt>
        <dd className="text-[11.5px] text-(--color-text-muted)">{hint}</dd>
      </div>
    </div>
  );
}
