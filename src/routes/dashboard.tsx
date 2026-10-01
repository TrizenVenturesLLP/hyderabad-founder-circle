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
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  FileText,
  Upload,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  LayoutDashboard,
  LockKeyhole,
  MapPin,
  Trophy,
  Users,
  Menu,
  X,
  LogOut,
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
  submitHackathonProject,
  type HackathonRegisteredUser,
} from "@/lib/hackathon-api";
import {
  getStatementDomainIds,
  type HackathonDetails,
  type HackathonStudentProfile,
  type ProblemStatement,
} from "@/lib/hackathon";
import { tabIndicatorClass, useTabIndicator } from "@/components/admin/useTabIndicator";

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

const navItems = [
  { to: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { to: "/dashboard/team", label: "My Team", Icon: Users },
] as const;

const cardClass = "rounded-lg border border-(--color-border) bg-white";
const inputClass =
  "w-full border border-(--color-border) bg-white text-[13px] text-foreground outline-none transition placeholder:text-(--color-text-muted) focus:border-(--brand-accent)";

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
  const [confirmedStatementId, setConfirmedStatementId] = useState<string | null>(
    getSelectedProblemStatementId(),
  );

  const [backendUser, setBackendUser] = useState<HackathonRegisteredUser | null>(null);
  const [localProfile, setLocalProfile] = useState<HackathonStudentProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [githubRepo, setGithubRepo] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

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
      statements.filter((statement) => getStatementDomainIds(statement).includes(selectedDomainId)),
    [selectedDomainId, statements],
  );

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
  const initial = String(displayName).charAt(0).toUpperCase() || "P";
  const isLead =
    !!backendUser && backendUser.email?.toLowerCase() === localProfile?.email?.toLowerCase();
  const leadName = backendUser?.lead_name || "your Team Lead";
  const roleLabel = isLead ? "Team Lead" : "Team Member";
  const memberCount = backendUser?.members?.length || 1;
  const submittedAt = backendUser?.submission?.submitted_at;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    logoutHackathonStudent();
    setMobileMenuOpen(false);
    void navigate({ to: "/hackathon", replace: true });
  }

  async function handleProjectSubmit() {
    if (!localProfile?.email || !localProfile?.mobile) {
      setSubmissionMessage("Participant details are unavailable.");
      return;
    }

    if (!githubRepo.trim()) {
      setSubmissionMessage("Please enter your GitHub repository URL.");
      return;
    }

    if (!projectDescription.trim()) {
      setSubmissionMessage("Please enter your project description.");
      return;
    }

    if (!submissionFile) {
      setSubmissionMessage("Please upload your PPT or PDF.");
      return;
    }

    if (!videoUrl.trim()) {
      setSubmissionMessage("Please enter your Google Drive video link.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionMessage(null);

      const response = await submitHackathonProject({
        email: localProfile.email,
        phone: localProfile.mobile,
        github_repo: githubRepo.trim(),
        description: projectDescription.trim(),
        ppt: submissionFile,
        video_url: videoUrl.trim(),
      });

      setSubmissionMessage(response.message || "Project submitted successfully.");

      if (response.user) {
        setBackendUser(response.user);
      }
    } catch (error) {
      setSubmissionMessage(
        error instanceof Error ? error.message : "Unable to submit the project.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
    <div className="min-h-dvh bg-(--color-background-alt) text-foreground lg:flex">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-(--color-border) bg-white/90 px-4 backdrop-blur-md lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="student-sidebar"
          className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-(--color-background-alt)"
        >
          <Menu className="size-5" strokeWidth={1.75} />
        </button>
      </header>

      <div
        aria-hidden
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-[rgba(15,23,42,0.35)] backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        id="student-sidebar"
        aria-label="Student sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] max-w-[85vw] flex-col border-r border-(--color-border) bg-white transition-[transform,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:visible lg:translate-x-0 ${mobileMenuOpen ? "visible translate-x-0 shadow-(--shadow-large)" : "invisible -translate-x-full"}`}
      >
        <div className="flex items-center gap-2 px-4 pt-5 pb-3">
          <Brand className="flex-1" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-background-alt) hover:text-foreground lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mx-3 rounded-lg border border-(--color-border) bg-(--color-background-alt) p-3">
          <p className="text-[10.5px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
            Your team
          </p>
          <p className="mt-1 truncate text-[13.5px] font-semibold">
            {backendUser?.team_name || "Loading…"}
          </p>
          <p className="mt-0.5 text-[11.5px] text-(--color-text-muted)">
            {roleLabel} · {memberCount} member{memberCount === 1 ? "" : "s"}
          </p>
        </div>

        <nav aria-label="Student navigation" className="flex flex-1 flex-col gap-0.5 px-3 py-3">
          <p className="mb-1.5 px-2.5 text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
            Hackathon
          </p>
          {navItems.map(({ to, label, Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium ${active ? "bg-(--brand-accent-soft) text-(--brand-primary)" : "text-(--color-text-secondary) transition-colors hover:bg-(--color-background-alt) hover:text-foreground"}`}
              >
                {active ? (
                  <span
                    className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-(--brand-accent)"
                    aria-hidden
                  />
                ) : null}
                <span
                  className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors ${active ? "bg-(--brand-accent) text-white" : "bg-(--color-background-alt) text-(--color-text-secondary) group-hover:bg-(--brand-accent-soft) group-hover:text-(--brand-accent)"}`}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} />
                </span>
                {label}
              </Link>
            );
          })}
          <Link
            to="/hackathon"
            className="group mt-1 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-background-alt) hover:text-foreground"
          >
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-(--color-background-alt) group-hover:bg-(--brand-accent-soft) group-hover:text-(--brand-accent)">
              <ArrowLeft className="size-3.5" strokeWidth={1.75} />
            </span>
            Hackathon page
          </Link>
        </nav>

        <div className="border-t border-(--color-border) p-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-accent),var(--brand-primary))] text-[11px] font-semibold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{displayName}</p>
              <p
                className="truncate text-[11px] text-(--color-text-muted)"
                title={localProfile?.email}
              >
                {localProfile?.email || roleLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-0.5 inline-flex w-full items-center gap-2.5 px-2.5 py-1.5 text-[13px] font-medium text-(--color-text-secondary) transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="size-3.5" strokeWidth={1.75} /> Sign out
          </button>
        </div>
      </aside>

      <main id="main-content" className="min-w-0 flex-1 p-4 sm:p-6 lg:ml-[260px] lg:p-8">
        <div className="mx-auto max-w-6xl">
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
                    <p className="mt-0.5 truncate text-[11.5px] text-(--color-text-muted)">
                      {hint}
                    </p>
                  </div>
                ))}
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_17rem]">
                <div className="min-w-0 space-y-5">
                  {confirmedStatement && backendUser && !isLead && (
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
                            ? `${leadName} submitted your team's project.`
                            : `${leadName} submits the project for your team.`}
                        </p>
                      </div>
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

                  {confirmedStatement && isLead && (
                    <div className={`${cardClass} p-4 sm:p-5`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                            Final submission
                          </p>
                          <h2 className="mt-1 text-base font-bold sm:text-lg">
                            Submit your project
                          </h2>
                          <p className="mt-0.5 text-[12.5px] text-(--color-text-secondary)">
                            Submit the repository, presentation and demo video for your team.
                          </p>
                        </div>
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

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-semibold">
                          GitHub repository URL
                          <span className="relative mt-1 block">
                            <Code2 className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--color-text-muted)" />
                            <input
                              type="url"
                              value={githubRepo}
                              onChange={(event) => setGithubRepo(event.target.value)}
                              placeholder="https://github.com/team/project"
                              className={`${inputClass} h-9 pl-8 pr-3 font-normal`}
                            />
                          </span>
                        </label>
                        <label className="block text-xs font-semibold">
                          Demo video URL
                          <span className="relative mt-1 block">
                            <ExternalLink className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--color-text-muted)" />
                            <input
                              type="url"
                              value={videoUrl}
                              onChange={(event) => setVideoUrl(event.target.value)}
                              placeholder="https://drive.google.com/..."
                              className={`${inputClass} h-9 pl-8 pr-3 font-normal`}
                            />
                          </span>
                        </label>
                        <label className="block text-xs font-semibold sm:col-span-2">
                          Project description
                          <textarea
                            rows={4}
                            value={projectDescription}
                            onChange={(event) => setProjectDescription(event.target.value)}
                            placeholder="What your team built, the approach and key features."
                            className={`${inputClass} mt-1 resize-none px-3 py-2 font-normal leading-5`}
                          />
                        </label>
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold">Presentation (PDF, PPT or PPTX)</p>
                          <label
                            htmlFor="project-presentation"
                            className="mt-1 flex cursor-pointer items-center gap-3 border border-dashed border-(--color-border) bg-(--color-background-alt) px-3 py-3 transition hover:border-(--brand-accent)"
                          >
                            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-(--brand-accent-soft) text-(--brand-accent)">
                              {submissionFile ? (
                                <FileText className="size-4" />
                              ) : (
                                <Upload className="size-4" />
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-semibold">
                                {submissionFile ? submissionFile.name : "Upload your PPT or PDF"}
                              </span>
                              <span className="block text-[11.5px] text-(--color-text-muted)">
                                {submissionFile ? "Ready to submit" : "Click to choose a file"}
                              </span>
                            </span>
                            <input
                              id="project-presentation"
                              type="file"
                              accept=".pdf,.ppt,.pptx"
                              className="hidden"
                              onChange={(event) =>
                                setSubmissionFile(event.target.files?.[0] || null)
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-(--color-border) pt-4">
                        {submissionMessage && (
                          <p className="mr-auto text-[12.5px] font-medium text-(--color-text-secondary)">
                            {submissionMessage}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleProjectSubmit}
                          disabled={isSubmitting || !!submittedAt}
                          className="inline-flex h-9 items-center gap-2 bg-(--brand-primary) px-4 text-[13px] font-semibold text-white transition hover:bg-(--brand-primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : submittedAt
                              ? "Project submitted"
                              : "Submit project"}
                        </button>
                      </div>
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
                            <h3 className="mt-0.5 text-base font-bold">
                              {confirmedStatement.title}
                            </h3>
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
                          Confirmed by {isLead ? "you" : leadName}. A team can confirm only one
                          problem statement, so this can&apos;t be changed.
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
                          {leadName} selects and confirms your team&apos;s problem statement. It
                          will appear here once it&apos;s confirmed.
                        </p>
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
                            {statements.length} available
                          </span>
                        </div>
                        <p className="mt-2 flex items-start gap-1.5 border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-5 text-amber-800">
                          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
                          Your team can confirm only one problem statement, and it can&apos;t be
                          changed afterwards. Review it carefully before confirming.
                        </p>

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
                                onClick={() => setSelectedDomainId(domain.id)}
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

                        <div
                          key={selectedDomainId}
                          className="mt-3 divide-y divide-(--color-border) border border-(--color-border) animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none"
                        >
                          {domainStatements.length > 0 ? (
                            domainStatements.map((statement) => (
                              <Link
                                key={statement.id}
                                to="/hackathon/problems/$problemId"
                                params={{ problemId: statement.id }}
                                className="group block px-3.5 py-3 transition-colors hover:bg-(--color-background-alt)"
                              >
                                <div className="flex items-center justify-between gap-2">
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
                              </Link>
                            ))
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
                          <li
                            key={member.email || i}
                            className="flex items-center gap-2 text-[12.5px]"
                          >
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
        </div>
      </main>
    </div>
  );
}

function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-(--brand-primary) text-sm font-bold text-white">
        T
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13.5px] font-bold leading-tight text-(--brand-primary)">
          Trizen Ventures
        </span>
        <span className="block text-[11px] leading-tight text-(--color-text-muted)">
          Student dashboard
        </span>
      </span>
    </div>
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
