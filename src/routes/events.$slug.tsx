import { type ReactNode } from "react";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Calendar,
  CircleParking,
  Clock,
  Coffee,
  MapPin,
  Ticket,
  TrainFront,
  Users,
  Accessibility,
} from "lucide-react";
import eventImg from "@/assets/event-room.jpg";
import tableImg from "@/assets/table-detail.jpg";
import heroImg from "@/assets/hero-rooftop.jpg";
import {
  findMeetupBySlug,
  isRsvpOpen,
  meetupMapsEmbedUrl,
  meetupMapsUrl,
  meetupVenueLine,
} from "@/lib/events";
import { links } from "@/lib/links";
import { EventShareBar } from "@/components/EventShareBar";
import { RsvpButton } from "@/components/rsvp/RsvpButton";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/$slug")({
  loader: ({ params }) => {
    const m = findMeetupBySlug(params.slug);
    if (!m) throw notFound();
    if (params.slug !== m.slug) {
      throw redirect({
        to: "/events/$slug",
        params: { slug: m.slug },
      });
    }
    return { meetup: m };
  },
  head: ({ loaderData }) => {
    const m = loaderData?.meetup;
    const title = m
      ? `${m.title} — Hyderabad Founders Network`
      : "Meetup — Hyderabad Founders Network";
    const desc = m
      ? `${m.dateLabel} · ${m.time} · ${meetupVenueLine(m)}. Community-led monthly meetup.`
      : "Community-led meetup in Hyderabad.";
    const path = m ? `/events/${m.slug}` : "/events";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "event" },
        { property: "og:url", content: path },
      ],
      links: [{ rel: "canonical", href: path }],
      scripts: m
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Event",
                name: m.title,
                description: m.blurb,
                startDate: m.dateISO,
                eventAttendanceMode:
                  "https://schema.org/OfflineEventAttendanceMode",
                eventStatus: "https://schema.org/EventScheduled",
                location: {
                  "@type": "Place",
                  name: m.venue,
                  address: m.address ?? `${m.venue}, ${m.city}, India`,
                },
                organizer: {
                  "@type": "Organization",
                  name: "Hyderabad Founders Network",
                },
                isAccessibleForFree: true,
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "INR",
                  availability: "https://schema.org/InStock",
                  url: `https://community.trizenventures.com/events/${m.slug}`,
                },
              }),
            },
          ]
        : [],
    };
  },
  component: EventDetail,
});

const whoFor = [
  {
    title: "Startup Founders",
    desc: "Meet other founders solving similar challenges.",
  },
  {
    title: "Co-founders",
    desc: "Expand your network and exchange experiences.",
  },
  {
    title: "Builders",
    desc: "Developers, designers and engineers interested in startups.",
  },
  {
    title: "Product & Startup Operators",
    desc: "Connect with teams building high-growth companies.",
  },
  {
    title: "Investors & Mentors",
    desc: "Meet founders and contribute to the ecosystem.",
  },
  {
    title: "Aspiring Entrepreneurs",
    desc: "Learn from real startup journeys before building your own.",
  },
];

const takeaways = [
  "Meaningful founder conversations",
  "Insights from real startup experiences",
  "Collaboration opportunities",
  "Connections with mentors and ecosystem partners",
  "Practical lessons from fellow founders",
  "Access to Hyderabad's growing startup community",
];

const agenda = [
  {
    time: "11:00 AM",
    title: "Registration & Welcome",
    desc: "",
  },
  {
    time: "11:20 AM",
    title: "Founder Introductions",
    desc: "Meet the people in the room.",
  },
  {
    time: "11:40 AM",
    title: "Founder Story",
    desc: "A community member shares lessons from building a startup.",
  },
  {
    time: "12:10 PM",
    title: "Roundtable Discussions",
    desc: "Small-group conversations around startup challenges and opportunities.",
  },
  {
    time: "12:40 PM",
    title: "Open Networking",
    desc: "Continue conversations and make meaningful connections.",
  },
  {
    time: "1:00 PM",
    title: "Lunch & Community Conversations",
    desc: "",
  },
];

const venueAmenities = [
  { label: "Parking Available", icon: CircleParking },
  { label: "Metro Nearby", icon: TrainFront },
  { label: "Wheelchair Accessible", icon: Accessibility },
  { label: "Coffee & Refreshments", icon: Coffee },
];

const gallery = [
  {
    src: eventImg,
    alt: "Founder interactions at a previous meetup",
    caption: "Founder interactions",
  },
  {
    src: tableImg,
    alt: "Roundtable discussion notes and conversation",
    caption: "Roundtable discussions",
  },
  {
    src: heroImg,
    alt: "Community networking outdoors",
    caption: "Networking",
  },
];

const quotes = [
  "I met two founders working on similar problems and we've stayed in touch ever since.",
  "The conversations felt genuine—not like typical networking events.",
  "One introduction at the meetup eventually became our first paying customer.",
];

const faqs = [
  {
    q: "Is this event free?",
    a: "Yes. Registration is free but required.",
  },
  {
    q: "Can I attend if I'm not a founder?",
    a: "Absolutely. Builders, startup operators, mentors, investors and aspiring entrepreneurs are welcome.",
  },
  {
    q: "Can I come alone?",
    a: "Yes. Many attendees come individually and meet new people during the event.",
  },
  {
    q: "What should I bring?",
    a: "Your curiosity, business cards (optional) and an open mindset.",
  },
  {
    q: "Is parking available?",
    a: "Yes. Parking details will be shared after registration.",
  },
  {
    q: "Will there be food?",
    a: "Light refreshments (or lunch) will be provided.",
  },
];

const scrollRevealOpts = {
  once: true,
  threshold: 0.12,
  rootMargin: "0px 0px -8% 0px",
} as const;

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

function Reveal({
  children,
  className,
  variant = "up",
  delay,
}: {
  children: ReactNode;
  className?: string;
  variant?: "up" | "left" | "right" | "fade";
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(scrollRevealOpts);
  return (
    <div
      ref={ref}
      className={cn(`reveal-${variant}`, inView && "is-visible", className)}
      style={
        delay != null && inView ? { transitionDelay: `${delay}ms` } : undefined
      }
    >
      {children}
    </div>
  );
}

function MetaRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Calendar;
}) {
  return (
    <li className="flex gap-3 border-b border-[var(--color-border)] py-3 first:pt-0 last:border-b-0 last:pb-0">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-[var(--brand-accent)]"
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          {label}
        </p>
        <p className="mt-0.5 text-[14px] leading-snug text-foreground">{value}</p>
      </div>
    </li>
  );
}

function EventDetail() {
  const { meetup } = Route.useLoaderData();
  const mapsUrl = meetupMapsUrl(meetup);
  const mapsEmbed = meetupMapsEmbedUrl(meetup);
  const hosts = meetup.hosts ?? [];
  const venueLine = meetupVenueLine(meetup);
  const whoReveal = useInView<HTMLElement>(scrollRevealOpts);
  const takeawaysReveal = useInView<HTMLElement>(scrollRevealOpts);
  const galleryReveal = useInView<HTMLElement>(scrollRevealOpts);
  const faqReveal = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <article className="bg-[var(--color-background)]">
      {/* 1. HERO */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)]">
        <div className="page-container py-7 md:py-9">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-[var(--color-text-secondary)]"
          >
            <Link
              to="/events"
              className="transition-colors duration-200 hover:text-foreground"
            >
              Events
            </Link>
            <span aria-hidden className="text-[var(--color-border-strong)]">
              /
            </span>
            <span className="truncate text-foreground/80">{meetup.title}</span>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:col-span-7">
              <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
                <MapPin className="size-3.5" aria-hidden />
                Hyderabad · Monthly Meetup · Community-led
              </p>

              <h1 className="mt-3 max-w-[22ch] font-display text-[clamp(1.85rem,3.4vw,2.75rem)] leading-[1.06] tracking-[-0.035em] text-foreground">
                {meetup.title}
              </h1>
              <p className="mt-4 max-w-xl text-[14px] leading-[1.65] text-[var(--color-text-secondary)] md:text-[15px]">
                {meetup.blurb}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <RsvpButton event={meetup} className="btn-primary">
                  Register Now
                </RsvpButton>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Get Directions
                </a>
              </div>
              <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
                Registration is required due to limited capacity.
              </p>
            </div>

            <div className="flex flex-col gap-5 lg:col-span-5 lg:flex-row lg:items-start lg:gap-4">
              <EventShareBar
                meetup={meetup}
                orientation="vertical"
                className="shrink-0 lg:pt-0.5"
              />
              <ul className="min-w-0 flex-1 lg:border-l lg:border-[var(--color-border)] lg:pl-8">
                <MetaRow label="Date" value={meetup.dateLabel} icon={Calendar} />
                <MetaRow label="Time" value={meetup.time} icon={Clock} />
                <MetaRow label="Venue" value={venueLine} icon={MapPin} />
                <MetaRow
                  label="Registration"
                  value="Free Registration"
                  icon={Ticket}
                />
                <MetaRow label="Seats" value="Limited Seats" icon={Users} />
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* 2. WHY */}
      <section className="border-b border-[var(--color-border)] py-10 md:py-12">
        <div className="page-container">
          <Reveal className="grid gap-6 lg:grid-cols-12 lg:gap-12" variant="up">
            <div className="lg:col-span-5">
              <SectionLabel>Why this meetup?</SectionLabel>
              <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(1.5rem,2.5vw,2.05rem)] leading-[1.1] tracking-tight text-foreground">
                More than networking. A community that grows together.
              </h2>
            </div>
            <div className="max-w-2xl space-y-3.5 text-[14px] leading-[1.7] text-[var(--color-text-secondary)] md:text-[15px] lg:col-span-7">
              <p>Most startup events end when everyone leaves the room.</p>
              <p>
                At Hyderabad Founders Network, every meetup is an opportunity to
                build relationships that continue beyond the event.
              </p>
              <p>
                Whether you're building your first startup or scaling your next
                venture, you'll meet people who understand the journey and are
                willing to share their experiences, ideas and support.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. WHO */}
      <section
        ref={whoReveal.ref}
        className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)] py-10 md:py-12"
      >
        <div className="page-container">
          <div
            className={cn(
              "reveal-up max-w-2xl",
              whoReveal.inView && "is-visible",
            )}
          >
            <SectionLabel>Is this meetup for you?</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
              Who should attend?
            </h2>
          </div>
          <ul className="mt-8 grid list-none gap-x-10 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {whoFor.map((item, i) => (
              <li
                key={item.title}
                className={cn(
                  "reveal-up border-t border-[var(--color-border)] py-5",
                  whoReveal.inView && "is-visible",
                )}
                style={{
                  transitionDelay: whoReveal.inView
                    ? `${60 + i * 45}ms`
                    : undefined,
                }}
              >
                <p className="font-display text-[1.05rem] tracking-tight text-foreground">
                  {item.title}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  {item.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 + 5. TAKEAWAYS + AGENDA */}
      <section
        ref={takeawaysReveal.ref}
        className="border-b border-[var(--color-border)] py-10 md:py-12"
      >
        <div className="page-container grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div
            className={cn(
              "reveal-left",
              takeawaysReveal.inView && "is-visible",
            )}
          >
            <SectionLabel>What you'll get</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
              What you'll take away
            </h2>
            <ul className="mt-6 space-y-3">
              {takeaways.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[14px] leading-[1.55] text-foreground"
                >
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--brand-accent)]"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={cn(
              "reveal-right",
              takeawaysReveal.inView && "is-visible",
            )}
            style={{
              transitionDelay: takeawaysReveal.inView ? "100ms" : undefined,
            }}
          >
            <SectionLabel>What happens during the meetup?</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
              Event Agenda
            </h2>
            <ol className="relative mt-6 space-y-0 border-l border-[var(--color-border-strong)] pl-5">
              {agenda.map((step) => (
                <li
                  key={step.time + step.title}
                  className="relative pb-5 last:pb-0"
                >
                  <span
                    className="absolute top-1.5 -left-[1.4rem] size-2 rounded-full bg-[var(--brand-accent)]"
                    aria-hidden
                  />
                  <p className="text-[12px] font-semibold tabular-nums text-[var(--brand-accent)]">
                    {step.time}
                  </p>
                  <p className="mt-0.5 text-[14px] font-medium tracking-tight text-foreground">
                    {step.title}
                  </p>
                  {step.desc ? (
                    <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
                      {step.desc}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 6. HOSTS */}
      <section className="border-b border-[var(--color-border)] py-10 md:py-12">
        <div className="page-container">
          <Reveal variant="up">
            <SectionLabel>Featured community members</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
              Community Hosts
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
              Each meetup is led by founders from the community — not speakers on
              a stage.
            </p>

            {hosts.length > 0 ? (
              <ul className="mt-7 grid gap-6 sm:grid-cols-2">
                {hosts.map((host, i) => (
                  <li key={`${host.name}-${i}`} className="flex gap-3.5">
                    {host.photo ? (
                      <img
                        src={host.photo}
                        alt=""
                        className="size-12 shrink-0 rounded-full object-cover"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary-soft)] text-sm font-medium text-[var(--color-text-secondary)]"
                        aria-hidden
                      >
                        {host.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium tracking-tight text-foreground">
                        {host.name}
                      </p>
                      <p className="mt-0.5 text-[13px] text-[var(--color-text-secondary)]">
                        {host.role}
                        {host.startup ? ` · ${host.startup}` : ""}
                      </p>
                      <a
                        href={host.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--brand-accent)] underline-offset-4 hover:underline"
                      >
                        LinkedIn
                        <ArrowUpRight className="size-3.5" aria-hidden />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-[14px] text-[var(--color-text-secondary)]">
                Hosts for this meetup will be announced soon.{" "}
                <Link
                  to="/contact"
                  className="font-medium text-foreground underline-offset-4 hover:text-[var(--brand-accent)] hover:underline"
                >
                  Want to host?
                </Link>
              </p>
            )}

            {meetup.guestFounder ? (
              <div className="mt-8 border-t border-[var(--color-border)] pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
                  Optional Guest Founder
                </p>
                <div className="mt-3 flex gap-3.5">
                  {meetup.guestFounder.photo ? (
                    <img
                      src={meetup.guestFounder.photo}
                      alt=""
                      className="size-12 shrink-0 rounded-full object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary-soft)] text-sm font-medium text-[var(--color-text-secondary)]"
                      aria-hidden
                    >
                      {meetup.guestFounder.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-[15px] font-medium tracking-tight text-foreground">
                      {meetup.guestFounder.name}
                    </p>
                    <p className="mt-1 max-w-xl text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">
                      {meetup.guestFounder.bio}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </Reveal>
        </div>
      </section>

      {/* 7. VENUE */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)] py-10 md:py-12">
        <div className="page-container">
          <Reveal variant="up">
            <SectionLabel>Venue</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
              {meetup.venue}
            </h2>
            <p className="mt-1.5 text-[14px] text-[var(--color-text-secondary)]">
              {meetup.area ?? "Gachibowli"}, {meetup.city}
            </p>

            <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
              <div className="overflow-hidden rounded-[16px] border border-[var(--color-border)] lg:col-span-7">
                <iframe
                  title={`Map of ${meetup.venue}`}
                  src={mapsEmbed}
                  className="aspect-[16/10] w-full border-0 lg:aspect-[16/9]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <div className="lg:col-span-5">
                <h3 className="font-display text-[1.15rem] tracking-tight text-foreground">
                  Venue Information
                </h3>
                <ul className="mt-4 space-y-3">
                  {venueAmenities.map(({ label, icon: Icon }) => (
                    <li
                      key={label}
                      className="flex items-center gap-3 text-[14px] text-foreground"
                    >
                      <Icon
                        className="size-4 text-[var(--brand-accent)]"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      {label}
                    </li>
                  ))}
                </ul>
                {meetup.address ? (
                  <p className="mt-5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                    {meetup.address}
                  </p>
                ) : null}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. PREVIOUS */}
      <section
        ref={galleryReveal.ref}
        className="border-b border-[var(--color-border)] py-10 md:py-12"
      >
        <div className="page-container">
          <div
            className={cn(
              "reveal-up max-w-xl",
              galleryReveal.inView && "is-visible",
            )}
          >
            <SectionLabel>Previous meetups</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
              A glimpse into our community
            </h2>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {gallery.map((shot, i) => (
              <figure
                key={shot.caption}
                className={cn(
                  "reveal-up relative overflow-hidden rounded-[16px]",
                  i === 0 && "sm:col-span-2 sm:row-span-2",
                  galleryReveal.inView && "is-visible",
                )}
                style={{
                  transitionDelay: galleryReveal.inView
                    ? `${80 + i * 70}ms`
                    : undefined,
                }}
              >
                <img
                  src={shot.src}
                  alt={shot.alt}
                  width={1400}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className={
                    i === 0
                      ? "aspect-[4/3] w-full object-cover sm:aspect-auto sm:h-full sm:min-h-[18rem]"
                      : "aspect-[4/3] w-full object-cover"
                  }
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-8 text-[12px] font-medium text-white">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {quotes.map((q, i) => (
              <figure
                key={q}
                className={cn(
                  "reveal-up",
                  galleryReveal.inView && "is-visible",
                )}
                style={{
                  transitionDelay: galleryReveal.inView
                    ? `${220 + i * 70}ms`
                    : undefined,
                }}
              >
                <span
                  className="font-display text-[2rem] leading-none text-[var(--brand-accent)]/30"
                  aria-hidden
                >
                  “
                </span>
                <blockquote className="mt-1 font-display text-[1.02rem] leading-snug tracking-tight text-foreground">
                  {q}
                </blockquote>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 9. REGISTRATION + 10. FAQ */}
      <section
        id="register"
        ref={faqReveal.ref}
        className="border-b border-[var(--color-border)] bg-[var(--color-background-warm)] py-10 md:py-12"
      >
        <div className="page-container grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className={cn("reveal-left", faqReveal.inView && "is-visible")}>
            <SectionLabel>Registration</SectionLabel>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
                Reserve Your Seat
              </h2>
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <RsvpButton event={meetup} className="btn-primary">
                  Register Now
                </RsvpButton>
                {isRsvpOpen(meetup) ? null : (
                  <p className="text-[13px] text-[var(--color-text-muted)]">
                    Registration opens closer to the event date.
                  </p>
                )}
              </div>
            </div>
            <p className="mt-3 max-w-xl text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
              Free registration. Limited capacity — reserve your seat to join
              this meetup.
            </p>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-[var(--color-text-muted)]">
              We'll send your confirmation email, venue details and WhatsApp
              community link after registration.
            </p>
          </div>

          <div
            className={cn("reveal-right", faqReveal.inView && "is-visible")}
            style={{
              transitionDelay: faqReveal.inView ? "90ms" : undefined,
            }}
          >
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
              Common questions
            </h2>
            <dl className="mt-5 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {faqs.map((f) => (
                <div key={f.q} className="py-3.5">
                  <dt className="text-[14px] font-semibold tracking-tight text-foreground">
                    {f.q}
                  </dt>
                  <dd className="mt-1.5 text-[13px] leading-[1.6] text-[var(--color-text-secondary)]">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 11. COMMUNITY CTA */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-background-alt)] py-10 md:py-12">
        <div className="page-container">
          <Reveal
            className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10"
            variant="up"
          >
            <div className="max-w-2xl">
              <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
                This meetup is just the beginning.
              </h2>
              <p className="mt-3 text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
                When you attend, you also become part of a growing community that
                continues beyond monthly events. Stay connected through our
                WhatsApp community, future meetups, founder stories and ecosystem
                initiatives.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <a
                href={links.community}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Join Community
              </a>
              <Link to="/events" className="btn-secondary">
                Upcoming Events
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  );
}
