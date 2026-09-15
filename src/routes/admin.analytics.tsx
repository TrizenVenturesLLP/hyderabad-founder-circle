import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { fetchAdminAnalytics, type AdminAnalyticsSummary } from "@/lib/admin-api";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/AdminPageChrome";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalyticsPage,
  head: () => ({
    meta: [{ title: "Analytics — Admin" }],
  }),
});

const DAY_OPTIONS = [7, 14, 30] as const;

function AdminAnalyticsPage() {
  const [days, setDays] = useState<(typeof DAY_OPTIONS)[number]>(7);
  const [data, setData] = useState<AdminAnalyticsSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    void fetchAdminAnalytics(days)
      .then((summary) => {
        if (!cancelled) setData(summary);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load analytics.",
          );
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const openSessions =
    data?.funnel.find((f) => f.name === "rsvp_open")?.sessions || 0;
  const successSessions =
    data?.funnel.find((f) => f.name === "rsvp_success")?.sessions || 0;
  const conversion =
    openSessions > 0
      ? Math.round((successSessions / openSessions) * 100)
      : 0;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-5 md:p-6 lg:p-8">
      <AdminPageHeader
        title="Analytics"
        description="Traffic and booking drop-off"
        actions={
          <div className="inline-flex border border-[var(--color-border)] bg-white p-0.5">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-medium tabular-nums transition-colors",
                  days === d
                    ? "bg-[var(--brand-accent)] text-white"
                    : "text-[var(--color-text-secondary)] hover:text-foreground",
                )}
              >
                {d}d
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <p className="mt-6 text-[13px] text-[var(--color-text-muted)]">
          Loading…
        </p>
      ) : error ? (
        <p className="mt-6 text-[13px] text-red-600">{error}</p>
      ) : data ? (
        <div className="mt-5 space-y-4 pb-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCell
              label="Page views"
              value={data.visitors.pageviews.toLocaleString("en-IN")}
            />
            <StatCell
              label="Unique visitors"
              value={data.visitors.uniqueSessions.toLocaleString("en-IN")}
            />
            <StatCell
              label="Registrations started"
              value={openSessions.toLocaleString("en-IN")}
            />
            <StatCell
              label="Booking conversion"
              value={`${conversion}%`}
              hint={
                openSessions
                  ? `${successSessions} of ${openSessions} finished`
                  : "No starts yet"
              }
            />
          </div>

          <AdminPanel>
            <div className="border-b border-[var(--color-border)] px-4 py-3">
              <h2 className="text-[13px] font-semibold text-foreground">
                Booking funnel
              </h2>
              <p className="mt-0.5 text-[12px] text-[var(--color-text-muted)]">
                Sessions that reached each step
              </p>
            </div>
            <ul className="divide-y divide-[var(--color-border)]">
              {data.funnel.map((step, index) => {
                const prev =
                  index === 0
                    ? Math.max(step.sessions, 1)
                    : data.funnel[index - 1]?.sessions || 0;
                const drop =
                  index === 0 || prev <= 0
                    ? 0
                    : Math.max(
                        0,
                        Math.round((1 - step.sessions / prev) * 100),
                      );
                const ofOpen =
                  openSessions > 0
                    ? Math.round((step.sessions / openSessions) * 100)
                    : 0;
                const barWidth = Math.max(ofOpen, step.sessions > 0 ? 4 : 0);

                return (
                  <li key={step.name} className="px-4 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground">
                          {step.label}
                        </p>
                        {index > 0 ? (
                          <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                            {drop > 0
                              ? `−${drop}% from previous`
                              : "Held from previous"}
                          </p>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[15px] font-semibold tabular-nums text-foreground">
                          {step.sessions}
                        </p>
                        <p className="text-[11px] tabular-nums text-[var(--color-text-muted)]">
                          {ofOpen}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden bg-[var(--color-background-alt)]">
                      <div
                        className="h-full bg-[var(--brand-accent)] transition-[width] duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </AdminPanel>

          <div className="grid gap-3 lg:grid-cols-2">
            <TopList
              title="Top pages"
              rows={data.topPaths.map((r) => ({
                label: r.path,
                value: r.views,
              }))}
            />
            <TopList
              title="Top events"
              rows={data.topEvents.map((r) => ({
                label: r.slug,
                value: r.views,
              }))}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCell({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <AdminPanel className="px-3.5 py-3">
      <p className="text-[11px] font-medium tracking-[0.02em] text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[1.35rem] font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
          {hint}
        </p>
      ) : null}
    </AdminPanel>
  );
}

function TopList({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <AdminPanel>
      <div className="border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-[12px] text-[var(--color-text-muted)]">
          No data yet
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {rows.map((row) => (
            <li key={row.label} className="px-4 py-2.5">
              <div className="flex items-center justify-between gap-3 text-[12px]">
                <span className="min-w-0 truncate font-medium text-foreground">
                  {row.label}
                </span>
                <span className="shrink-0 tabular-nums text-[var(--color-text-muted)]">
                  {row.value}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden bg-[var(--color-background-alt)]">
                <div
                  className="h-full bg-[color-mix(in_oklab,var(--brand-accent)_55%,transparent)]"
                  style={{ width: `${Math.round((row.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  );
}
