import { Fragment, type ReactNode } from "react";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  CircleParking,
  Clock,
  Coffee,
  ExternalLink,
  Handshake,
  Hourglass,
  Lightbulb,
  Linkedin,
  MapPin,
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
  meetupDateLabel,
  isMeetupDateConfirmed,
  meetupSeatsLabel,
  type EventSpeaker,
} from "@/lib/events";
import { getEventPageContent, type EventPartner } from "@/lib/event-page-content";
import { REGISTRATION_FEE_INR } from "@/lib/api";
import { links } from "@/lib/links";
import { EventShareBar } from "@/components/EventShareBar";
import { RsvpButton } from "@/components/rsvp/RsvpButton";
import { TrizenProductsSection } from "@/components/TrizenProductsSection";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
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
      ? `${meetupDateLabel(m)} · ${m.time} · ${meetupVenueLine(m)}. Community-led monthly meetup.`
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
                ...(isMeetupDateConfirmed(m) ? { startDate: m.dateISO } : {}),
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
                isAccessibleForFree: false,
                offers: {
                  "@type": "Offer",
                  price: String(REGISTRATION_FEE_INR),
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
  {
    title: "Meaningful founder conversations",
    body: "Talk through real challenges with people building at a similar stage.",
  },
  {
    title: "Insights from real startup experiences",
    body: "Lessons from the room — not polished keynotes.",
  },
  {
    title: "Collaboration opportunities",
    body: "Find design partners, co-builders, and people to ship with.",
  },
  {
    title: "Mentor & ecosystem connections",
    body: "Meet operators, mentors, and partners who keep showing up.",
  },
  {
    title: "Practical lessons from peers",
    body: "Pricing, hiring, GTM — what founders are actually doing.",
  },
  {
    title: "A community that continues",
    body: "Stay connected beyond one Saturday through WhatsApp and meetups.",
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
    a: `Registration is ₹${REGISTRATION_FEE_INR} per person and is required due to limited capacity.`,
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

const scrollRevealOpts = {
  once: true,
  threshold: 0.14,
  rootMargin: "0px 0px -10% 0px",
} as const;

const heroRevealOpts = {
  once: true,
  threshold: 0.08,
  rootMargin: "0px 0px -4% 0px",
} as const;

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

function PartnerTile({
  partner,
  compact = false,
}: {
  partner: EventPartner;
  compact?: boolean;
}) {
  const arrow = compact ? null : (
    <ArrowUpRight
      className="ml-auto size-3.5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--brand-accent)]"
      strokeWidth={1.75}
      aria-hidden
    />
  );

  const inner = (
    <>
      {partner.logo ? (
        <img
          src={partner.logo}
          alt=""
          className={cn(
            compact ? "h-7" : "h-8",
            "shrink-0 object-contain",
            partner.logoSquare
              ? "w-7 object-contain md:h-8 md:w-8"
              : partner.logoRounded
                ? "w-7 rounded-full object-cover md:h-8 md:w-8"
                : "w-auto max-w-[5.5rem] md:max-w-[6.5rem]",
          )}
        />
      ) : null}
      {!compact ? (
        <span className="min-w-0 text-[13.5px] font-medium leading-snug text-foreground transition-colors group-hover:text-[var(--brand-accent)]">
          {partner.name}
        </span>
      ) : (
        <span className="max-w-[5.5rem] truncate text-[11.5px] font-medium leading-snug text-foreground transition-colors group-hover:text-[var(--brand-accent)] md:max-w-none md:text-[12.5px]">
          {partner.name}
        </span>
      )}
    </>
  );

  const className = cn(
    "group inline-flex items-center transition-colors duration-200",
    compact ? "gap-1.5" : "w-full gap-2.5",
  );

  if (partner.href) {
    return (
      <a
        href={partner.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={compact ? partner.name : undefined}
        aria-label={compact ? partner.name : undefined}
      >
        {inner}
        {arrow}
      </a>
    );
  }

  return (
    <span className={className}>
      {inner}
      {arrow}
    </span>
  );
}

function PartnerTierPartners({ partners }: { partners: EventPartner[] }) {
  return (
    <ul className="mt-3 flex flex-1 flex-col justify-center gap-1">
      {partners.map((partner, index) => (
        <Fragment key={partner.name}>
          {index > 0 ? (
            <li className="flex justify-center py-0.5">
              <span
                className="text-[13px] text-[var(--color-text-muted)]"
                aria-hidden
              >
                ×
              </span>
            </li>
          ) : null}
          <li>
            <PartnerTile partner={partner} />
          </li>
        </Fragment>
      ))}
    </ul>
  );
}

function HeroCollaborativeHosts({
  hosts,
}: {
  hosts: ReturnType<typeof getEventPageContent>["collaborativeHosts"];
}) {
  if (hosts.length === 0) return null;

  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12.5px] leading-relaxed text-white/88">
      <span className="shrink-0 text-[10px] font-medium tracking-[0.1em] text-white/55 uppercase">
        Collaboratively hosted by:
      </span>
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {hosts.map((host, index) => (
          <span key={host.name} className="inline-flex items-center gap-2">
            {index > 0 ? (
              <span className="text-white/40" aria-hidden>
                ×
              </span>
            ) : null}
            {host.href ? (
              <a
                href={host.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white underline decoration-white/30 underline-offset-[3px] transition-colors hover:text-[var(--brand-accent)] hover:decoration-[var(--brand-accent)]"
              >
                {host.name}
              </a>
            ) : (
              <span className="font-medium text-white">{host.name}</span>
            )}
          </span>
        ))}
      </span>
    </p>
  );
}

function HeroSupportedBy({ partners }: { partners: EventPartner[] }) {
  if (partners.length === 0) return null;

  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12.5px] leading-relaxed text-white/88">
      <span className="shrink-0 text-[10px] font-medium tracking-[0.1em] text-white/55 uppercase">
        Supported by:
      </span>
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {partners.map((partner, index) => (
          <span key={partner.name} className="inline-flex items-center gap-2">
            {index > 0 ? (
              <span className="text-white/40" aria-hidden>
                ×
              </span>
            ) : null}
            {partner.href ? (
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white underline decoration-white/30 underline-offset-[3px] transition-colors hover:text-[var(--brand-accent)] hover:decoration-[var(--brand-accent)]"
              >
                {partner.name}
              </a>
            ) : (
              <span className="font-medium text-white">{partner.name}</span>
            )}
          </span>
        ))}
      </span>
    </p>
  );
}

function HeroPosterFooter({
  hosts,
  supportedBy,
}: {
  hosts: ReturnType<typeof getEventPageContent>["collaborativeHosts"];
  supportedBy: EventPartner[];
}) {
  return (
    <div className="space-y-2 border-t border-white/15 pt-4">
      <HeroCollaborativeHosts hosts={hosts} />
      <HeroSupportedBy partners={supportedBy} />
    </div>
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
    <article className="group relative aspect-[3/4] overflow-hidden border border-[var(--color-border)] bg-[#111]">
      <div className="absolute inset-0">
        {speaker.photo ? (
          <img
            src={speaker.photo}
            alt=""
            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            style={{
              objectPosition: speaker.photoPosition || "center center",
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

      {speaker.badge ? (
        <span className="absolute left-3 top-3 z-20 bg-[var(--brand-accent)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em] text-white">
          {speaker.badge}
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col bg-[linear-gradient(to_top,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.55)_48%,transparent_100%)] p-4 pt-14 sm:p-5 sm:pt-16">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[1.1rem] leading-snug tracking-tight text-white sm:text-[1.2rem]">
              {speaker.name}
            </h3>
            <p className="mt-1 text-[12px] leading-snug text-white/90 sm:text-[13px]">
              {speaker.role}
              {speaker.org ? (
                <>
                  <br />
                  <span className="text-white">{speaker.org}</span>
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
                className="inline-flex size-8 items-center justify-center border border-white/35 bg-black/30 text-white transition-colors hover:border-white/55 hover:bg-black/40"
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
                className="inline-flex size-8 items-center justify-center border border-white/35 bg-black/30 text-white transition-colors hover:border-white/55 hover:bg-black/40"
              >
                <ExternalLink className="size-3.5" strokeWidth={1.75} />
              </a>
            ) : null}
          </div>
        </div>

        <p className="mt-2.5 border-t border-white/20 pt-2.5 text-[12px] leading-[1.55] text-white/95 sm:text-[13px]">
          {speaker.bio}
        </p>
      </div>
    </article>
  );
}

function EventStatusBadge({
  completed,
  open,
}: {
  completed: boolean;
  open: boolean;
}) {
  if (open) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[var(--brand-accent)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.05em] text-white">
        <Ticket className="size-3" strokeWidth={2} aria-hidden />
        Open for RSVP
      </span>
    );
  }
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-[var(--color-background-warm)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.05em] text-[var(--color-text-muted)]">
        <CheckCircle2 className="size-3" strokeWidth={2} aria-hidden />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-[var(--brand-primary-soft)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.05em] text-[var(--color-text-secondary)]">
      <Hourglass className="size-3" strokeWidth={2} aria-hidden />
      Coming soon
    </span>
  );
}

function EventDetail() {
  const { meetup } = Route.useLoaderData();
  const pageContent = getEventPageContent(meetup);
  const mapsUrl = meetupMapsUrl(meetup);
  const mapsEmbed = meetupMapsEmbedUrl(meetup);
  const hosts = meetup.hosts ?? [];
  const speakers = meetup.speakers ?? [];
  const venueLine = meetupVenueLine(meetup);
  const seatsLabel = meetupSeatsLabel(meetup);
  const detailsReveal = useInView<HTMLElement>(heroRevealOpts);
  const whyReveal = useInView<HTMLElement>(scrollRevealOpts);
  const whoReveal = useInView<HTMLElement>(scrollRevealOpts);
  const takeawaysReveal = useInView<HTMLElement>(scrollRevealOpts);
  const speakersReveal = useInView<HTMLElement>(scrollRevealOpts);
  const hostsReveal = useInView<HTMLElement>(scrollRevealOpts);
  const venueReveal = useInView<HTMLElement>(scrollRevealOpts);
  const partnersReveal = useInView<HTMLElement>(scrollRevealOpts);
  const faqReveal = useInView<HTMLElement>(scrollRevealOpts);
  const galleryReveal = useInView<HTMLElement>(scrollRevealOpts);
  const ctaReveal = useInView<HTMLElement>(scrollRevealOpts);
  const completed = isMeetupCompleted(meetup);
  const open = isRsvpOpen(meetup);
  const hasPartners =
    pageContent.collaborativeHosts.length > 0 ||
    pageContent.partnerTiers.length > 0;
  const heroContent = pageContent.hero;
  const supportedByPartners =
    pageContent.partnerTiers.find((tier) => tier.label === "Supported by")
      ?.partners ?? [];

  return (
    <article className="bg-[var(--color-background)]">
      {/* HERO — poster hierarchy for September */}
      <header className="relative isolate flex min-h-[min(58dvh,500px)] flex-col overflow-hidden md:min-h-[min(62dvh,540px)]">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="hero-slide absolute inset-0">
            <img
              src="/july-2026-1.jpeg"
              alt=""
              width={1920}
              height={1080}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-[center_42%]"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,24,0.5)_0%,rgba(8,10,24,0.78)_42%,rgba(8,10,24,0.94)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(8,10,24,0.88)_0%,rgba(8,10,24,0.55)_42%,transparent_72%)]" />
        </div>

        <div className="page-container relative flex flex-1 flex-col justify-end pb-8 pt-14 md:pb-10 md:pt-16">
          <nav
            aria-label="Breadcrumb"
            className="hero-reveal mb-auto flex flex-wrap items-center gap-x-1.5 pb-5 text-[12px] text-white/70 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]"
          >
            <Link
              to="/events"
              className="transition-colors duration-200 hover:text-white"
            >
              Events
            </Link>
            <span aria-hidden className="text-white/35">
              /
            </span>
            <span className="truncate text-white/80">{meetup.title}</span>
          </nav>

          <div className="max-w-2xl [text-shadow:0_1px_14px_rgba(0,0,0,0.55)]">
            {heroContent ? (
              <>
                <h1
                  className="hero-reveal font-semibold leading-[1.02] tracking-[-0.035em] text-white"
                  style={{
                    fontFamily: "var(--font-brand)",
                    fontSize: "clamp(2.1rem, 5.8vw, 3.5rem)",
                  }}
                >
                  {heroContent.brandTitle}
                </h1>
                <p className="hero-reveal hero-reveal-delay-1 mt-2.5 text-[13px] font-medium tracking-[0.14em] text-white/85 uppercase md:text-[14px]">
                  {heroContent.subtitle}
                </p>

                <div className="hero-reveal hero-reveal-delay-2 mt-5 space-y-2 border-l-2 border-[var(--brand-accent)] pl-4 md:mt-6 md:pl-5">
                  <p className="text-[14px] leading-snug text-white/95 md:text-[15px]">
                    {meetupDateLabel(meetup)} · {meetup.time}
                  </p>
                  <p className="text-[13.5px] leading-snug text-white/90 md:text-[14px]">
                    {meetupVenueLine(meetup)}
                  </p>
                  <p className="text-[12.5px] font-medium tracking-wide text-white/78 md:text-[13px]">
                    {heroContent.audienceLine}
                  </p>
                  <p className="pt-1 text-[15px] font-semibold tracking-wide text-white md:text-[16px]">
                    {heroContent.tagline}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="hero-reveal text-[11px] font-medium tracking-[0.14em] text-white/72 uppercase md:text-[12px]">
                  Trizen Community
                </p>
                <p
                  className="hero-reveal hero-reveal-delay-1 mt-2 font-semibold leading-[1.02] tracking-[-0.035em] text-white md:mt-2.5"
                  style={{
                    fontFamily: "var(--font-brand)",
                    fontSize: "clamp(2rem, 5.5vw, 3.35rem)",
                  }}
                >
                  Hyderabad Founders Network
                </p>
                <h1 className="hero-reveal hero-reveal-delay-2 mt-3 max-w-[28ch] text-[clamp(1.15rem,2.4vw,1.45rem)] font-medium leading-snug tracking-tight text-white/92">
                  {meetup.title}
                </h1>
                <p className="hero-reveal hero-reveal-delay-2 mt-3 max-w-lg text-[14px] leading-relaxed text-white/75 md:text-[15px]">
                  {meetup.blurb}
                </p>
              </>
            )}
            {heroContent ? (
              <div className="hero-reveal hero-reveal-delay-3 mt-6 md:mt-7">
                <div className="flex flex-wrap items-center gap-2.5">
                  <RsvpButton event={meetup} className="btn-primary gap-1.5">
                    <Ticket className="size-3.5" strokeWidth={1.75} aria-hidden />
                    {open ? "Register Now" : completed ? "Event completed" : "Coming soon"}
                  </RsvpButton>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] items-center justify-center gap-1.5 border border-white/35 bg-white/12 px-5 text-[14px] font-medium text-white backdrop-blur-[2px] transition-colors duration-200 hover:border-white/50 hover:bg-white/18"
                  >
                    Get Directions
                    <ArrowUpRight
                      className="size-3.5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </a>
                </div>
                <HeroPosterFooter
                  hosts={pageContent.collaborativeHosts}
                  supportedBy={supportedByPartners}
                />
              </div>
            ) : (
              <div className="hero-reveal hero-reveal-delay-3 mt-6 flex flex-wrap items-center gap-2.5">
                <RsvpButton event={meetup} className="btn-primary gap-1.5">
                  <Ticket className="size-3.5" strokeWidth={1.75} aria-hidden />
                  {open ? "Book your spot" : completed ? "Event completed" : "Coming soon"}
                </RsvpButton>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[46px] items-center justify-center gap-1.5 border border-white/28 bg-white/10 px-5 text-[14px] font-medium text-white transition-colors duration-200 hover:border-white/45 hover:bg-white/16"
                >
                  Get Directions
                  <ArrowUpRight
                    className="size-3.5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* EVENT DETAILS — below the fold */}
      <section
        ref={detailsReveal.ref}
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)]"
        aria-label="Event details"
      >
        <div className="page-container py-5 md:py-6">
          <div
            className={cn(
              "reveal-up flex flex-col gap-5",
              detailsReveal.inView && "is-visible",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <EventStatusBadge completed={completed} open={open} />
                <span className="text-[13px] text-[var(--color-text-secondary)]">
                  {meetup.city} · {seatsLabel} seats
                </span>
              </div>
              <EventShareBar meetup={meetup} orientation="horizontal" />
            </div>

            <dl
              className={cn(
                "stagger-in-fast grid grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-5 sm:grid-cols-4 sm:gap-6",
                detailsReveal.inView && "is-visible",
              )}
            >
              {[
                { label: "Date", value: meetupDateLabel(meetup), icon: Calendar },
                { label: "Time", value: meetup.time, icon: Clock },
                { label: "Venue", value: meetup.venue, icon: MapPin },
                { label: "Fee", value: `₹${REGISTRATION_FEE_INR}`, icon: Ticket },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="min-w-0">
                  <dt className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.04em] text-[var(--color-text-muted)]">
                    <Icon
                      className="size-3.5 text-[var(--brand-accent)]"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    {label}
                  </dt>
                  <dd className="mt-1 truncate text-[14px] font-medium text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section
        ref={whyReveal.ref}
        className="border-b border-[var(--color-border)] py-10 md:py-12"
      >
        <div className="page-container">
          <div
            className={cn(
              "reveal-up grid gap-6 lg:grid-cols-12 lg:gap-12",
              whyReveal.inView && "is-visible",
            )}
          >
            <div className="lg:col-span-5">
              <SectionLabel>Why this meetup?</SectionLabel>
              <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(1.5rem,2.5vw,2.05rem)] leading-[1.1] tracking-tight text-foreground">
                {pageContent.why?.headline ??
                  "More than networking. A community that grows together."}
              </h2>
            </div>
            <div className="max-w-2xl space-y-3.5 text-[14px] leading-[1.7] text-[var(--color-text-secondary)] md:text-[15px] lg:col-span-7">
              {pageContent.why ? (
                <>
                  {pageContent.why.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  <p className="font-medium text-foreground">
                    {pageContent.why.closingLine}
                  </p>
                </>
              ) : (
                <>
                  <p>Most startup events end when everyone leaves the room.</p>
                  <p>
                    At Hyderabad Founders Network, every meetup is an opportunity to
                    build relationships that continue beyond the event.
                  </p>
                  <p>
                    Whether you&apos;re building your first startup or scaling your
                    next venture, you&apos;ll meet people who understand the journey
                    and are willing to share their experiences, ideas and support.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY — completed only */}
      {completed ? (
        <section
          ref={galleryReveal.ref}
          className="border-b border-[var(--color-border)] section-space"
        >
          <div className="page-container">
            <div
              className={cn(
                "reveal-up flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
                galleryReveal.inView && "is-visible",
              )}
            >
              <div>
                <SectionLabel>Event highlights</SectionLabel>
                <h2 className="mt-2.5 font-display text-[clamp(1.4rem,2.4vw,1.75rem)] tracking-tight text-foreground">
                  Moments that mattered
                </h2>
              </div>
              <p className="max-w-sm text-[14px] leading-relaxed text-[var(--color-text-secondary)] sm:text-right">
                Snapshots from the completed meetup.
              </p>
            </div>

            <div
              className={cn(
                "stagger-in-fast mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-12 sm:gap-3",
                galleryReveal.inView && "is-visible",
              )}
            >
              <figure className="gallery-tile overflow-hidden sm:col-span-7 sm:row-span-2">
                <img
                  src={eventGallery[0].src}
                  alt={eventGallery[0].alt}
                  loading="lazy"
                  decoding="async"
                  width={1600}
                  height={1100}
                  className="aspect-[16/10] h-full w-full object-cover object-center sm:aspect-auto sm:min-h-[16rem] md:min-h-[18rem]"
                />
              </figure>
              {eventGallery.slice(1).map((shot) => (
                <figure
                  key={shot.src}
                  className="gallery-tile overflow-hidden sm:col-span-5"
                >
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    loading="lazy"
                    decoding="async"
                    width={1200}
                    height={800}
                    className="aspect-[16/10] h-full w-full object-cover object-center"
                  />
                </figure>
              ))}
            </div>

            <div
              className={cn(
                "reveal-up mt-8 max-w-2xl border-t border-[var(--color-border)] pt-6",
                galleryReveal.inView && "is-visible",
              )}
              style={{
                transitionDelay: galleryReveal.inView ? "120ms" : undefined,
              }}
            >
              <SectionLabel>Meetup recap</SectionLabel>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                Founders, operators, and aspiring entrepreneurs came together to
                exchange ideas, hear founder stories, and build lasting
                connections. Thank you to everyone who joined us.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* WHO */}
      <section
        ref={whoReveal.ref}
        className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)] section-space"
      >
        <div className="page-container">
          <div
            className={cn(
              "reveal-up max-w-xl",
              whoReveal.inView && "is-visible",
            )}
          >
            <SectionLabel>Who should attend?</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,2.8vw,2.25rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
              Built for people who are building.
            </h2>
            <p className="mt-3 max-w-[36ch] text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
              Founders, operators, mentors, and aspiring entrepreneurs — if
              you&apos;re shaping Hyderabad&apos;s startup future, you belong
              here.
            </p>
          </div>
          <ul
            className={cn(
              "stagger-in mt-10 grid list-none gap-x-10 sm:grid-cols-2 lg:grid-cols-3",
              whoReveal.inView && "is-visible",
            )}
          >
            {whoFor.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="border-t border-[var(--color-border)] py-5"
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
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
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

      {/* TAKEAWAYS + AGENDA */}
      <section
        ref={takeawaysReveal.ref}
        className="border-b border-[var(--color-border)] section-space"
      >
        <div className="page-container grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div
            className={cn(
              "reveal-left",
              takeawaysReveal.inView && "is-visible",
            )}
          >
            <SectionLabel>What you&apos;ll get</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.55rem,2.6vw,2rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
              What you&apos;ll take away
            </h2>
            <p className="mt-2.5 max-w-[34ch] text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              Outcomes people leave the room with — not a pitch deck recap.
            </p>
            <ul
              className={cn(
                "stagger-in-fast mt-8 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]",
                takeawaysReveal.inView && "is-visible",
              )}
            >
              {takeaways.map((item, i) => (
                <li
                  key={item.title}
                  className="grid gap-1 py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-3"
                >
                  <span
                    className="font-display text-[0.9rem] tabular-nums text-[var(--brand-accent)] sm:pt-0.5"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium leading-snug tracking-tight text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
                      {item.body}
                    </p>
                  </div>
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
              transitionDelay: takeawaysReveal.inView ? "90ms" : undefined,
            }}
          >
            <SectionLabel>Agenda</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.55rem,2.6vw,2rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
              {pageContent.agendaHeading}
            </h2>
            <p className="mt-2.5 max-w-[34ch] text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              {pageContent.agendaSubheading}
            </p>
            <ol
              className={cn(
                "stagger-in mt-8 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]",
                takeawaysReveal.inView && "is-visible",
              )}
            >
              {pageContent.agenda.map((step) => (
                <li
                  key={step.time + step.title}
                  className="grid gap-1 py-4 sm:grid-cols-[5.75rem_minmax(0,1fr)] sm:gap-4"
                >
                  <p className="text-[12px] font-semibold tabular-nums text-[var(--brand-accent)] sm:pt-0.5">
                    {step.time}
                  </p>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium tracking-tight text-foreground">
                      {step.title}
                    </p>
                    {step.desc ? (
                      <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
                        {step.desc}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* SPEAKERS */}
      {speakers.length > 0 ? (
        <section
          ref={speakersReveal.ref}
          className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)] section-space"
        >
          <div className="page-container">
            <div
              className={cn(
                "reveal-up max-w-xl",
                speakersReveal.inView && "is-visible",
              )}
            >
              <SectionLabel>Speakers</SectionLabel>
              <h2 className="mt-3 font-display text-[clamp(1.55rem,2.6vw,2rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
                {pageContent.speakersHeading}
              </h2>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
                {pageContent.speakersSubheading}
              </p>
            </div>

            <ul
              className={cn(
                "stagger-in mt-8 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5",
                speakersReveal.inView && "is-visible",
              )}
            >
              {speakers.map((speaker) => (
                <li key={speaker.name}>
                  <SpeakerCard speaker={speaker} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* HOSTS */}
      {hosts.length > 0 || meetup.guestFounder ? (
        <section
          ref={hostsReveal.ref}
          className="border-b border-[var(--color-border)] section-space"
        >
          <div className="page-container">
            <div
              className={cn(
                "reveal-up max-w-xl",
                hostsReveal.inView && "is-visible",
              )}
            >
              <SectionLabel>Featured community members</SectionLabel>
              <h2 className="mt-3 font-display text-[clamp(1.55rem,2.6vw,2rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
                Community hosts
              </h2>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
                Each meetup is led by founders from the community — not speakers
                on a stage.
              </p>
            </div>

            {hosts.length > 0 ? (
              <ul
                className={cn(
                  "stagger-in mt-8 grid list-none divide-y divide-[var(--color-border)] border-t border-[var(--color-border)] sm:grid-cols-2 sm:gap-x-10 sm:divide-y-0 sm:border-t-0",
                  hostsReveal.inView && "is-visible",
                )}
              >
                {hosts.map((host, i) => (
                  <li
                    key={`${host.name}-${i}`}
                    className="flex gap-3.5 py-5 sm:border-t sm:border-[var(--color-border)]"
                  >
                    {host.photo ? (
                      <img
                        src={host.photo}
                        alt=""
                        className="size-12 shrink-0 object-cover"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div
                        className="flex size-12 shrink-0 items-center justify-center bg-[var(--brand-primary-soft)] text-sm font-medium text-[var(--color-text-secondary)]"
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
                        className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--brand-accent)] underline-offset-4 hover:underline"
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
              <div
                className={cn(
                  "reveal-up mt-2 border-t border-[var(--color-border)] pt-6",
                  hostsReveal.inView && "is-visible",
                )}
                style={{
                  transitionDelay: hostsReveal.inView ? "100ms" : undefined,
                }}
              >
                <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
                  Guest founder
                </p>
                <div className="mt-3 flex gap-3.5">
                  {meetup.guestFounder.photo ? (
                    <img
                      src={meetup.guestFounder.photo}
                      alt=""
                      className="size-12 shrink-0 object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div
                      className="flex size-12 shrink-0 items-center justify-center bg-[var(--brand-primary-soft)] text-sm font-medium text-[var(--color-text-secondary)]"
                      aria-hidden
                    >
                      {meetup.guestFounder.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-[15px] font-medium tracking-tight text-foreground">
                      {meetup.guestFounder.name}
                    </p>
                    <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
                      {meetup.guestFounder.bio}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* VENUE */}
      <section
        ref={venueReveal.ref}
        className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)] py-10 md:py-12"
      >
        <div className="page-container">
          <div
            className={cn(
              "reveal-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
              venueReveal.inView && "is-visible",
            )}
          >
            <div className="max-w-xl">
              <SectionLabel>Venue</SectionLabel>
              <h2 className="mt-3 font-display text-[clamp(1.55rem,2.6vw,2rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
                {meetup.venue}
              </h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
                {meetup.address ?? venueLine}
              </p>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary gap-1.5 self-start sm:self-auto"
            >
              Get Directions
              <ArrowUpRight
                className="size-3.5"
                strokeWidth={1.75}
                aria-hidden
              />
            </a>
          </div>

          <div
            className={cn(
              "reveal-up mt-5 overflow-hidden",
              venueReveal.inView && "is-visible",
            )}
            style={{
              transitionDelay: venueReveal.inView ? "70ms" : undefined,
            }}
          >
            <iframe
              title={`Map of ${meetup.venue}`}
              src={mapsEmbed}
              className="h-[11rem] w-full border-0 sm:h-[13rem] md:h-[14rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <ul
            className={cn(
              "stagger-in-fast mt-4 grid list-none gap-x-8 gap-y-2.5 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2 lg:grid-cols-4",
              venueReveal.inView && "is-visible",
            )}
          >
            {venueAmenities.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 text-[14px] text-foreground"
              >
                <Icon
                  className="size-4 shrink-0 text-[var(--brand-accent)]"
                  strokeWidth={1.75}
                  aria-hidden
                />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {hasPartners ? (
        <section
          ref={partnersReveal.ref}
          className="border-b border-[var(--color-border)] section-space"
        >
          <div className="page-container">
            <div
              className={cn(
                "reveal-up max-w-xl",
                partnersReveal.inView && "is-visible",
              )}
            >
              <SectionLabel>Partners</SectionLabel>
              <h2 className="mt-3 font-display text-[clamp(1.55rem,2.6vw,2rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
                Supported by the ecosystem
              </h2>
            </div>

            <div
              className={cn(
                "stagger-in mt-8 grid gap-px overflow-hidden border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4",
                partnersReveal.inView && "is-visible",
              )}
            >
              {pageContent.partnerTiers.map((tier) => (
                <div
                  key={tier.label}
                  className="flex min-h-[7.5rem] flex-col bg-[var(--color-surface)] p-4 md:p-5"
                >
                  <p className="text-[10px] font-medium tracking-[0.1em] text-[var(--color-text-muted)] uppercase">
                    {tier.label}
                  </p>
                  <PartnerTierPartners partners={tier.partners} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {completed ? (
        <TrizenProductsSection />
      ) : (
        <>
          <section
            id="register"
            ref={faqReveal.ref}
            className="border-b border-[var(--color-border)] py-10 md:py-12"
          >
            <div className="page-container grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div
                className={cn(
                  "reveal-left lg:col-span-5",
                  faqReveal.inView && "is-visible",
                )}
              >
                <SectionLabel>Registration</SectionLabel>
                <h2 className="mt-2.5 font-display text-[clamp(1.4rem,2.4vw,1.75rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
                  Reserve your seat
                </h2>
                <p className="mt-2.5 max-w-[34ch] text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
                  ₹{REGISTRATION_FEE_INR} · {seatsLabel} seats. Confirmation, venue notes, and the
                  WhatsApp link land in your inbox after you register.
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[var(--color-border)] pt-4">
                  {[
                    { label: "Date", value: meetupDateLabel(meetup) },
                    { label: "Time", value: meetup.time },
                    { label: "Venue", value: meetup.venue },
                    { label: "Fee", value: `₹${REGISTRATION_FEE_INR}` },
                  ].map((row) => (
                    <div key={row.label} className="min-w-0">
                      <dt className="text-[11px] font-medium tracking-[0.04em] text-[var(--color-text-muted)]">
                        {row.label}
                      </dt>
                      <dd className="mt-0.5 truncate text-[14px] font-medium text-foreground">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <RsvpButton
                    event={meetup}
                    className={cn(
                      "btn-primary gap-1.5",
                      open && "ring-1 ring-[var(--brand-accent)]",
                    )}
                  >
                    <CalendarCheck
                      className="size-3.5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    {open ? "Register Now" : completed ? "Event completed" : "Coming soon"}
                  </RsvpButton>
                  {!open && !completed ? (
                    <p className="text-[13px] text-[var(--color-text-muted)]">
                      Opens closer to the event date.
                    </p>
                  ) : null}
                </div>
              </div>

              <div
                className={cn(
                  "reveal-right lg:col-span-7",
                  faqReveal.inView && "is-visible",
                )}
                style={{
                  transitionDelay: faqReveal.inView ? "80ms" : undefined,
                }}
              >
                <SectionLabel>FAQ</SectionLabel>
                <h2 className="mt-2.5 font-display text-[clamp(1.4rem,2.4vw,1.75rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
                  Common questions
                </h2>
                <dl
                  className={cn(
                    "stagger-in-fast mt-4 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]",
                    faqReveal.inView && "is-visible",
                  )}
                >
                  {faqs.map((f) => (
                    <div key={f.q} className="py-2.5">
                      <dt className="text-[14px] font-medium tracking-tight text-foreground">
                        {f.q}
                      </dt>
                      <dd className="mt-1 max-w-xl text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                        {f.a}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          <TrizenProductsSection />

          <section
            ref={ctaReveal.ref}
            className="trizen-mesh border-t border-[var(--color-border)] py-10 md:py-12"
          >
            <div
              className={cn(
                "page-container reveal-up flex flex-col items-center gap-5 text-center",
                ctaReveal.inView && "is-visible",
              )}
            >
              <div className="mx-auto max-w-xl">
                <SectionLabel>Community</SectionLabel>
                <h2 className="mt-2.5 font-display text-[clamp(1.4rem,2.4vw,1.8rem)] tracking-tight text-foreground">
                  This meetup is just the beginning.
                </h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
                  Stay connected through WhatsApp, future meetups, founder
                  stories, and ecosystem initiatives.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <a
                  href={links.community}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary gap-2"
                >
                  <WhatsAppIcon className="size-4" />
                  Join Community
                </a>
                <Link to="/events" className="btn-secondary gap-1.5">
                  Upcoming Events
                  <ArrowUpRight
                    className="size-3.5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </article>
  );
}
