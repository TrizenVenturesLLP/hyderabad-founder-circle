import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import eventImg from "@/assets/event-room.jpg";
import { meetups, type Meetup } from "@/lib/events";
import { RsvpButton } from "@/components/rsvp/RsvpButton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "Founders Open House — every 3rd Saturday in Hyderabad. Plus occasional demo days, pitch nights and themed sessions.",
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

const filters = ["Upcoming", "Past Events", "Open House", "Themed Sessions"] as const;
type Filter = (typeof filters)[number];

function EventsIndex() {
  const [filter, setFilter] = useState<Filter>("Upcoming");
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const visible = useMemo(() => {
    return meetups.filter((m) => {
      if (filter === "Upcoming") return m.dateISO >= today;
      if (filter === "Past Events") return m.dateISO < today;
      if (filter === "Open House") return m.title.toLowerCase().includes("open house");
      if (filter === "Themed Sessions") {
        return m.blurb.toLowerCase().includes("themed") || m.title.toLowerCase().includes("themed");
      }
      return true;
    });
  }, [filter, today]);

  const featured = visible[0] ?? null;
  const rest = visible.slice(1);

  return (
    <div className="pb-16 md:pb-20">
      {/* Hero */}
      <section className="border-b border-border/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-12 md:items-center md:gap-12 md:py-20">
          <div className="md:col-span-6 lg:col-span-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              Events
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.08] tracking-tight text-foreground md:text-5xl">
              The 3rd Saturday, every month.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Our flagship is the <em className="text-foreground">Founders Open House</em> — a
              roundtable for founders and operators in Hyderabad. Same room, same energy, new
              conversations. Occasionally we host demo days and themed sessions.
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
              {[
                { label: "Rhythm", value: "3rd Saturday", Icon: CalendarDays },
                { label: "Time", value: "5–8 PM", Icon: Clock },
                { label: "Venue", value: "T-Hub, Hyderabad", Icon: MapPin },
                { label: "Room", value: "~80 founders", Icon: Users },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    <item.Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                    {item.label}
                  </dt>
                  <dd className="text-sm font-medium text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative md:col-span-6">
            <div
              className="absolute -inset-3 -z-10 rounded-[1.75rem] bg-gradient-to-br from-primary/15 via-transparent to-accent/20 blur-2xl"
              aria-hidden
            />
            <img
              src={eventImg}
              alt="Founders gathered in a Hyderabad meetup room"
              width={1400}
              height={900}
              className="aspect-[5/4] w-full rounded-2xl object-cover shadow-[0_28px_56px_-32px_rgba(0,0,0,0.4)] ring-1 ring-black/5"
            />
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-6xl px-5 pt-14 md:pt-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
              Next 3 meetups
            </h2>
          </div>

          <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors duration-200",
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
          <div className="mt-10 space-y-4">
            <FeaturedEventCard meetup={featured} />
            {rest.map((m) => (
              <EventCard key={m.slug} meetup={m} />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-border bg-card px-6 py-10 text-center text-muted-foreground">
            No meetups in this view yet.
          </p>
        )}

        {/* Reassurance */}
        <div className="mt-12 rounded-2xl border border-border bg-secondary/30 px-6 py-7 md:flex md:items-center md:justify-between md:gap-8 md:px-8 md:py-8">
          <p className="max-w-xl text-sm text-muted-foreground md:text-[15px]">
            New here? Start with the{" "}
            <Link
              to="/events/$slug"
              params={{ slug: meetups[0].slug }}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              next Founders Open House
            </Link>
            .
          </p>
          <div className="mt-5 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
            <Link
              to="/events/$slug"
              params={{ slug: meetups[0].slug }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/20 hover:bg-muted"
            >
              What to expect
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
            <RsvpButton
              event={meetups[0]}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
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
  const monthYear = day.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const weekday = day.toLocaleDateString("en-IN", { weekday: "long" });

  return (
    <article className="overflow-hidden rounded-[1.25rem] border border-primary/25 bg-card shadow-[0_18px_40px_-32px_rgba(0,0,0,0.35)] ring-1 ring-primary/10">
      <div className="grid md:grid-cols-12">
        <div className="flex flex-col justify-between border-b border-primary/15 bg-secondary/40 px-6 py-6 md:col-span-3 md:border-b-0 md:border-r md:px-7 md:py-8">
          <span className="inline-flex w-fit rounded-full bg-primary px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-primary-foreground">
            Next event
          </span>
          <div className="mt-6 md:mt-10">
            <p className="font-display text-5xl leading-none tracking-tight text-foreground md:text-6xl">
              {dayNum}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{monthYear}</p>
            <p className="text-sm text-muted-foreground">{weekday}</p>
          </div>
        </div>

        <div className="px-6 py-6 md:col-span-9 md:px-8 md:py-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
            {meetup.format}
          </p>
          <h3 className="mt-2 font-display text-2xl tracking-tight text-foreground md:text-[1.85rem]">
            {meetup.title}
          </h3>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
              {meetup.time}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
              {meetup.venue}, {meetup.city}
            </span>
          </div>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{meetup.blurb}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <RsvpButton
              event={meetup}
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_10px_24px_-14px_color-mix(in_oklab,var(--terracotta)_70%,transparent)] hover:opacity-90"
            >
              RSVP
            </RsvpButton>
            <Link
              to="/events/$slug"
              params={{ slug: meetup.slug }}
              className="group inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
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
  const monthYear = day.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <article className="group rounded-[1.15rem] border border-border bg-card transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_16px_32px_-24px_rgba(0,0,0,0.3)]">
      <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-12 md:items-center md:gap-6 md:p-7">
        <div className="md:col-span-2">
          <p className="font-display text-3xl leading-none tracking-tight text-foreground">
            {dayNum}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{monthYear}</p>
        </div>

        <div className="md:col-span-6">
          <h3 className="font-display text-xl tracking-tight text-foreground">{meetup.title}</h3>
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary/80" strokeWidth={1.75} />
              {meetup.time}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary/80" strokeWidth={1.75} />
              {meetup.venue}, {meetup.city}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{meetup.blurb}</p>
        </div>

        <div className="flex flex-wrap gap-2 md:col-span-4 md:justify-end">
          <Link
            to="/events/$slug"
            params={{ slug: meetup.slug }}
            className="group/link inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
          </Link>
          <RsvpButton
            event={meetup}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            RSVP
          </RsvpButton>
        </div>
      </div>
    </article>
  );
}
