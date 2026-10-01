import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ClipboardCopy,
  Clock3,
  Layers,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import {
  areProblemStatementsReleased,
  getAllProblemStatements,
  getHackathonDetails,
  getHackathonStudentProfile,
  getSelectedProblemStatementId,
  logoutHackathonStudent,
  saveSelectedProblemStatementId,
} from "@/lib/hackathon-storage";

import { confirmHackathonProblem, getHackathonProblemStatements } from "@/lib/hackathon-api";

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

    const data = await getHackathonProblemStatements();

    const statement = data.statements?.find(
      (item: any) => item.id.toLowerCase() === params.problemId.toLowerCase(),
    );

    if (!statement) {
      throw notFound();
    }

    const domain = getHackathonDetails().domains.find((item) => item.id === statement.domainId);

    return {
      statement,
      domainName: domain?.name || statement.domainId,
      details: getHackathonDetails(),
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

function ProblemStatementDetailsPage() {
  const { statement, domainName, details } = Route.useLoaderData();

  const profile = getHackathonStudentProfile();

  const [copied, setCopied] = useState(false);

  const [confirmed, setConfirmed] = useState(getSelectedProblemStatementId() === statement.id);

  const [isConfirming, setIsConfirming] = useState(false);

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

    setIsConfirming(true);

    try {
      await confirmHackathonProblem({
        email: profile.email,
        phone: profile.mobile,
        problem_statement_id: statement.id,
      });

      saveSelectedProblemStatementId(statement.id);

      setConfirmed(true);

      toast.success(`${statement.id} confirmed as your problem statement`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm statement");
    } finally {
      setIsConfirming(false);
    }
  }

  const userName = profile?.name || "Student";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* Student Dashboard Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#e5e7ef] bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="border-b border-[#e5e7ef] px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#302b6f] text-lg font-bold text-white">
                T
              </div>

              <div>
                <p className="text-sm font-bold text-[#151934]">Trizen Ventures</p>

                <p className="text-xs text-[#7c82a1]">Student dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#9ba1b8]">
              Hackathon
            </p>

            <div className="mt-3">
              <Link
                to="/dashboard"
                hash="challenge-selection"
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#59617a] transition hover:bg-[#f1f2f8]"
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            </div>

            <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-[#9ba1b8]">
              Account
            </p>

            <div className="mt-3">
              <Link
                to="/dashboard/team"
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#59617a] transition hover:bg-[#f1f2f8]"
              >
                <Users className="size-4" />
                My Team
              </Link>
            </div>
          </div>

          {/* User */}
          <div className="border-t border-[#e5e7ef] p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#eeedff] text-sm font-semibold text-[#5b52e8]">
                {userInitial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#151934]">{userName}</p>

                <p className="text-xs text-[#7c82a1]">Team Lead</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logoutHackathonStudent();
                window.location.replace("/hackathon");
              }}
              className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="border-b border-[#e5e7ef] bg-white">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div>
              <p className="text-sm font-medium text-[#7c82a1]">Trizen Ventures</p>

              <h1 className="text-xl font-bold text-[#151934]">Problem Statement</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-[#151934]">{userName}</p>

                <p className="text-xs text-[#7c82a1]">Team Lead</p>
              </div>

              <div className="flex size-10 items-center justify-center rounded-full bg-[#eeedff] font-semibold text-[#5b52e8]">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Back */}
            <Link
              to="/dashboard"
              hash="challenge-selection"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#5b52e8] transition hover:opacity-80"
            >
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Link>

            {/* Page heading */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5b52e8]">
                Challenge Details
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#151934]">
                Review & Confirm Problem Statement
              </h2>

              <p className="mt-2 text-sm text-[#7c82a1]">
                Review the challenge carefully before confirming it for your team.
              </p>
            </div>

            {/* Main grid */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              {/* Problem */}
              <section className="rounded-2xl border border-[#e2e3f0] bg-white shadow-sm">
                <div className="p-6 sm:p-8">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-[#eeedff] px-3 py-1.5 font-mono text-xs font-bold text-[#5b52e8]">
                      {statement.id}
                    </span>

                    <span className="rounded-lg bg-[#f1f2f8] px-3 py-1.5 text-xs font-semibold text-[#59617a]">
                      {statement.difficulty}
                    </span>

                    {statement.category && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f1f2f8] px-3 py-1.5 text-xs font-medium text-[#59617a]">
                        <Layers className="size-3.5" />
                        {statement.category}
                      </span>
                    )}
                  </div>

                  {/* Domain */}
                  <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#5b52e8]">
                    {domainName}
                  </p>

                  {/* Title */}
                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-[#151934]">
                    {statement.title}
                  </h3>

                  {(statement.industry || statement.platform) && (
                    <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-[#e5e7ef] bg-[#f8f8fc] px-4 py-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#7c82a1]">
                          Industry
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-[#151934]">
                          {statement.industry || "Not specified"}
                        </dd>
                      </div>
                      <div className="rounded-lg border border-[#e5e7ef] bg-[#f8f8fc] px-4 py-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#7c82a1]">
                          Platform / Tech
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-[#151934]">
                          {statement.platform || "Not specified"}
                        </dd>
                      </div>
                    </dl>
                  )}

                  {statement.scope && (
                    <div className="mt-8 border-t border-[#e5e7ef] pt-6">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[#151934]">
                        Scope
                      </h4>

                      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#59617a]">
                        {statement.scope}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mt-8 border-t border-[#e5e7ef] pt-6">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[#151934]">
                      Description
                    </h4>

                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#59617a]">
                      {statement.description}
                    </p>
                  </div>

                  {/* Deliverables */}
                  {statement.deliverables && statement.deliverables.length > 0 && (
                    <div className="mt-8 border-t border-[#e5e7ef] pt-6">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[#151934]">
                        Key Deliverables & Objectives
                      </h4>

                      <ul className="mt-4 space-y-3">
                        {statement.deliverables.map((item: any) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-sm leading-6 text-[#59617a]"
                          >
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#5b52e8]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Confirmation */}
                  <div className="mt-8 rounded-xl border border-[#e5e7ef] bg-[#f8f8fc] p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                          confirmed
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-[#eeedff] text-[#5b52e8]"
                        }`}
                      >
                        {confirmed ? (
                          <Check className="size-5" />
                        ) : (
                          <ShieldCheck className="size-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#151934]">
                          {confirmed
                            ? "Problem Statement Confirmed"
                            : "Confirm this problem statement"}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#7c82a1]">
                          {confirmed
                            ? "This problem statement has been selected for your team."
                            : "Once confirmed, this problem statement will be assigned to your team."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleConfirmStatement()}
                        disabled={confirmed || isConfirming}
                        className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                          confirmed
                            ? "cursor-default bg-emerald-600 text-white"
                            : "bg-[#5b52e8] text-white hover:bg-[#4e46d6]"
                        } disabled:opacity-90`}
                      >
                        <Check className="size-4" />

                        {isConfirming
                          ? "Confirming..."
                          : confirmed
                            ? "Confirmed"
                            : "Confirm Problem Statement"}
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyReference}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#dfe1eb] bg-white px-5 py-2.5 text-sm font-semibold text-[#59617a] transition hover:bg-[#f1f2f8]"
                      >
                        {copied ? (
                          <Check className="size-4" />
                        ) : (
                          <ClipboardCopy className="size-4" />
                        )}

                        {copied ? "Copied" : "Copy Reference"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Right side */}
              <aside className="space-y-5">
                {/* Competition details */}
                <div className="rounded-2xl border border-[#e2e3f0] bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#5b52e8]">
                    Competition Details
                  </p>

                  <div className="mt-5 space-y-5">
                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 size-5 shrink-0 text-[#5b52e8]" />

                      <div>
                        <p className="text-sm font-semibold text-[#151934]">
                          {details.venue.dateLabel}
                        </p>

                        <p className="mt-0.5 text-xs text-[#7c82a1]">Hackathon dates</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 size-5 shrink-0 text-[#5b52e8]" />

                      <div>
                        <p className="text-sm font-semibold text-[#151934]">
                          {details.durationBadge}
                        </p>

                        <p className="mt-0.5 text-xs text-[#7c82a1]">
                          {details.venue.format} event
                        </p>
                      </div>
                    </div>

                    {/* Team size */}
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 size-5 shrink-0 text-[#5b52e8]" />

                      <div>
                        <p className="text-sm font-semibold text-[#151934]">
                          {details.venue.teamSize}
                        </p>

                        <p className="mt-0.5 text-xs text-[#7c82a1]">Eligible team size</p>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-start gap-3">
                      <Target className="mt-0.5 size-5 shrink-0 text-[#5b52e8]" />

                      <div>
                        <p className="text-sm font-semibold text-[#151934]">{details.venue.name}</p>

                        <p className="mt-0.5 text-xs text-[#7c82a1]">{details.venue.area}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Problem */}
                <div className="rounded-2xl border border-[#e2e3f0] bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#eeedff] text-[#5b52e8]">
                      {confirmed ? <Check className="size-5" /> : <Target className="size-5" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#5b52e8]">
                        Selected Problem
                      </p>

                      <p className="mt-2 font-mono text-xs font-bold text-[#59617a]">
                        {statement.id}
                      </p>

                      <p className="mt-1 text-sm font-semibold leading-5 text-[#151934]">
                        {statement.title}
                      </p>

                      <div className="mt-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            confirmed
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-[#f1f2f8] text-[#7c82a1]"
                          }`}
                        >
                          {confirmed && <Check className="size-3" />}
                          {confirmed ? "Confirmed" : "Not confirmed"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
