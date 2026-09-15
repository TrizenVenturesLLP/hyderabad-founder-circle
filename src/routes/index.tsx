import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Megaphone,
  Network,
  Radio,
  Sparkles,
  Ticket,
  Users,
  Wrench,
} from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import {
  getEventOrganizations,
  getMeetups,
  isMeetupCompleted,
  isRsvpOpen,
  meetupCoverImage,
  meetupCoverObjectClass,
  meetupDateLabel,
  type Meetup,
} from "@/lib/events";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [meetups, organizations] = await Promise.all([
      getMeetups(),
      getEventOrganizations(),
    ]);
    const upcoming = meetups.filter((m) => !isMeetupCompleted(m));
    const featured = (upcoming.length > 0 ? upcoming : meetups).slice(0, 3);
    return { meetups, upcoming: featured, organizations };
  },
  head: () => ({
    meta: [
      { title: "Trizen Community — Discover Events in Hyderabad" },
      {
        name: "description",
        content:
          "Discover free and paid events in Hyderabad from communities on Trizen Community.",
      },
      {
        property: "og:title",
        content: "Trizen Community — Discover Events in Hyderabad",
      },
      {
        property: "og:description",
        content:
          "Find meetups, workshops, networking events, and experiences happening in Hyderabad.",
      },
      { property: "og:url", content: "/" },
      { property: "og:site_name", content: "Trizen Community" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const scrollRevealOpts = {
  once: true,
  threshold: 0.2,
  rootMargin: "0px 0px -12% 0px",
} as const;

const eventTypes = [
  {
    title: "Startup & Founder Meetups",
    desc: "Peer conversations for people building companies.",
    Icon: Sparkles,
  },
  {
    title: "Networking Events",
    desc: "Meet collaborators, mentors, and local professionals.",
    Icon: Network,
  },
  {
    title: "Technology Events",
    desc: "Talks and sessions around products, AI, and builders.",
    Icon: Radio,
  },
  {
    title: "Workshops",
    desc: "Hands-on learning with practical takeaways.",
    Icon: Wrench,
  },
  {
    title: "Business Events",
    desc: "Growth, operations, and operator-focused sessions.",
    Icon: ClipboardList,
  },
  {
    title: "Community Gatherings",
    desc: "Experiences that bring local communities together.",
    Icon: Users,
  },
];

const attendeeSteps = [
  {
    step: "01",
    title: "Discover",
    body: "Find events that match your interests.",
  },
  {
    step: "02",
    title: "Register",
    body: "Choose your event and complete your registration.",
  },
  {
    step: "03",
    title: "Attend",
    body: "Get your confirmation and event details.",
  },
];

const whyPoints = [
  {
    title: "Discover",
    body: "Find events from communities in one place.",
  },
  {
    title: "Connect",
    body: "Meet people through experiences that bring communities together.",
  },
  {
    title: "Show up",
    body: "Register in minutes and get confirmation details for the evening.",
  },
];

const faqs = [
  {
    q: "What is Trizen Community?",
    a: "Trizen Community is where communities publish events, and people discover and register for the ones they want to attend.",
  },
  {
    q: "How do I register for an event?",
    a: "Open an event page, complete the registration form, and follow the payment or confirmation steps shown for that event. No public attendee account is required.",
  },
  {
    q: "Are events free or paid?",
    a: "Both. Events may be free or paid depending on the event. Details appear on each event page.",
  },
  {
    q: "Do I need an account to register?",
    a: "No. Attendees register per event — there is no public signup or login for attendees.",
  },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

function HeroSection({ previewEvents }: { previewEvents: Meetup[] }) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-background)]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 85% 10%, color-mix(in oklab, var(--brand-accent) 14%, transparent) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 0% 100%, color-mix(in oklab, var(--brand-primary) 8%, transparent) 0%, transparent 50%)",
        }}
      />

      <div className="page-container relative grid items-center gap-10 py-14 md:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
        <div className="hero-reveal lg:col-span-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-1 text-[12px] font-medium text-[var(--color-text-secondary)] shadow-[var(--shadow-small)] backdrop-blur-sm">
            <Megaphone className="size-3.5 text-[var(--brand-accent)]" />
            Event hosting platform · Hyderabad-first
          </p>
          <h1
            className="mt-5 max-w-[14ch] font-semibold leading-[1.05] tracking-[-0.035em] text-foreground"
            style={{
              fontFamily: "var(--font-brand)",
              fontSize: "clamp(2.35rem, 6.5vw, 3.85rem)",
            }}
          >
            Discover events that bring people together.
          </h1>
          <p className="mt-5 max-w-[38rem] text-[15.5px] leading-relaxed text-[var(--color-text-secondary)] md:text-[16.5px]">
            Find meetups, workshops, networking events, and experiences
            happening in Hyderabad — all in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/events"
              className="btn-primary inline-flex min-h-[48px] items-center justify-center gap-2 !rounded-full px-6 text-[14.5px] font-medium"
            >
              Explore Events
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
          </div>
          <p className="mt-5 text-[13px] text-[var(--color-text-muted)]">
            Free and paid events from communities across Hyderabad.
          </p>
        </div>

        <div className="hero-reveal hero-reveal-delay-2 relative lg:col-span-6">
          <div className="absolute -inset-4 rounded-[2rem] bg-[linear-gradient(145deg,color-mix(in_oklab,var(--brand-accent)_12%,transparent),transparent_60%)] blur-2xl" aria-hidden />
          <div className="relative grid gap-3 sm:grid-cols-2">
            {previewEvents.slice(0, 2).map((event, i) => (
              <Link
                key={event.slug}
                to="/events/$slug"
                params={{ slug: event.slug }}
                className={cn(
                  "group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-1",
                  i === 0 && "sm:col-span-2 sm:flex sm:min-h-[11.5rem]",
                )}
              >
                <div
                  className={cn(
                    "relative overflow-hidden bg-[var(--color-background-alt)]",
                    i === 0
                      ? "aspect-[16/9] sm:aspect-auto sm:w-[46%] sm:shrink-0"
                      : "aspect-[16/10]",
                  )}
                >
                  <img
                    src={meetupCoverImage(event)}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
                  <p className="text-[11px] font-semibold tracking-[0.06em] text-[var(--brand-accent)]">
                    {event.organization?.name || event.format}
                    {isRsvpOpen(event) ? " · Open" : ""}
                  </p>
                  <h2 className="mt-1.5 line-clamp-2 font-display text-[1.02rem] leading-snug tracking-tight text-foreground">
                    {event.title}
                  </h2>
                  <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">
                    {meetupDateLabel(event)} · {event.city}
                  </p>
                </div>
              </Link>
            ))}
            {previewEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-white/70 p-8 text-center sm:col-span-2">
                <p className="font-display text-[1.05rem] text-foreground">
                  Events are loading soon
                </p>
                <Link
                  to="/events"
                  className="mt-3 inline-flex text-[14px] font-medium text-[var(--brand-accent)] hover:underline"
                >
                  Browse the events page →
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function DiscoverySection({ events }: { events: Meetup[] }) {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} id="discover" className="section-space">
      <div className="page-container">
        <div
          className={cn(
            "reveal-up flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
            inView && "is-visible",
          )}
        >
          <div className="max-w-2xl">
            <SectionLabel>Event discovery</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.35rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
              Find your next event
            </h2>
            <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              Explore upcoming events from communities and organizers across
              Hyderabad.
            </p>
          </div>
          <Link
            to="/events"
            className="btn-secondary inline-flex gap-2 !rounded-full self-start md:self-auto"
          >
            Explore All Events
            <ArrowRight className="size-4" strokeWidth={1.75} />
          </Link>
        </div>

        {events.length > 0 ? (
          <ul
            className={cn(
              "stagger-in mt-10 grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3",
              inView && "is-visible",
            )}
          >
            {events.map((meetup) => (
              <li key={meetup.slug}>
                <EventCard meetup={meetup} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center">
            <p className="font-display text-[1.1rem] text-foreground">
              No upcoming events right now
            </p>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-[var(--color-text-secondary)]">
              Check the events page for past sessions, or apply to host the next
              one.
            </p>
            <Link to="/events" className="btn-primary mt-5 !rounded-full">
              Go to Events
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function EventTypesSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section
      ref={ref}
      id="event-types"
      className="section-space bg-[var(--color-background-alt)]"
    >
      <div className="page-container">
        <div
          className={cn(
            "reveal-up mx-auto max-w-2xl text-center",
            inView && "is-visible",
          )}
        >
          <SectionLabel>What kind of events?</SectionLabel>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.35rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
            Something for everyone
          </h2>
        </div>

        <ul
          className={cn(
            "stagger-in mt-10 grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-3",
            inView && "is-visible",
          )}
        >
          {eventTypes.map(({ title, desc, Icon }) => (
            <li
              key={title}
              className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-small)] transition-[border-color,box-shadow] duration-200 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-card)]"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-[1.05rem] tracking-tight text-foreground">
                {title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
                {desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CommunitiesSection({
  organizations,
  events,
}: {
  organizations: { id: string; name: string; slug: string }[];
  events: Meetup[];
}) {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  const communities = useMemo(() => {
    const fromApi = organizations.length > 0 ? organizations : [];
    const fromEvents = Array.from(
      new Map(
        events
          .filter((e) => e.organization?.slug)
          .map((e) => [
            e.organization!.slug,
            {
              id: e.organization!.id,
              name: e.organization!.name,
              slug: e.organization!.slug,
            },
          ]),
      ).values(),
    );

    const merged = new Map<
      string,
      { id: string; name: string; slug: string }
    >();
    for (const org of [...fromApi, ...fromEvents]) {
      if (!org.slug) continue;
      merged.set(org.slug, org);
    }

    return Array.from(merged.values())
      .map((org) => {
        const orgEvents = events.filter(
          (e) => e.organization?.slug === org.slug,
        );
        const upcoming = orgEvents.filter((e) => !isMeetupCompleted(e)).length;
        const coverEvent =
          orgEvents.find((e) => !isMeetupCompleted(e)) || orgEvents[0];
        return {
          ...org,
          eventCount: orgEvents.length,
          upcomingCount: upcoming,
          cover: coverEvent
            ? meetupCoverImage(coverEvent)
            : "/july-2026-1.jpeg",
          coverObject: coverEvent
            ? meetupCoverObjectClass(coverEvent)
            : "object-[50%_42%]",
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [organizations, events]);

  if (communities.length === 0) return null;

  return (
    <section ref={ref} id="communities" className="section-space">
      <div className="page-container">
        <div
          className={cn(
            "reveal-up mx-auto max-w-2xl text-center",
            inView && "is-visible",
          )}
        >
          <SectionLabel>Communities</SectionLabel>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.35rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
            Communities &amp; organizers
          </h2>
          <p className="mx-auto mt-3 max-w-[44ch] text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
            Browse events by the communities hosting on Trizen Community.
          </p>
        </div>

        <ul
          className={cn(
            "stagger-in mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3",
            inView && "is-visible",
          )}
        >
          {communities.map((org) => (
            <li key={org.slug}>
              <a
                href={`/events?organization=${encodeURIComponent(org.slug)}`}
                className="group flex h-full flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-background-alt)]">
                  <img
                    src={org.cover}
                    alt=""
                    className={cn(
                      "size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
                      org.coverObject,
                    )}
                    loading="lazy"
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,10,24,0.55)_0%,transparent_50%)]"
                    aria-hidden
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 md:p-5">
                  <h3 className="font-display text-[1.1rem] tracking-tight text-foreground transition-colors group-hover:text-[var(--brand-accent)]">
                    {org.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-[var(--color-text-secondary)]">
                    {org.eventCount === 0
                      ? "No events listed yet"
                      : org.upcomingCount > 0
                        ? `${org.upcomingCount} upcoming · ${org.eventCount} total`
                        : `${org.eventCount} past event${org.eventCount === 1 ? "" : "s"}`}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--brand-accent)]">
                    View events
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AttendeeStepsSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section
      ref={ref}
      id="how-attendees"
      className="section-space border-y border-[var(--color-border)] bg-[var(--color-background-alt)]"
    >
      <div className="page-container">
        <div
          className={cn(
            "reveal-up grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12",
            inView && "is-visible",
          )}
        >
          <div className="lg:col-span-4">
            <SectionLabel>For attendees</SectionLabel>
            <h2 className="mt-3 max-w-[14ch] font-display text-[clamp(1.7rem,2.8vw,2.25rem)] leading-[1.1] tracking-[-0.03em] text-foreground">
              From discovery to attendance
            </h2>
            <p className="mt-3 max-w-[34ch] text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
              Three steps. No account required — register per event and show up.
            </p>
          </div>

          <ol
            className={cn(
              "stagger-in relative grid list-none gap-0 lg:col-span-8 lg:grid-cols-3",
              inView && "is-visible",
            )}
          >
            {attendeeSteps.map((item, index) => (
              <li
                key={item.step}
                className={cn(
                  "relative border-t border-[var(--color-border)] pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6",
                  index === 0 && "lg:border-l-0 lg:pl-0",
                )}
              >
                <span className="font-display text-[2rem] font-semibold leading-none tracking-tight text-[var(--brand-accent)] md:text-[2.25rem]">
                  {item.step}
                </span>
                <h3 className="mt-4 font-display text-[1.15rem] tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-[28ch] text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} id="why" className="section-space">
      <div className="page-container">
        <div
          className={cn(
            "reveal-up grid gap-10 lg:grid-cols-12 lg:gap-14",
            inView && "is-visible",
          )}
        >
          <div className="lg:col-span-5">
            <SectionLabel>Why Trizen Community</SectionLabel>
            <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(1.7rem,2.8vw,2.35rem)] leading-[1.1] tracking-[-0.03em] text-foreground">
              More than a place to find events
            </h2>
            <p className="mt-4 max-w-[36ch] text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              One place to browse Hyderabad events, register in minutes, and
              walk into the room with everything you need.
            </p>
            <Link
              to="/events"
              className="btn-primary mt-7 inline-flex gap-2 !min-h-11"
            >
              Explore events
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
          </div>

          <ul
            className={cn(
              "stagger-in divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] lg:col-span-7",
              inView && "is-visible",
            )}
          >
            {whyPoints.map((item, index) => (
              <li
                key={item.title}
                className="grid gap-2 py-6 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-6 sm:py-7"
              >
                <span
                  className="font-display text-[0.95rem] font-semibold tabular-nums text-[var(--brand-accent)] sm:pt-0.5"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[1.15rem] tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 max-w-[42ch] text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      ref={ref}
      id="faq"
      className="section-space bg-[var(--color-background-alt)]"
    >
      <div className="page-container">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-12 lg:gap-12">
          <div
            className={cn("reveal-left lg:col-span-4", inView && "is-visible")}
          >
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,2.8vw,2.25rem)] tracking-tight text-foreground">
              Questions, answered
            </h2>
            <p className="mt-3 max-w-[30ch] text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              Straight answers about finding and registering for events.
            </p>
          </div>
          <div
            className={cn(
              "stagger-in-fast lg:col-span-8",
              inView && "is-visible",
            )}
          >
            {faqs.map((item, i) => {
              const open = openIndex === i;
              return (
                <div
                  key={item.q}
                  className="border-t border-[var(--color-border)] last:border-b"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 py-[18px] text-left"
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    <span className="font-display text-[1.02rem] tracking-tight text-foreground">
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-[1.2rem] leading-none text-[var(--brand-accent)] transition-transform duration-200",
                        open && "rotate-45",
                      )}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-[18px] pr-8 text-[14px] leading-[1.7] text-[var(--color-text-secondary)]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} className="section-space">
      <div className="page-container">
        <div
          className={cn(
            "reveal-up relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center shadow-[var(--shadow-card)] md:px-12 md:py-16",
            inView && "is-visible",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 50% 0%, color-mix(in oklab, var(--brand-accent) 12%, transparent), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-[16ch] font-display text-[clamp(2rem,4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-foreground">
              Find your next event.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.65] text-[var(--color-text-secondary)]">
              Discover what&apos;s happening in Hyderabad and find an experience
              worth showing up for.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/events"
                className="btn-primary inline-flex min-h-[48px] gap-2 !rounded-full px-6"
              >
                Explore Events
                <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StickyExploreBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero");
      if (!hero) return;
      setVisible(window.scrollY > hero.offsetHeight * 0.65);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-300 md:hidden",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white/95 px-3.5 py-2.5 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-md",
          !visible && "pointer-events-none",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-[0.04em] text-[var(--color-text-muted)]">
            Trizen Community
          </p>
          <p className="truncate text-[13px] font-medium text-foreground">
            Discover events in Hyderabad
          </p>
        </div>
        <Link
          to="/events"
          className="btn-primary shrink-0 gap-1.5 !min-h-10 !rounded-full !px-4 !text-[13px] !shadow-none"
        >
          Explore
        </Link>
      </div>
    </div>
  );
}

function Home() {
  const { upcoming, meetups, organizations } = Route.useLoaderData();
  const preview = upcoming.length > 0 ? upcoming : meetups.slice(0, 2);

  return (
    <div className="relative bg-[var(--color-background)] pb-24 md:pb-0">
      <HeroSection previewEvents={preview.slice(0, 2)} />
      <DiscoverySection events={upcoming} />
      <EventTypesSection />
      <CommunitiesSection organizations={organizations} events={meetups} />
      <AttendeeStepsSection />
      <WhySection />
      <FaqSection />
      <FinalCtaSection />
      <StickyExploreBar />
    </div>
  );
}
