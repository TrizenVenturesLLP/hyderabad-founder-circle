import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  MapPin,
} from "lucide-react";
import eventImg from "@/assets/event-room.jpg";
import {
  meetups,
  type Meetup,
  isRsvpOpen,
  meetupLocationLabel,
} from "@/lib/events";
import { RsvpButton } from "@/components/rsvp/RsvpButton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "Hyderabad Founders Network — every 3rd Saturday in Hyderabad. Plus occasional demo days, pitch nights and themed sessions.",
      },
      { property: "og:title", content: "Events — Hyderabad Founders Network" },
      {
        property: "og:description",
        content: "Next 3 monthly meetups for the Hyderabad founder community.",
      },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsIndex,
});

const filters = ["Upcoming", "Past Events", "Community Meetups", "Themed Sessions"] as const;
type Filter = (typeof filters)[number];

function EventsIndex() {
  const [filter, setFilter] = useState<Filter>("Upcoming");
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const visible = useMemo(() => {
    return meetups.filter((m) => {
      if (filter === "Upcoming") return m.dateISO >= today;
      if (filter === "Past Events") return m.dateISO < today;
      if (filter === "Community Meetups") {
        return m.title.toLowerCase().includes("community meetup");
      }
      if (filter === "Themed Sessions") {
        return m.blurb.toLowerCase().includes("themed") || m.title.toLowerCase().includes("themed");
      }
      return true;
    });
  }, [filter, today]);

  const featured = visible[0] ?? null;
  const rest = visible.slice(1);

  return (
    <div className="pb-10 md:pb-12">
      {/* Hero */}
      <section className="relative isolate min-h-[min(42dvh,380px)] overflow-hidden md:min-h-[min(40dvh,420px)]">
        <img
          src={eventImg}
          alt=""
          width={1400}
          height={900}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,oklch(0.15_0.02_55_/_0.88)_0%,oklch(0.17_0.025_50_/_0.72)_48%,oklch(0.2_0.03_45_/_0.32)_75%,oklch(0.22_0.03_40_/_0.14)_100%),linear-gradient(to_top,oklch(0.12_0.02_55_/_0.45)_0%,transparent_40%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(42dvh,380px)] max-w-6xl items-end px-5 pb-7 pt-12 md:min-h-[min(40dvh,420px)] md:pb-9 md:pt-14">
          <div className="w-full max-w-2xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[color-mix(in_oklab,var(--saffron)_88%,white)]">
              Events
            </p>
            <h1 className="mt-2 font-display text-[2rem] leading-[1.08] tracking-tight text-white md:text-[2.65rem]">
              The 3rd Saturday, every month.
            </h1>
            <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-white/75 md:text-[15px]">
              Our flagship is the{" "}
              <em className="not-italic font-medium text-white">Hyderabad Founders Network</em>{" "}
              — a roundtable for founders and operators in Hyderabad. Same room,
              same energy, new conversations. Occasionally we host demo days and
              themed sessions.
            </p>

            <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/20 pt-4 sm:gap-x-7">
              {[
                { label: "Rhythm", value: "3rd Saturday" },
                { label: "Time", value: "11 AM – 1 PM" },
                { label: "Venue", value: "DraperU India" },
                { label: "Seats", value: "40" },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/50">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-medium text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-6xl px-5 pt-8 md:pt-9">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-xl tracking-tight text-foreground md:text-2xl">
              Next 3 meetups
            </h2>
          </div>

          <div className="scrollbar-none -mx-5 flex gap-1.5 overflow-x-auto px-5 md:mx-0 md:px-0">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-200",
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {featured ? (
          <div className="mt-6 space-y-3.5">
            <FeaturedEventCard meetup={featured} />
            {rest.map((m) => (
              <EventCard key={m.slug} meetup={m} />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-8 text-center text-sm text-[var(--color-text-secondary)]">
            No meetups in this view yet.
          </p>
        )}

        {/* Reassurance */}
        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 md:flex-row md:items-center md:justify-between md:gap-6">
          <p className="max-w-xl text-[13px] text-[var(--color-text-secondary)] md:text-sm">
            New here? Start with the{" "}
            <Link
              to="/events/$slug"
              params={{ slug: meetups[0].slug }}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              next Hyderabad Founders Network meetup
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-2.5 md:shrink-0">
            <Link
              to="/events/$slug"
              params={{ slug: meetups[0].slug }}
              className="btn-secondary gap-1.5"
            >
              What to expect
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
            <RsvpButton event={meetups[0]} className="btn-primary">
              RSVP
            </RsvpButton>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeaturedEventCard({ meetup }: { meetup: Meetup }) {
  const day = new Date(meetup.dateISO + "T12:00:00");
  const dayNum = day.getDate();
  const monthYear = day.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const weekday = day.toLocaleDateString("en-IN", { weekday: "long" });

  return (
    <article className="overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-small)]">
      <div className="grid md:grid-cols-12">
        <div className="flex flex-col justify-between gap-6 border-b border-[var(--color-border)] bg-[var(--color-background-warm)] px-5 py-5 md:col-span-3 md:border-b-0 md:border-r md:px-6 md:py-6">
          <span
            className={cn(
              "inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
              isRsvpOpen(meetup)
                ? "bg-[var(--brand-accent)] text-white"
                : "bg-[var(--brand-primary-soft)] text-[var(--color-text-secondary)]",
            )}
          >
            {isRsvpOpen(meetup) ? "Next event" : "Coming soon"}
          </span>
          <div>
            <p className="font-display text-[3.25rem] leading-none tracking-tight text-foreground md:text-[3.75rem]">
              {dayNum}
            </p>
            <p className="mt-2 text-[13px] font-semibold text-foreground">
              {monthYear}
            </p>
            <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">
              {weekday}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 px-5 py-5 md:col-span-9 md:px-7 md:py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
              {meetup.format}
            </p>
            <h3 className="mt-2 max-w-[28ch] font-display text-[1.35rem] leading-[1.15] tracking-tight text-foreground md:text-[1.55rem]">
              {meetup.title}
            </h3>
            <div className="mt-3.5 flex flex-col gap-2 text-[13px] text-[var(--color-text-secondary)] sm:flex-row sm:flex-wrap sm:gap-x-5">
              <span className="inline-flex items-center gap-1.5">
                <Clock
                  className="size-3.5 text-[var(--brand-accent)]"
                  strokeWidth={1.75}
                />
                {meetup.time}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin
                  className="size-3.5 text-[var(--brand-accent)]"
                  strokeWidth={1.75}
                />
                {meetupLocationLabel(meetup)}, {meetup.city}
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-[var(--color-text-secondary)] md:text-[14px]">
              {meetup.blurb}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <RsvpButton event={meetup} className="btn-primary">
              RSVP
            </RsvpButton>
            <Link
              to="/events/$slug"
              params={{ slug: meetup.slug }}
              className="btn-secondary group gap-1.5"
            >
              View Details
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function EventCard({ meetup }: { meetup: Meetup }) {
  const day = new Date(meetup.dateISO + "T12:00:00");
  const dayNum = day.getDate();
  const monthShort = day
    .toLocaleDateString("en-IN", { month: "short" })
    .toUpperCase();
  const year = day.getFullYear();

  return (
    <article className="group rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] transition-[border-color,box-shadow] duration-200 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-small)]">
      <div className="grid gap-4 px-5 py-5 md:grid-cols-12 md:items-center md:gap-6 md:px-6 md:py-5">
        <div className="flex items-baseline gap-2 md:col-span-2 md:block">
          <p className="font-display text-[2rem] leading-none tracking-tight text-foreground md:text-[2.35rem]">
            {dayNum}
          </p>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-secondary)] md:mt-1.5">
            {monthShort} {year}
          </p>
        </div>

        <div className="md:col-span-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[1.05rem] leading-snug tracking-tight text-foreground md:text-[1.15rem]">
              {meetup.title}
            </h3>
            {!isRsvpOpen(meetup) ? (
              <span className="rounded-full bg-[var(--color-background-warm)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Coming soon
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-col gap-1 text-[13px] text-[var(--color-text-secondary)] sm:flex-row sm:flex-wrap sm:gap-x-4">
            <span className="inline-flex items-center gap-1.5">
              <Clock
                className="size-3.5 text-[var(--brand-accent)]"
                strokeWidth={1.75}
              />
              {meetup.time}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin
                className="size-3.5 text-[var(--brand-accent)]"
                strokeWidth={1.75}
              />
              {meetupLocationLabel(meetup)}, {meetup.city}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            {meetup.blurb}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:col-span-4 md:justify-end">
          <Link
            to="/events/$slug"
            params={{ slug: meetup.slug }}
            className="btn-secondary group/link gap-1.5"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
          </Link>
          <RsvpButton event={meetup} className="btn-primary">
            RSVP
          </RsvpButton>
        </div>
      </div>
    </article>
  );
}
