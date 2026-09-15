import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import {
  getMeetups,
  getEventOrganizations,
  type Meetup,
  isMeetupCompleted,
} from "@/lib/events";
import { EventCard } from "@/components/EventCard";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/")({
  loader: async () => {
    const [meetups, organizations] = await Promise.all([
      getMeetups(),
      getEventOrganizations(),
    ]);
    return { meetups, organizations };
  },
  head: () => {
    const siteUrl = "https://community.trizenventures.com";
    const title = "Events — Trizen Community";
    const desc =
      "Browse community events on Trizen Community — including Hyderabad Founders Network and partner-hosted meetups. Register per event; no public signup.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content:
            "Upcoming and past community events from Trizen Ventures, NanoSpace, and other organizers.",
        },
        { property: "og:url", content: `${siteUrl}/events` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}/events` }],
    };
  },
  component: EventsIndex,
});

const filters = ["Upcoming", "Past", "All"] as const;
type Filter = (typeof filters)[number];

const emptyCopy: Record<
  Filter,
  { title: string; body: string }
> = {
  Upcoming: {
    title: "No upcoming events right now",
    body: "Check past events, or come back soon for the next date.",
  },
  Past: {
    title: "No past events yet",
    body: "Once an event wraps, it will show up here.",
  },
  All: {
    title: "No events listed yet",
    body: "Check back soon for the next community meetup.",
  },
};

const scrollRevealOpts = {
  once: true,
  threshold: 0.15,
  rootMargin: "0px 0px -8% 0px",
} as const;

function EventsIndex() {
  const { meetups, organizations } = Route.useLoaderData();
  const searchStr = useRouterState({
    select: (s) => s.location.searchStr,
  });
  const organizationFromSearch = useMemo(() => {
    const value = new URLSearchParams(searchStr).get("organization");
    return value?.trim() || undefined;
  }, [searchStr]);
  const [filter, setFilter] = useState<Filter>("Upcoming");
  const [orgFilter, setOrgFilter] = useState<string>(
    organizationFromSearch || "all",
  );
  const listReveal = useInView<HTMLElement>(scrollRevealOpts);

  useEffect(() => {
    if (organizationFromSearch) {
      setOrgFilter(organizationFromSearch);
    } else {
      setOrgFilter("all");
    }
  }, [organizationFromSearch]);

  function updateOrgFilter(next: string) {
    setOrgFilter(next);
    const url =
      next === "all"
        ? "/events"
        : `/events?organization=${encodeURIComponent(next)}`;
    window.history.replaceState(window.history.state, "", url);
  }

  const orgScoped = useMemo(() => {
    if (orgFilter === "all") return meetups;
    return meetups.filter((m) => m.organization?.slug === orgFilter);
  }, [meetups, orgFilter]);

  const panels = useMemo(() => {
    const sortedAsc = [...orgScoped].sort((a, b) =>
      a.dateISO.localeCompare(b.dateISO),
    );
    const upcoming = sortedAsc.filter((m) => !isMeetupCompleted(m));
    const past = [...sortedAsc]
      .filter((m) => isMeetupCompleted(m))
      .sort((a, b) => b.dateISO.localeCompare(a.dateISO));

    return {
      Upcoming: upcoming,
      Past: past,
      All: sortedAsc,
    } satisfies Record<Filter, Meetup[]>;
  }, [orgScoped]);

  const items = panels[filter];
  const empty = emptyCopy[filter];

  return (
    <div className="bg-[var(--color-background)] pb-14 md:pb-16">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)]">
        <div className="page-container py-8 md:py-10">
          <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
            Trizen Community
          </p>
          <h1 className="mt-2 font-display text-[clamp(1.75rem,3.2vw,2.25rem)] font-semibold tracking-tight text-foreground">
            Events
          </h1>
          <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
            Browse upcoming and past community events in Hyderabad. Register for
            an event — no account required.
          </p>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-[64px] z-30 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-md md:top-[68px]">
        <div className="page-container flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div
            className="flex w-full gap-1 overflow-x-auto sm:w-auto"
            role="tablist"
            aria-label="Event status"
          >
            {filters.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 px-3.5 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-[var(--brand-accent)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-alt)] hover:text-foreground",
                  )}
                >
                  {f}
                  <span
                    className={cn(
                      "text-[11px] tabular-nums",
                      active
                        ? "text-white/75"
                        : "text-[var(--color-text-muted)]",
                    )}
                  >
                    {panels[f].length}
                  </span>
                </button>
              );
            })}
          </div>

          {organizations.length > 0 ? (
            <label className="flex items-center gap-2 self-start text-[13px] sm:self-auto">
              <span className="sr-only">Organizer</span>
              <select
                value={orgFilter}
                onChange={(e) => updateOrgFilter(e.target.value)}
                className="min-h-[40px] min-w-[11rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[13px] font-medium text-foreground outline-none focus-visible:border-[var(--brand-accent)]"
                aria-label="Filter by organizer"
              >
                <option value="all">All organizers</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.slug}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>

      <section
        id="event-listings"
        ref={listReveal.ref}
        className="page-container pt-8 md:pt-10"
        aria-live="polite"
      >
        <div
          className={cn(
            "reveal-up mb-5 flex items-baseline justify-between gap-3",
            listReveal.inView && "is-visible",
          )}
        >
          <h2 className="font-display text-[1.05rem] tracking-tight text-foreground md:text-[1.15rem]">
            {filter === "Upcoming"
              ? "Upcoming"
              : filter === "Past"
                ? "Past"
                : "All events"}
          </h2>
          <p className="text-[12.5px] text-[var(--color-text-muted)]">
            {items.length === 0
              ? "0 events"
              : `${items.length} event${items.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {items.length > 0 ? (
          <ul
            className={cn(
              "stagger-in grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6",
              listReveal.inView && "is-visible",
            )}
          >
            {items.map((m) => (
              <li key={m.slug} className="min-h-0">
                <EventCard meetup={m} />
              </li>
            ))}
          </ul>
        ) : (
          <div
            className={cn(
              "reveal-up border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-14 text-center",
              listReveal.inView && "is-visible",
            )}
          >
            <Calendar
              className="mx-auto size-5 text-[var(--brand-accent)]"
              strokeWidth={1.75}
              aria-hidden
            />
            <p className="mt-3 font-display text-[1.05rem] tracking-tight text-foreground">
              {empty.title}
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
              {empty.body}
            </p>
            {filter === "Upcoming" ? (
              <button
                type="button"
                onClick={() => setFilter("Past")}
                className="btn-secondary mt-5"
              >
                View past events
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
