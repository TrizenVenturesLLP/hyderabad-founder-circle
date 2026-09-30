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
  ExternalLink,
  FileText,
  Upload,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  MapPin,
  Trophy,
  UserCircle,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import {
  getAllProblemStatements,
  getHackathonDetails,
  getSelectedProblemStatementId,
  saveSelectedProblemStatementId,
  subscribeToHackathonData,
  getHackathonStudentProfile,
  logoutHackathonStudent,
} from "@/lib/hackathon-storage";
import {
  getHackathonUserDetails,
  getHackathonReleaseTimer as getServerReleaseTimer,
  getHackathonProblemStatements,
  submitHackathonProject,
} from "@/lib/hackathon-api";
import type { HackathonDetails, ProblemStatement } from "@/lib/hackathon";

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
function DashboardPage() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const [releaseAt, setReleaseAt] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [details, setDetails] = useState<HackathonDetails>(getHackathonDetails());
  const [statements, setStatements] = useState<ProblemStatement[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string>("ui-ux");
  const [confirmedStatementId, setConfirmedStatementId] = useState<string | null>(
    getSelectedProblemStatementId(),
  );

  const [backendUser, setBackendUser] = useState<any>(null);
  const [localProfile, setLocalProfile] = useState<any>(null);
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

            if (res.user.problem_statement_id) {
              setConfirmedStatementId(res.user.problem_statement_id);
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
    () => statements.filter((statement) => statement.domainId === selectedDomainId),
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
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#e4e6ef] bg-white lg:flex lg:flex-col">
        {/* Logo / Brand */}
        <div className="flex h-24 items-center border-b border-[#e4e6ef] px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#30286f] text-lg font-bold text-white">
              T
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-[#25205c]">Trizen Ventures</p>

              <p className="mt-0.5 text-xs text-[#7c82a1]">Student dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 px-4 py-7">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9aa0b5]">
            Hackathon
          </p>

          <div className="mt-3 space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold ${
                pathname === "/dashboard"
                  ? "bg-[#25205c] text-white"
                  : "text-[#59617a] hover:bg-[#f1f2f8]"
              }`}
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </div>

          <p className="mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9aa0b5]">
            Account
          </p>

          <div className="mt-3 space-y-1">
            <Link
              to="/dashboard/team"
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold ${
                pathname === "/dashboard/team"
                  ? "bg-[#25205c] text-white"
                  : "text-[#59617a] hover:bg-[#f1f2f8]"
              }`}
            >
              <Users className="size-4" />
              My Team
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="shrink-0 border-t border-[#e4e6ef] p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eeeeff] text-sm font-bold text-[#4f46e5]">
              {(localProfile?.name || backendUser?.lead_name)?.charAt(0).toUpperCase() || "A"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#25205c]">
                {localProfile?.name || backendUser?.lead_name || "Participant"}
              </p>

              <p className="text-xs text-[#7c82a1]">
                {backendUser?.email?.toLowerCase() === localProfile?.email?.toLowerCase()
                  ? "Team Lead"
                  : "Team Member"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-[#e4e6ef] bg-white">
            <div className="flex h-20 items-center justify-between border-b border-[#e4e6ef] px-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#30286f] text-lg font-bold text-white">
                  T
                </div>
                <div>
                  <p className="text-sm font-bold text-[#25205c]">Trizen Ventures</p>
                  <p className="text-xs text-[#7c82a1]">Student dashboard</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-lg text-[#59617a]"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="min-h-0 flex-1 px-4 py-6">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9aa0b5]">
                Hackathon
              </p>
              <div className="mt-3">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold ${
                    pathname === "/dashboard"
                      ? "bg-[#25205c] text-white"
                      : "text-[#59617a] hover:bg-[#f1f2f8]"
                  }`}
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
              </div>

              <p className="mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9aa0b5]">
                Account
              </p>
              <div className="mt-3">
                <Link
                  to="/dashboard/team"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold ${
                    pathname === "/dashboard/team"
                      ? "bg-[#25205c] text-white"
                      : "text-[#59617a] hover:bg-[#f1f2f8]"
                  }`}
                >
                  <Users className="size-4" />
                  My Team
                </Link>
              </div>
            </nav>

            <div className="shrink-0 border-t border-[#e4e6ef] p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eeeeff] text-sm font-bold text-[#4f46e5]">
                  {(localProfile?.name || backendUser?.lead_name)?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#25205c]">
                    {localProfile?.name || backendUser?.lead_name || "Participant"}
                  </p>
                  <p className="text-xs text-[#7c82a1]">
                    {backendUser?.email?.toLowerCase() === localProfile?.email?.toLowerCase()
                      ? "Team Lead"
                      : "Team Member"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Application Area */}
      <div className="min-h-screen lg:ml-64">
        {/* Top Header */}
        <header className="border-b border-[#e4e6ef] bg-white">
          <div className="flex min-h-19.5 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
              className="mr-3 inline-flex size-10 items-center justify-center rounded-lg border border-[#e4e6ef] text-[#25205c] lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#7c82a1]">Trizen Ventures</p>

              <h1 className="mt-1 text-xl font-bold text-[#151934]">Student Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-[#25205c]">
                  {localProfile?.name || backendUser?.lead_name || "Participant"}
                </p>

                <p className="text-xs text-[#7c82a1]">
                  {backendUser?.email?.toLowerCase() === localProfile?.email?.toLowerCase()
                    ? "Team Lead"
                    : "Team Member"}
                </p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-full bg-[#eeeeff] font-bold text-[#4f46e5]">
                {(localProfile?.name || backendUser?.lead_name)?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {pathname === "/dashboard" ? (
          <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {/* Welcome */}
            <section>
              <p className="text-sm font-medium text-[#5b52e8]">Welcome back 👋</p>

              <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#151934]">
                Your Hackathon Dashboard
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#707792]">
                Keep track of your Hackathon participation, team details, and selected problem
                statement.
              </p>
            </section>

            {/* Status Cards */}
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Registration */}
              <div className="rounded-xl border border-[#e1e3eb] bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7c82a1]">
                    Registration
                  </p>

                  <CheckCircle2 className="size-5 text-[#5b52e8]" />
                </div>

                <p className="mt-4 text-xl font-bold text-[#151934]">Registered</p>

                <p className="mt-1 text-xs text-[#7c82a1]">Participation confirmed</p>
              </div>

              {/* Team */}
              <div className="rounded-xl border border-[#e1e3eb] bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7c82a1]">
                    Team
                  </p>

                  <Users className="size-5 text-[#5b52e8]" />
                </div>

                <p className="mt-4 text-xl font-bold text-[#151934]">
                  {backendUser?.team_name || "Your Team"}
                </p>

                <p className="mt-1 text-xs text-[#7c82a1]">
                  {backendUser
                    ? `${backendUser.members?.length || 1} team members`
                    : "Team details unavailable"}
                </p>
              </div>

              {/* Countdown */}
              <div className="rounded-xl border border-[#e1e3eb] bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7c82a1]">
                    Countdown
                  </p>

                  <Clock3 className="size-5 text-[#5b52e8]" />
                </div>

                <p className="mt-4 font-mono text-xl font-bold text-[#151934]">
                  {isReleased ? "Released" : countdown}
                </p>

                <p className="mt-1 text-xs text-[#7c82a1]">
                  {isReleased
                    ? "Problem statements are available"
                    : "Until problem statements release"}
                </p>
              </div>

              {/* Prize Pool */}
              <div className="rounded-xl border border-[#e1e3eb] bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7c82a1]">
                    Prize Pool
                  </p>

                  <Trophy className="size-5 text-[#5b52e8]" />
                </div>

                <p className="mt-4 text-xl font-bold text-[#151934]">₹2,00,000</p>

                <p className="mt-1 text-xs text-[#7c82a1]">Total prize pool</p>
              </div>
            </section>

            {/* Project Submission */}
            {confirmedStatement && (
              <section className="mt-8">
                <div className="rounded-xl border border-[#e1e3eb] bg-white p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#5b52e8]">
                        Final Submission
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-[#151934]">
                        Submit Your Project
                      </h3>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#707792]">
                        Team Leads can submit the final project details, presentation, and demo
                        video from here.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-[#e1e3eb] bg-[#f7f8fc] px-3 py-1.5 text-xs font-semibold text-[#707792]">
                      <Clock3 className="size-3.5" />
                      Not Submitted
                    </div>
                  </div>

                  <div className="mt-7 grid gap-5">
                    {/* GitHub Repository */}
                    <div>
                      <label
                        htmlFor="github-repository"
                        className="text-sm font-semibold text-[#151934]"
                      >
                        GitHub Repository URL
                      </label>

                      <div className="relative mt-2">
                        <Code2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9aa0b5]" />

                        <input
                          id="github-repository"
                          type="url"
                          value={githubRepo}
                          onChange={(event) => setGithubRepo(event.target.value)}
                          placeholder="https://github.com/team/project"
                          className="w-full rounded-lg border border-[#e1e3eb] bg-white py-3 pl-10 pr-4 text-sm text-[#151934] outline-none transition placeholder:text-[#a3a8bb] focus:border-[#5b52e8] focus:ring-2 focus:ring-[#5b52e8]/10"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="project-description"
                        className="text-sm font-semibold text-[#151934]"
                      >
                        Project Description
                      </label>

                      <textarea
                        id="project-description"
                        rows={5}
                        value={projectDescription}
                        onChange={(event) => setProjectDescription(event.target.value)}
                        placeholder="Briefly describe what your team built, the approach you used, and the key features."
                        className="mt-2 w-full resize-none rounded-lg border border-[#e1e3eb] bg-white px-4 py-3 text-sm leading-6 text-[#151934] outline-none transition placeholder:text-[#a3a8bb] focus:border-[#5b52e8] focus:ring-2 focus:ring-[#5b52e8]/10"
                      />
                    </div>

                    {/* PPT / PDF */}
                    <div>
                      <label className="text-sm font-semibold text-[#151934]">
                        PPT / Presentation
                      </label>

                      <label
                        htmlFor="project-presentation"
                        className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#cfd2df] bg-[#fbfbfd] px-6 py-8 text-center transition hover:border-[#5b52e8] hover:bg-[#f7f6ff]"
                      >
                        <div className="flex size-12 items-center justify-center rounded-full bg-[#eeeeff]">
                          {submissionFile ? (
                            <FileText className="size-5 text-[#5b52e8]" />
                          ) : (
                            <Upload className="size-5 text-[#5b52e8]" />
                          )}
                        </div>

                        {submissionFile ? (
                          <>
                            <p className="mt-3 text-sm font-semibold text-[#151934]">
                              {submissionFile.name}
                            </p>
                            <p className="mt-1 text-xs text-[#7c82a1]">
                              File selected and ready for submission
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="mt-3 text-sm font-semibold text-[#151934]">
                              Upload your PPT or PDF
                            </p>
                            <p className="mt-1 text-xs text-[#7c82a1]">PDF, PPT, or PPTX</p>
                          </>
                        )}

                        <input
                          id="project-presentation"
                          type="file"
                          accept=".pdf,.ppt,.pptx"
                          className="hidden"
                          onChange={(event) => setSubmissionFile(event.target.files?.[0] || null)}
                        />
                      </label>
                    </div>

                    {/* Demo Video */}
                    <div>
                      <label htmlFor="demo-video" className="text-sm font-semibold text-[#151934]">
                        Recorded Demo Video URL
                      </label>

                      <div className="relative mt-2">
                        <ExternalLink className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9aa0b5]" />

                        <input
                          id="demo-video"
                          type="url"
                          value={videoUrl}
                          onChange={(event) => setVideoUrl(event.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="w-full rounded-lg border border-[#e1e3eb] bg-white py-3 pl-10 pr-4 text-sm text-[#151934] outline-none transition placeholder:text-[#a3a8bb] focus:border-[#5b52e8] focus:ring-2 focus:ring-[#5b52e8]/10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center justify-end gap-3 border-t border-[#e4e6ef] pt-6">
                    {submissionMessage && (
                      <div className="mr-auto inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                        <span className="flex size-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                          ✓
                        </span>
                        {submissionMessage}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleProjectSubmit}
                      disabled={isSubmitting || !!backendUser?.submission?.submitted_at}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#25205c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#30286f] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : backendUser?.submission?.submitted_at
                          ? "Project Submitted"
                          : "Submit Project"}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Main Content */}
            <section
              id="challenge-selection"
              className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]"
            >
              {/* Problem Statement */}
              <div className="rounded-xl border border-[#e1e3eb] bg-white p-6 sm:p-8">
                {!isReleased ? (
                  <div className="flex min-h-64 flex-col items-center justify-center text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-[#eeeeff]">
                      <LockKeyhole className="size-7 text-[#5b52e8]" />
                    </div>

                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#5b52e8]">
                      Problem statements locked
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-[#151934]">
                      Challenges will be released soon
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-[#707792]">
                      Your challenge details will appear here when the release timer reaches zero.
                    </p>
                  </div>
                ) : (
                  <>
                    {confirmedStatement && (
                      <div className="mb-8 border-2 border-[#5b52e8] bg-[#f7f6ff] p-6 sm:p-8">
                        <div className="flex items-center gap-2 text-[#5b52e8]">
                          <CheckCircle2 className="size-5" />

                          <span className="text-sm font-bold uppercase tracking-wider">
                            Confirmed Challenge
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-sm font-bold text-[#5b52e8]">
                            {confirmedStatement.id}
                          </span>

                          <span className="border border-[#e1e3eb] bg-white px-2 py-1 text-[11px] font-semibold text-[#707792]">
                            {confirmedStatement.difficulty}
                          </span>
                        </div>

                        <h3 className="mt-2 text-2xl font-bold text-[#151934]">
                          {confirmedStatement.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#707792]">
                          {confirmedStatement.description}
                        </p>

                        <div className="mt-6 border-t border-[#dddafa] pt-4">
                          <Link
                            to="/hackathon/problems/$problemId"
                            params={{
                              problemId: confirmedStatement.id,
                            }}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5b52e8] hover:underline"
                          >
                            View full details
                            <ArrowRight className="size-4" />
                          </Link>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#5b52e8]">
                          {confirmedStatement
                            ? "Other Problem Statements"
                            : "Released Problem Statements"}
                        </p>

                        <h3 className="mt-2 text-2xl font-bold text-[#151934]">
                          {confirmedStatement ? "Explore more challenges" : "Choose your challenge"}
                        </h3>
                      </div>

                      <span className="border border-[#dddafa] bg-[#f1f0ff] px-2.5 py-1 text-xs font-semibold text-[#5b52e8]">
                        {statements.length} available
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {details.domains.map((domain) => (
                        <button
                          key={domain.id}
                          type="button"
                          onClick={() => setSelectedDomainId(domain.id)}
                          className={`rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                            selectedDomainId === domain.id
                              ? "border-[#5b52e8] bg-[#f1f0ff] text-[#5b52e8]"
                              : "border-[#e1e3eb] bg-white text-[#707792] hover:bg-[#f7f8fc]"
                          }`}
                        >
                          {domain.shortName}
                        </button>
                      ))}
                    </div>

                    {activeDomain && (
                      <p className="mt-5 text-sm leading-6 text-[#707792]">
                        {activeDomain.description}
                      </p>
                    )}

                    <div className="mt-5 space-y-3">
                      {domainStatements.length > 0 ? (
                        domainStatements.map((statement) => (
                          <Link
                            key={statement.id}
                            to="/hackathon/problems/$problemId"
                            params={{
                              problemId: statement.id,
                            }}
                            className="block w-full rounded-xl border border-[#e1e3eb] bg-[#fbfbfd] p-4 text-left transition-colors hover:border-[#c9c5f4] hover:bg-[#f7f6ff]"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-[#5b52e8]">
                                {statement.id}
                              </span>

                              <span className="bg-[#eef0f5] px-2 py-1 text-[11px] font-semibold text-[#707792]">
                                {statement.difficulty}
                              </span>
                            </div>

                            <p className="mt-2 font-semibold text-[#151934]">{statement.title}</p>

                            <p className="mt-1 text-xs leading-5 text-[#707792]">
                              {statement.description}
                            </p>
                          </Link>
                        ))
                      ) : (
                        <p className="rounded-xl border border-dashed border-[#d9dce7] p-5 text-sm text-[#707792]">
                          No problem statements are available in this domain yet.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Hackathon Information */}
              <aside className="h-fit rounded-xl border border-[#e1e3eb] bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5b52e8]">
                  Hackathon Information
                </p>

                <div className="mt-5 space-y-5">
                  {/* Duration */}
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#5b52e8]" />

                    <div>
                      <p className="text-sm font-semibold text-[#151934]">24 Hours</p>

                      <p className="text-xs text-[#7c82a1]">Hackathon duration</p>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-[#5b52e8]" />

                    <div>
                      <p className="text-sm font-semibold text-[#151934]">
                        MR Deemed to be University
                      </p>

                      <p className="text-xs text-[#7c82a1]">Hyderabad, Telangana</p>
                    </div>
                  </div>

                  {/* Team */}
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 size-5 shrink-0 text-[#5b52e8]" />

                    <div>
                      <p className="text-sm font-semibold text-[#151934]">
                        {backendUser?.team_name || "Your Team"}
                      </p>

                      <p className="text-xs text-[#7c82a1]">
                        Team Lead: {backendUser?.lead_name || localProfile?.name || "Loading..."}
                      </p>

                      {backendUser?.members?.length > 0 && (
                        <div className="mt-3 text-xs text-[#707792]">
                          <p className="mb-1 font-semibold text-[#151934]">All Members:</p>

                          <ul className="list-inside list-disc space-y-1">
                            {backendUser.members.map((member: any, i: number) => (
                              <li key={i}>{member.full_name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            </section>
          </main>
        ) : (
          <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
}
