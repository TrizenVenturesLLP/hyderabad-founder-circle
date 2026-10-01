import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileText,
  MapPin,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import posterImage from "@/assets/poster.jpg";
import { JuryPageHeader } from "@/components/jury/JuryPageHeader";
import { JuryBadge, JuryTable, JuryTableMessage } from "@/components/jury/JuryTable";
import { getHackathonDetails } from "@/lib/hackathon-storage";
import { getJuryHackathon, type JuryCriterion, type JuryHackathon } from "@/lib/jury-api";

export const Route = createFileRoute("/jury/hackathons/$hackathonId/overview")({
  component: JuryHackathonOverviewPage,
});

type HackathonDetails = JuryHackathon & { rubric: JuryCriterion[] };

const statusTones: Record<string, "green" | "amber" | "blue" | "gray"> = {
  active: "green",
  live: "green",
  open: "green",
  upcoming: "blue",
  draft: "amber",
  completed: "gray",
  closed: "gray",
};

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
}

function StatCard({
  icon,
  label,
  value,
  to,
  hackathonId,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  to?: "/jury/hackathons/$hackathonId/teams" | "/jury/hackathons/$hackathonId/problem-statements";
  hackathonId: string;
}) {
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--brand-accent-soft) text-(--brand-accent)">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-(family-name:--font-brand) text-2xl font-semibold tabular-nums">
          {value}
        </span>
        <span className="block truncate text-xs text-(--color-text-secondary)">{label}</span>
      </span>
    </>
  );
  const className =
    "flex items-center gap-3 rounded-2xl border border-(--color-border) bg-white p-4 shadow-(--shadow-small)";
  return to ? (
    <Link
      to={to}
      params={{ hackathonId }}
      className={`${className} transition-colors hover:border-(--brand-accent)/40`}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr className="align-top">
      <th
        scope="row"
        className="w-40 bg-(--color-background-alt) px-4 py-3 text-left text-[11px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase"
      >
        {label}
      </th>
      <td className="px-4 py-3 text-sm">{children}</td>
    </tr>
  );
}

function JuryHackathonOverviewPage() {
  const { hackathonId } = Route.useParams();
  const [hackathon, setHackathon] = useState<HackathonDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getJuryHackathon(hackathonId)
      .then((data) => {
        if (active) setHackathon(data.hackathon);
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : "Could not load Hackathon details.");
      });
    return () => {
      active = false;
    };
  }, [hackathonId]);

  const eventDetails = getHackathonDetails();
  const event = hackathon?.slug === eventDetails.id ? eventDetails : null;
  const rubric = (hackathon?.rubric || [])
    .filter((criterion) => criterion.active)
    .sort((left, right) => left.order - right.order);
  const rubricTotal = rubric.reduce((sum, criterion) => sum + criterion.maxMarks, 0);
  const start = formatDate(hackathon?.startDate ?? null);
  const end = formatDate(hackathon?.endDate ?? null);

  return (
    <section>
      <JuryPageHeader
        title={hackathon?.name || "Hackathon"}
        description="Event details, your evaluation progress and the scoring rubric."
        actions={
          hackathon ? (
            <JuryBadge tone={statusTones[hackathon.status?.toLowerCase()] || "gray"}>
              <span className="capitalize">{hackathon.status || "Unknown"}</span>
            </JuryBadge>
          ) : null
        }
      />

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      {!hackathon && !error ? (
        <p className="py-8 text-sm text-(--color-text-secondary)">Loading Hackathon details…</p>
      ) : null}

      {hackathon ? (
        <>
          {event ? (
            <div className="mt-5 grid gap-6 overflow-hidden rounded-3xl border border-(--color-border) bg-white p-5 shadow-(--shadow-card) sm:p-6 md:grid-cols-[200px_minmax(0,1fr)]">
              <div className="relative hidden md:block">
                <img
                  src={posterImage}
                  alt={`${event.title} poster`}
                  className="aspect-[2/3] w-full rounded-2xl bg-(--brand-primary) object-contain shadow-(--shadow-small)"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                  {event.university}
                </p>
                <p className="mt-0.5 text-xs text-(--color-text-muted)">
                  {event.school} · {event.department}
                </p>
                <p className="mt-3 bg-[linear-gradient(90deg,var(--brand-accent),var(--brand-primary))] bg-clip-text font-(family-name:--font-brand) text-lg font-semibold text-transparent">
                  {event.tagline}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-(--color-text-secondary)">
                  {event.blurb}
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                  {[
                    { label: "Prize pool", value: event.prizePool, Icon: Trophy },
                    { label: "Duration", value: event.durationBadge, Icon: Clock3 },
                    { label: "Dates", value: event.venue.dateLabel, Icon: CalendarDays },
                    { label: "Venue", value: event.venue.name, Icon: MapPin },
                    { label: "Team size", value: event.venue.teamSize, Icon: Users },
                    { label: "Entry", value: event.feeInfo, Icon: Ticket },
                  ].map(({ label, value, Icon }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-(--color-border) bg-(--color-background-alt)/60 p-3"
                    >
                      <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase">
                        <Icon className="size-3.5 text-(--brand-accent)" />
                        {label}
                      </dt>
                      <dd className="mt-1 text-sm leading-snug font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[11px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase">
                    Tracks
                  </span>
                  {event.domains.map((domain) => (
                    <span
                      key={domain.id}
                      className="rounded-full bg-(--brand-accent-soft) px-3 py-1 text-xs font-semibold text-(--brand-accent)"
                    >
                      {domain.shortName}
                    </span>
                  ))}
                  <a
                    href="/hackathon"
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-(--brand-accent) hover:underline"
                  >
                    Public event page <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Users className="size-5" />}
              label="Registered teams"
              value={hackathon.teamCount}
              to="/jury/hackathons/$hackathonId/teams"
              hackathonId={hackathonId}
            />
            <StatCard
              icon={<FileText className="size-5" />}
              label="Live problem statements"
              value={hackathon.statementCount}
              to="/jury/hackathons/$hackathonId/problem-statements"
              hackathonId={hackathonId}
            />
            <StatCard
              icon={<CheckCircle2 className="size-5" />}
              label="Evaluated by you"
              value={hackathon.evaluatedCount}
              hackathonId={hackathonId}
            />
            <StatCard
              icon={<ClipboardList className="size-5" />}
              label="Pending evaluations"
              value={hackathon.pendingEvaluations}
              to="/jury/hackathons/$hackathonId/teams"
              hackathonId={hackathonId}
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-(--color-border) bg-white shadow-(--shadow-small)">
            <table className="w-full">
              <tbody className="divide-y divide-(--color-border)">
                <DetailRow label="Schedule">
                  {start || end ? (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="size-4 text-(--color-text-muted)" />
                      {start || "TBA"} – {end || "TBA"}
                    </span>
                  ) : event ? (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="size-4 text-(--color-text-muted)" />
                      {event.venue.dateLabel}
                      {event.venue.time ? ` · ${event.venue.time}` : ""}
                    </span>
                  ) : (
                    <span className="text-(--color-text-muted)">Dates not announced</span>
                  )}
                </DetailRow>
                {hackathon.description || !event ? (
                  <DetailRow label="About">
                    <p className="leading-relaxed whitespace-pre-wrap text-(--color-text-secondary)">
                      {hackathon.description || "No description provided."}
                    </p>
                  </DetailRow>
                ) : null}
                <DetailRow label="Your progress">
                  <div className="max-w-sm">
                    <p className="text-sm">
                      <span className="font-semibold tabular-nums">{hackathon.evaluatedCount}</span>{" "}
                      of <span className="tabular-nums">{hackathon.teamCount}</span> teams evaluated
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--color-background-alt)">
                      <div
                        className="h-full rounded-full bg-(--brand-accent)"
                        style={{
                          width: `${hackathon.teamCount ? Math.min(100, (hackathon.evaluatedCount / hackathon.teamCount) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </DetailRow>
              </tbody>
            </table>
          </div>

          <h2 className="mt-8 font-(family-name:--font-brand) text-lg font-semibold">
            Scoring rubric
          </h2>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            Every team is scored out of 100 using these criteria.
          </p>
          <JuryTable
            minWidth={560}
            columns={[
              { label: "#", className: "w-12" },
              { label: "Criterion" },
              { label: "Description" },
              { label: "Max marks", className: "text-right" },
            ]}
          >
            {!rubric.length ? (
              <JuryTableMessage colSpan={4}>
                The rubric has not been configured yet.
              </JuryTableMessage>
            ) : (
              <>
                {rubric.map((criterion, index) => (
                  <tr key={criterion.id}>
                    <td className="px-4 py-3 text-xs font-semibold text-(--color-text-muted) tabular-nums">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">{criterion.name}</td>
                    <td className="px-4 py-3 text-xs text-(--color-text-secondary)">
                      {criterion.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {criterion.maxMarks}
                    </td>
                  </tr>
                ))}
                <tr className="bg-(--color-background-alt)">
                  <td />
                  <td className="px-4 py-3 text-xs font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase">
                    Total
                  </td>
                  <td />
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{rubricTotal}</td>
                </tr>
              </>
            )}
          </JuryTable>
        </>
      ) : null}
    </section>
  );
}
