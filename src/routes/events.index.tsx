import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Hourglass,
  MapPin,
  Ticket,
} from "lucide-react";
import {
  getMeetups,
  getNextMeetup,
  type Meetup,
  isMeetupCompleted,
  isRsvpOpen,
  meetupStatusLabel,
  meetupLocationLabel,
} from "@/lib/events";
import { RsvpButton } from "@/components/rsvp/RsvpButton";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/")({
  loader: async () => ({ meetups: await getMeetups() }),
  head: () => ({
    meta: [
      { title: "Events — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "Upcoming Hyderabad Founders Network meetups — every 3rd Saturday in Hyderabad. Plus occasional demo days and themed sessions.",
      },
      { property: "og:title", content: "Events — Hyderabad Founders Network" },
      {
        property: "og:description",
        content:
          "Current and upcoming meetups for the Hyderabad founder community.",
      },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsIndex,
});

const filters = ["Upcoming", "Past", "All"] as const;
type Filter = (typeof filters)[number];

const filterCopy: Record<
  Filter,
  { title: string; sub: string; emptyTitle: string; emptyBody: string }
> = {
  Upcoming: {
    title: "Current & upcoming",
    sub: "Open RSVPs and dates on the calendar — show up, meet founders, keep the room going.",
    emptyTitle: "No upcoming meetups right now",
    emptyBody:
      "Check past events, or join WhatsApp for the next date announcement.",
  },
  Past: {
    title: "Past meetups",
    sub: "Sessions that already happened — useful if you want a sense of what the room feels like.",
    emptyTitle: "No past meetups yet",
    emptyBody: "Once we wrap a meetup, it will show up here.",
  },
  All: {
    title: "All meetups",
    sub: "Everything in one place — upcoming dates and completed sessions, newest flow first.",
    emptyTitle: "No meetups listed yet",
    emptyBody: "Check back soon for the next Hyderabad Founders Network date.",
  },
};

const scrollRevealOpts = {
  once: true,
  threshold: 0.2,
  rootMargin: "0px 0px -12% 0px",
} as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

function EventsIndex() {
  const { meetups } = Route.useLoaderData();
  const [filter, setFilter] = useState<Filter>("Upcoming");
  const nextMeetup = useMemo(() => getNextMeetup(meetups), [meetups]);
  const listReveal = useInView<HTMLElement>(scrollRevealOpts);
  const activeIndex = filters.indexOf(filter);

  const panels = useMemo(() => {
    const sortedAsc = [...meetups].sort((a, b) =>
      a.dateISO.localeCompare(b.dateISO),
    );
    const upcoming = sortedAsc.filter((m) => !isMeetupCompleted(m));
    const past = [...sortedAsc]
      .filter((m) => isMeetupCompleted(m))
      .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    const all = sortedAsc;

    return {
      Upcoming: upcoming,
      Past: past,
      All: all,
    } satisfies Record<Filter, Meetup[]>;
  }, [meetups]);

  const copy = filterCopy[filter];
  const visibleCount = panels[filter].length;

  return (
    <div className="bg-[var(--color-background)] pb-10 md:pb-12">
      {/* Hero */}
      <section className="relative isolate min-h-[min(48dvh,440px)] overflow-hidden md:min-h-[min(46dvh,480px)]">
        <img
          src="/july-2026-1.jpeg"
          alt=""
          width={1400}
          height={900}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[50%_50%]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,oklch(0.15_0.02_55_/_0.86)_0%,oklch(0.17_0.025_50_/_0.68)_50%,oklch(0.2_0.03_45_/_0.28)_78%,oklch(0.22_0.03_40_/_0.12)_100%),linear-gradient(to_top,oklch(0.12_0.02_55_/_0.4)_0%,transparent_42%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(48dvh,440px)] max-w-6xl items-end px-5 pb-8 pt-14 md:min-h-[min(46dvh,480px)] md:px-8 md:pb-10 md:pt-16">
          <div className="w-full max-w-2xl">
            <p className="text-[11px] font-medium tracking-[0.08em] text-[color-mix(in_oklab,var(--brand-accent)_70%,white)]">
              Events
            </p>
            <h1 className="mt-2 font-display text-[clamp(1.85rem,3.5vw,2.55rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
              The 3rd Saturday, every month.
            </h1>
            <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-white/78 md:text-[14.5px]">
              Flagship meetups for founders and operators in Hyderabad — plus
              occasional demo days and themed sessions.
            </p>

            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-white/18 pt-4">
              {[
                { label: "Rhythm", value: "3rd Saturday" },
                { label: "Time", value: "11 AM – 1 PM" },
                { label: "Venue", value: "DraperU India" },
                { label: "Seats", value: "40" },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-[10px] font-medium tracking-[0.06em] text-white/50">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-medium text-white">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section ref={listReveal.ref} className="page-container pt-8 md:pt-10">
        <div
          className={cn(
            "reveal-up flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
            listReveal.inView && "is-visible",
          )}
        >
          <div className="max-w-xl">
            <SectionLabel>Meetups</SectionLabel>
            <h2 className="mt-2 font-display text-[clamp(1.35rem,2.4vw,1.7rem)] tracking-tight text-foreground">
              {copy.title}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              {copy.sub}
            </p>
            <p className="mt-2 text-[12.5px] text-[var(--color-text-muted)]">
              {visibleCount === 0
                ? "Nothing in this view yet"
                : `${visibleCount} meetup${visibleCount === 1 ? "" : "s"}`}
            </p>
          </div>

          <div
            className="flex gap-1 border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-[var(--shadow-card)]"
            role="tablist"
            aria-label="Filter meetups"
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
                    "min-h-10 shrink-0 px-4 py-2 text-[13px] font-medium transition-colors duration-200",
                    active
                      ? "bg-[var(--brand-accent)] text-white"
                      : "text-[var(--color-text-secondary)] hover:text-foreground",
                  )}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative mt-7 overflow-hidden">
          {filters.map((panel, i) => {
            const items = panels[panel];
            const panelCopy = filterCopy[panel];
            const offset = i - activeIndex;
            const isActive = offset === 0;

            return (
              <div
                key={panel}
                className={cn(
                  "w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
                  isActive
                    ? "relative z-[1]"
                    : "pointer-events-none absolute inset-x-0 top-0 z-0",
                )}
                style={{ transform: `translate3d(${offset * 100}%, 0, 0)` }}
                aria-hidden={!isActive}
              >
                {items.length > 0 ? (
                  <ul className="grid list-none gap-4 sm:grid-cols-2">
                    {items.map((m) => (
                      <li key={`${panel}-${m.slug}`} className="min-h-0">
                        <EventCard meetup={m} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-10 text-center shadow-[var(--shadow-card)]">
                    <Calendar
                      className="mx-auto size-5 text-[var(--brand-accent)]"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <p className="mt-3 font-display text-[1.05rem] tracking-tight text-foreground">
                      {panelCopy.emptyTitle}
                    </p>
                    <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
                      {panelCopy.emptyBody}
                    </p>
                    {panel === "Upcoming" ? (
                      <button
                        type="button"
                        onClick={() => setFilter("Past")}
                        className="btn-secondary mt-5"
                      >
                        View past meetups
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {nextMeetup && filter === "Upcoming" ? (
          <div className="mt-9 flex flex-col gap-4 border-t border-[var(--color-border)] pt-7 md:flex-row md:items-center md:justify-between md:gap-6">
            <p className="max-w-xl text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              New here? Start with the{" "}
              <Link
                to="/events/$slug"
                params={{ slug: nextMeetup.slug }}
                className="font-medium text-foreground underline-offset-4 hover:text-[var(--brand-accent)] hover:underline"
              >
                next Hyderabad Founders Network meetup
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-2.5 md:shrink-0">
              <Link
                to="/events/$slug"
                params={{ slug: nextMeetup.slug }}
                className="btn-secondary gap-1.5"
              >
                What to expect
                <ArrowRight className="size-3.5" strokeWidth={1.75} />
              </Link>
              <RsvpButton event={nextMeetup} className="btn-primary">
                RSVP
              </RsvpButton>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function statusMeta(meetup: Meetup) {
  if (isRsvpOpen(meetup)) {
    return {
      label: "Open for RSVP",
      tone: "bg-[var(--brand-accent)] text-white",
      Icon: Ticket,
    };
  }
  if (isMeetupCompleted(meetup)) {
    return {
      label: meetupStatusLabel(meetup),
      tone: "bg-[var(--color-background-warm)] text-[var(--color-text-muted)]",
      Icon: CheckCircle2,
    };
  }
  return {
    label: meetupStatusLabel(meetup),
    tone: "bg-[var(--brand-primary-soft)] text-[var(--color-text-secondary)]",
    Icon: Hourglass,
  };
}

function EventCard({ meetup }: { meetup: Meetup }) {
  const day = new Date(meetup.dateISO + "T12:00:00");
  const dayNum = day.getDate();
  const monthShort = day
    .toLocaleDateString("en-IN", { month: "short" })
    .toUpperCase();
  const year = day.getFullYear();
  const weekday = day.toLocaleDateString("en-IN", { weekday: "short" });
  const { label, tone, Icon } = statusMeta(meetup);

  return (
    <article
      className={cn(
        "flex h-full min-h-[280px] flex-col border bg-[var(--color-surface)] transition-[border-color,background-color] duration-200",
        isRsvpOpen(meetup)
          ? "border-[var(--brand-accent)] hover:bg-[color-mix(in_oklab,var(--brand-accent)_4%,var(--color-surface))]"
          : "border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-background-alt)]",
      )}
    >
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-[2.15rem] leading-none tracking-tight text-foreground">
              {dayNum}
            </p>
            <p className="mt-1.5 text-[12px] font-medium tracking-[0.06em] text-[var(--color-text-secondary)]">
              {monthShort} {year} · {weekday}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold tracking-[0.05em]",
              tone,
            )}
          >
            <Icon className="size-3" strokeWidth={2} aria-hidden />
            {label}
          </span>
        </div>

        <p className="mt-5 text-[11px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
          {meetup.format}
        </p>
        <h3 className="mt-1.5 line-clamp-2 min-h-[2.5rem] font-display text-[1.08rem] leading-snug tracking-tight text-foreground md:text-[1.12rem]">
          {meetup.title}
        </h3>

        <div className="mt-3 flex flex-col gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <Clock
              className="size-3.5 shrink-0 text-[var(--brand-accent)]"
              strokeWidth={1.75}
            />
            {meetup.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin
              className="size-3.5 shrink-0 text-[var(--brand-accent)]"
              strokeWidth={1.75}
            />
            <span className="line-clamp-1">
              {meetupLocationLabel(meetup)}, {meetup.city}
            </span>
          </span>
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
          {meetup.blurb}
        </p>

        <div className="mt-5 flex gap-2.5">
          <RsvpButton
            event={meetup}
            className="btn-primary min-w-0 flex-1 justify-center gap-1.5"
          >
            <CalendarCheck className="size-3.5" strokeWidth={1.75} aria-hidden />
            RSVP
          </RsvpButton>
          <Link
            to="/events/$slug"
            params={{ slug: meetup.slug }}
            className="btn-secondary group min-w-0 flex-1 justify-center gap-1.5"
          >
            Details
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
