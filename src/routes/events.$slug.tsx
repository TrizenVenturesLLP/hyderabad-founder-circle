import { type ReactNode } from "react";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Calendar,
  CircleParking,
  Clock,
  Coffee,
  ExternalLink,
  Handshake,
  Lightbulb,
  Linkedin,
  MapPin,
  MessageSquare,
  Rocket,
  Ticket,
  TrainFront,
  UserRound,
  Users,
  Accessibility,
} from "lucide-react";
import {
  getMeetupBySlug,
  isMeetupCompleted,
  isRsvpOpen,
  meetupMapsEmbedUrl,
  meetupMapsUrl,
  meetupVenueLine,
  type EventSpeaker,
} from "@/lib/events";
import { links } from "@/lib/links";
import { EventShareBar } from "@/components/EventShareBar";
import { RsvpButton } from "@/components/rsvp/RsvpButton";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/$slug")({
  loader: async ({ params }) => {
    const meetup = await getMeetupBySlug(params.slug);
    if (!meetup) throw notFound();
    if (params.slug !== meetup.slug) {
      throw redirect({
        to: "/events/$slug",
        params: { slug: meetup.slug },
      });
    }
    return { meetup };
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
    icon: UserRound,
  },
  {
    title: "Co-founders",
    desc: "Expand your network and exchange experiences.",
    icon: Users,
  },
  {
    title: "Builders",
    desc: "Developers, designers and engineers interested in startups.",
    icon: Lightbulb,
  },
  {
    title: "Product & Startup Operators",
    desc: "Connect with teams building high-growth companies.",
    icon: Briefcase,
  },
  {
    title: "Investors & Mentors",
    desc: "Meet founders and contribute to the ecosystem.",
    icon: Handshake,
  },
  {
    title: "Aspiring Entrepreneurs",
    desc: "Learn from real startup journeys before building your own.",
    icon: Rocket,
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
    title: "Snacks & Community Conversations",
    desc: "",
  },
];

const venueAmenities = [
  { label: "Parking Available", icon: CircleParking },
  { label: "Metro Nearby", icon: TrainFront },
  { label: "Wheelchair Accessible", icon: Accessibility },
  { label: "Coffee & Refreshments", icon: Coffee },
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
    a: "Light refreshments (or snacks) will be provided.",
  },
];

const eventGallery = [
  {
    src: "/july-2026-1.jpeg",
    alt: "Hyderabad Founders Network July meetup — group photo",
  },
  {
    src: "/july-2026-2.jpeg",
    alt: "Token of appreciation at the July founders meetup",
  },
  {
    src: "/july-2026-3.jpeg",
    alt: "Speaker recognition moment at the July meetup",
  },
  {
    src: "/july-2026-4.jpeg",
    alt: "Guest appreciation at Hyderabad Founders Network July",
  },
];

const trizenProducts = [
  {
    name: "TrizenHR",
    category: "Workforce Ops",
    tagline: "Standalone SaaS",
    desc: "Attendance and payroll in one place — clock in on web or mobile, manage leave, and get accurate payslips.",
    href: "https://trizenhr.com/",
    cta: "Learn More",
    image: "https://trizenventures.com/products/trizen-hr-v2.jpg",
    accent: "#3b2318",
    soft: "#efe5de",
    icon: Users,
  },
  {
    name: "TrizenDialog",
    category: "WhatsApp Ops",
    tagline: "Standalone console & API",
    desc: "Run WhatsApp notifications without the chaos — manage templates, sends, delivery status, and backend integrations in one console.",
    href: "https://trizendialog.extrahand.in/",
    cta: "Learn More",
    image: "https://trizenventures.com/products/trizen-dialog-card-v3.jpg",
    accent: "#5a6b4e",
    soft: "#e8efe4",
    icon: MessageSquare,
  },
  {
    name: "Trizen Courses",
    category: "Learning",
    tagline: "Industry-ready programs",
    desc: "Practical courses and bootcamps in web development, AI, and building — designed for aspiring builders.",
    href: "https://courses.trizenventures.com/",
    cta: "Learn More",
    image: "/image.png" as string | null,
    accent: "#d8643c",
    soft: "#f6ded3",
    icon: BookOpen,
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

function speakerInitials(name: string) {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SpeakerCard({ speaker }: { speaker: EventSpeaker }) {
  return (
    <article className="mx-auto w-full max-w-[20.5rem] px-2 py-2.5 sm:max-w-none">
      {/*
        IMAGE CONTAINER (fixed size)
        - image lives inside
        - overlay + text live inside
        - photoPaddingBottom only moves the image up; container/overlay size unchanged
        - article padding slightly shrinks the box without changing grid gaps
      */}
      <div className="group relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-black">
        {/* Image layer — bottom inset lifts this photo only; overflow clipped */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 overflow-hidden"
            style={{ bottom: speaker.photoPaddingBottom ?? 0 }}
          >
            {speaker.photo ? (
              <img
                src={speaker.photo}
                alt=""
                className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                style={{
                  objectPosition: speaker.photoPosition ?? "center top",
                }}
              />
            ) : (
              <div
                className="flex size-full items-center justify-center bg-[linear-gradient(160deg,color-mix(in_oklab,var(--brand-primary)_92%,white),var(--brand-primary))]"
                aria-hidden
              >
                <span className="font-display text-[2.5rem] tracking-tight text-white/90">
                  {speakerInitials(speaker.name)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Overlay layer — softer so more of the photo stays visible */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(to_top,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.45)_42%,rgba(0,0,0,0.12)_72%,transparent_100%)]"
        />

        {speaker.badge ? (
          <span className="absolute left-3.5 top-3.5 z-20 rounded-full bg-[var(--brand-accent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            {speaker.badge}
          </span>
        ) : null}

        {/* Text sits on the overlay, inside the image container */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-4 sm:p-5">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-[1.15rem] leading-snug tracking-tight text-white sm:text-[1.25rem]">
                {speaker.name}
              </h3>
              <p className="mt-1 text-[12px] leading-snug text-white/75 sm:text-[13px]">
                {speaker.role}
                {speaker.org ? (
                  <>
                    <br />
                    <span className="text-white/90">{speaker.org}</span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
              {speaker.linkedin ? (
                <a
                  href={speaker.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${speaker.name} on LinkedIn`}
                  className="inline-flex size-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-white/20"
                >
                  <Linkedin className="size-3.5" strokeWidth={1.75} />
                </a>
              ) : null}
              {speaker.website ? (
                <a
                  href={speaker.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${speaker.name} website`}
                  className="inline-flex size-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-white/20"
                >
                  <ExternalLink className="size-3.5" strokeWidth={1.75} />
                </a>
              ) : null}
            </div>
          </div>

          <p className="mt-2.5 border-t border-white/15 pt-2.5 text-[12px] leading-[1.55] text-white/80 italic sm:text-[13px]">
            {speaker.bio}
          </p>
        </div>
      </div>
    </article>
  );
}

function EventDetail() {
  const { meetup } = Route.useLoaderData();
  const mapsUrl = meetupMapsUrl(meetup);
  const mapsEmbed = meetupMapsEmbedUrl(meetup);
  const hosts = meetup.hosts ?? [];
  const speakers = meetup.speakers ?? [];
  const venueLine = meetupVenueLine(meetup);
  const whoReveal = useInView<HTMLElement>(scrollRevealOpts);
  const takeawaysReveal = useInView<HTMLElement>(scrollRevealOpts);
  const speakersReveal = useInView<HTMLElement>(scrollRevealOpts);
  const faqReveal = useInView<HTMLElement>(scrollRevealOpts);
  const galleryReveal = useInView<HTMLElement>(scrollRevealOpts);
  const offeringsReveal = useInView<HTMLElement>(scrollRevealOpts);
  const completed = isMeetupCompleted(meetup);

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
              <p className="mt-3 pb-8 text-[13px] text-[var(--color-text-muted)] md:pb-12">
                Registration is required due to limited capacity.
              </p>
            </div>

            <div className="flex flex-col gap-5 lg:col-span-5">
              <ul className="min-w-0 lg:border-l lg:border-[var(--color-border)] lg:pl-8">
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
              <EventShareBar
                meetup={meetup}
                orientation="horizontal"
                className="lg:pl-8"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. WHY */}
      <section className="border-b border-[var(--color-border)] py-12 md:py-16">
        <div className="page-container">
          <Reveal className="grid gap-6 lg:grid-cols-12 lg:gap-12" variant="up">
            <div className="lg:col-span-5">
              <SectionLabel>Why this meetup?</SectionLabel>
              <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(1.5rem,2.5vw,2.05rem)] leading-[1.15] tracking-tight text-foreground">
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

      {/* 3. EVENT HIGHLIGHTS (gallery) — completed only, right after Why */}
      {completed ? (
        <section
          ref={galleryReveal.ref}
          className="border-b border-[var(--color-border)] bg-[var(--color-background)] py-12 md:py-16"
        >
          <div className="page-container">
            <div
              className={cn(
                "reveal-up flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
                galleryReveal.inView && "is-visible",
              )}
            >
              <div>
                <SectionLabel>Event Highlights</SectionLabel>
                <h2 className="mt-2 font-display text-[clamp(1.35rem,2.2vw,1.75rem)] tracking-tight text-foreground">
                  Moments that mattered
                </h2>
              </div>
              <p className="max-w-sm text-[13px] leading-relaxed text-[var(--color-text-secondary)] sm:text-right">
                Snapshots from the July meetup.
              </p>
            </div>

            <div
              className={cn(
                "reveal-up mt-5 grid gap-4 lg:grid-cols-12 lg:items-stretch",
                galleryReveal.inView && "is-visible",
              )}
            >
              <figure
                className={cn(
                  "reveal-up relative aspect-[16/10] overflow-hidden rounded-[12px] bg-[var(--color-background-warm)] lg:col-span-8 lg:aspect-auto lg:min-h-[28rem]",
                  galleryReveal.inView && "is-visible",
                )}
                style={{
                  transitionDelay: galleryReveal.inView ? "40ms" : undefined,
                }}
              >
                <img
                  src={eventGallery[0].src}
                  alt={eventGallery[0].alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </figure>

              <ul className="grid list-none grid-cols-3 gap-2.5 lg:col-span-4 lg:grid-cols-1 lg:grid-rows-3 lg:gap-4">
                {eventGallery.slice(1).map((shot, i) => (
                  <li
                    key={shot.alt}
                    className={cn(
                      "reveal-up min-h-0",
                      galleryReveal.inView && "is-visible",
                    )}
                    style={{
                      transitionDelay: galleryReveal.inView
                        ? `${90 + i * 50}ms`
                        : undefined,
                    }}
                  >
                    <figure className="relative aspect-[4/3] h-full overflow-hidden rounded-[10px] bg-[var(--color-background-warm)] lg:aspect-auto">
                      <img
                        src={shot.src}
                        alt={shot.alt}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                      />
                    </figure>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={cn(
                "reveal-up mt-8 max-w-2xl border-t border-[var(--color-border)] pt-7",
                galleryReveal.inView && "is-visible",
              )}
              style={{
                transitionDelay: galleryReveal.inView ? "160ms" : undefined,
              }}
            >
              <SectionLabel>July Meetup Recap</SectionLabel>
              <p className="mt-3 text-[15px] leading-[1.75] text-[var(--color-text-secondary)] md:text-[16px]">
                Founders, operators, and aspiring entrepreneurs came together to
                exchange ideas, hear founder stories, and build lasting
                connections. Thank you to everyone who joined us.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. WHO */}
      <section
        ref={whoReveal.ref}
        className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)] py-12 md:py-16"
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
            {whoFor.map((item, i) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className={cn(
                    "reveal-up border-t border-[var(--color-border)] py-7",
                    whoReveal.inView && "is-visible",
                  )}
                  style={{
                    transitionDelay: whoReveal.inView
                      ? `${60 + i * 45}ms`
                      : undefined,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-[var(--brand-accent)]"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="font-display text-[1.05rem] tracking-tight text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 5 + 6. TAKEAWAYS + AGENDA */}
      <section
        ref={takeawaysReveal.ref}
        className="border-b border-[var(--color-border)] py-12 md:py-16"
      >
        <div className="page-container grid gap-7 lg:grid-cols-2 lg:gap-8">
          <div
            className={cn(
              "reveal-left",
              takeawaysReveal.inView && "is-visible",
            )}
          >
            <SectionLabel>What you'll get</SectionLabel>
            <h2 className="mt-2 font-display text-[clamp(1.35rem,2.2vw,1.75rem)] tracking-tight text-foreground">
              What you'll take away
            </h2>
            <ul className="mt-4 space-y-2">
              {takeaways.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[13px] leading-snug text-foreground md:text-[14px]"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--brand-accent)]"
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
              transitionDelay: takeawaysReveal.inView ? "80ms" : undefined,
            }}
          >
            <SectionLabel>What happens during the meetup?</SectionLabel>
            <h2 className="mt-2 font-display text-[clamp(1.35rem,2.2vw,1.75rem)] tracking-tight text-foreground">
              Event Agenda
            </h2>
            <ol className="relative mt-4 border-l border-[var(--color-border-strong)] pl-4">
              {agenda.map((step) => (
                <li
                  key={step.time + step.title}
                  className="relative pb-3.5 last:pb-0"
                >
                  <span
                    className="absolute top-1.5 -left-[1.15rem] size-1.5 rounded-full bg-[var(--brand-accent)]"
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <p className="text-[12px] font-bold tabular-nums text-[var(--brand-accent)] md:text-[13px]">
                      {step.time}
                    </p>
                    <p className="text-[13px] font-medium tracking-tight text-foreground md:text-[14px]">
                      {step.title}
                    </p>
                  </div>
                  {step.desc ? (
                    <p className="mt-1 text-[12px] leading-[1.8] text-[var(--color-text-secondary)]">
                      {step.desc}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 5b. SPEAKERS */}
      {speakers.length > 0 ? (
        <section
          ref={speakersReveal.ref}
          className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)] py-12 md:py-16"
        >
          <div className="page-container">
            <div
              className={cn(
                "reveal-up max-w-2xl",
                speakersReveal.inView && "is-visible",
              )}
            >
              <SectionLabel>Speakers</SectionLabel>
              <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
                Meet Our Speakers
              </h2>
              <p className="mt-3 text-[14px] leading-[1.65] text-[var(--color-text-secondary)] md:text-[15px]">
                Learn from industry leaders, founders, and innovators sharing
                their insights and experiences.
              </p>
            </div>

            <ul className="mt-9 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {speakers.map((speaker, i) => (
                <li
                  key={speaker.name}
                  className={cn(
                    "reveal-up",
                    speakersReveal.inView && "is-visible",
                  )}
                  style={{
                    transitionDelay: speakersReveal.inView
                      ? `${70 + i * 70}ms`
                      : undefined,
                  }}
                >
                  <SpeakerCard speaker={speaker} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* 6. HOSTS — only when hosts or guest founder exist */}
      {hosts.length > 0 || meetup.guestFounder ? (
        <section className="border-b border-[var(--color-border)] py-12 md:py-16">
          <div className="page-container">
            <Reveal variant="up">
              <SectionLabel>Featured community members</SectionLabel>
              <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
                Community Hosts
              </h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
                Each meetup is led by founders from the community — not speakers
                on a stage.
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
              ) : null}

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
      ) : null}

      {/* 7. VENUE */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)] py-12 md:py-16">
        <div className="page-container">
          <Reveal variant="up">
            <SectionLabel>Venue</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
              {meetup.venue}
            </h2>
            <p className="mt-1.5 text-[14px] text-[var(--color-text-secondary)]">
              {meetup.area ?? "Gachibowli"}, {meetup.city}
            </p>

            <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
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

      {/* After venue: completed → Trizen; open → Registration + FAQ */}
      {completed ? (
        <>
          <section
            ref={offeringsReveal.ref}
            className="border-b border-[var(--color-border)] bg-[var(--color-background)] py-12 md:py-16"
          >
            <div className="page-container">
              <div
                className={cn(
                  "reveal-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
                  offeringsReveal.inView && "is-visible",
                )}
              >
                <div className="max-w-2xl">
                  <SectionLabel>Company</SectionLabel>
                  <h2 className="mt-3 font-display text-[clamp(1.5rem,2.5vw,2.05rem)] tracking-tight text-foreground">
                    Continue your journey with Trizen
                  </h2>
                  <p className="mt-2 text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
                    Products and community initiatives from the company behind
                    this meetup.
                  </p>
                </div>
                <a
                  href="https://trizenventures.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary shrink-0 gap-1.5"
                >
                  Visit Trizen
                  <ExternalLink className="size-3.5" strokeWidth={1.75} />
                </a>
              </div>

              <ul
                className={cn(
                  "reveal-up mt-8 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5",
                  offeringsReveal.inView && "is-visible",
                )}
              >
                {trizenProducts.map((product) => {
                  const Icon = product.icon;
                  return (
                    <li
                      key={product.name}
                      className="flex h-full flex-col overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)]"
                    >
                      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-[var(--color-background-warm)]">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={`${product.name} preview`}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover object-top"
                          />
                        ) : (
                          <div
                            className="absolute inset-0 flex items-end p-4"
                            style={{ background: product.soft }}
                          >
                            <span
                              className="flex size-11 items-center justify-center rounded-xl text-white shadow-sm"
                              style={{ background: product.accent }}
                            >
                              <Icon className="size-5" strokeWidth={1.75} />
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
                          {product.category}
                        </p>
                        <h3 className="mt-1.5 font-display text-[1.2rem] tracking-tight text-foreground">
                          {product.name}
                        </h3>
                        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                          {product.desc}
                        </p>
                        <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
                          {product.tagline}
                        </p>
                        <a
                          href={product.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--brand-accent)] transition-colors hover:text-[var(--brand-accent-hover)]"
                        >
                          {product.cta}
                          <ArrowUpRight className="size-3.5" strokeWidth={2} />
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <p
                className={cn(
                  "reveal-up mt-8 text-center text-[13px] text-[var(--color-text-muted)]",
                  offeringsReveal.inView && "is-visible",
                )}
              >
                An initiative of{" "}
                <a
                  href={links.sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Trizen Ventures
                </a>
                .
              </p>
            </div>
          </section>
        </>
      ) : (
        <>
          <section
            id="register"
            ref={faqReveal.ref}
            className="border-b border-[var(--color-border)] bg-[var(--color-background-warm)] py-12 md:py-16"
          >
            <div className="page-container grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div
                className={cn("reveal-left", faqReveal.inView && "is-visible")}
              >
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

          <section className="border-t border-[var(--color-border)] bg-[var(--color-background-alt)] py-12 md:py-16">
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
                    When you attend, you also become part of a growing community
                    that continues beyond monthly events. Stay connected through
                    our WhatsApp community, future meetups, founder stories and
                    ecosystem initiatives.
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
        </>
      )}
    </article>
  );
}
