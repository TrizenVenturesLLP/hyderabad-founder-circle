import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Compass,
  Handshake,
  Layers,
  Sprout,
} from "lucide-react";
import heroImg from "@/assets/hero-rooftop.jpg";
import tableImg from "@/assets/table-detail.jpg";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { nextMeetup } from "@/lib/events";
import { links } from "@/lib/links";
import { RsvpButton } from "@/components/rsvp/RsvpButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hyderabad Founders Network — Monthly Startup Meetup" },
      {
        name: "description",
        content:
          "Trust-based founder community in Hyderabad. We meet on the 3rd Saturday of every month — for real conversations, mentors, and collaborations beyond the pitch deck.",
      },
      { property: "og:title", content: "Hyderabad Founders Network" },
      {
        property: "og:description",
        content:
          "Monthly, community-led meetups for founders, operators and aspiring entrepreneurs in Hyderabad.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const audiences = [
  {
    title: "Early-stage founders",
    desc: "Building, validating, and growing meaningful ideas.",
    Icon: Sprout,
  },
  {
    title: "Operators & product folks",
    desc: "Turning ideas into products, systems, and real outcomes.",
    Icon: Layers,
  },
  {
    title: "Aspiring entrepreneurs",
    desc: "Exploring opportunities and preparing to take the first step.",
    Icon: Compass,
  },
  {
    title: "Angels & ecosystem allies",
    desc: "Supporting founders through capital, experience, and connections.",
    Icon: Handshake,
  },
];

const outcomes = [
  {
    k: "Trust networks",
    v: "Meet the same people each month. These recurring conversations turn into co-founders, hires, and warm intros.",
  },
  {
    k: "Mentors & investors",
    v: "Meet operators who have shipped before, and angels who back Hyderabad founders early.",
  },
  {
    k: "Peer learning",
    v: "Real stories from the room — pricing pivots, first 10 customers, hard hires — not pitch theatre.",
  },
  {
    k: "Collaboration",
    v: "Find design partners, beta users, and the person who knows the person you need.",
  },
];

const partners = [
  { name: "T-Hub", href: "https://t-hub.co/" },
  { name: "WE Hub", href: "https://wehub.telangana.gov.in/" },
  { name: "eChai", href: "https://www.echaiventures.com/" },
  { name: "91springboard", href: "https://www.91springboard.com/" },
  { name: "AIC", href: "https://aic.iiit.ac.in/" },
  { name: "iTIC", href: "https://itic.iith.ac.in/" },
];

function RhythmStrip() {
  return (
    <section className="border-y border-border/80 bg-background">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-8 md:px-8 md:py-8">
        <p className="font-display text-xl leading-snug tracking-tight text-foreground md:text-[1.35rem]">
          Same time, same room, same energy — every 3rd Saturday.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-right md:text-[0.9375rem]">
          Offline · 40 seats · DraperU India, Gachibowli
        </p>
      </div>
    </section>
  );
}

function TimelineStep({
  index,
  title,
  body,
  isLast,
}: {
  index: number;
  title: string;
  body: string;
  isLast: boolean;
}) {
  const { ref, inView } = useInView<HTMLLIElement>({
    once: true,
    threshold: 0.3,
    rootMargin: "0px 0px -8% 0px",
  });
  const isLeft = index % 2 === 0;

  const copy = (
    <div
      className={cn(
        "timeline-copy max-w-md",
        isLeft ? "md:ml-auto md:text-right" : "md:mr-auto md:text-left",
      )}
    >
      <h3 className="font-display text-2xl tracking-tight text-foreground md:text-[1.75rem]">
        {title}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground md:text-base">
        {body}
      </p>
    </div>
  );

  return (
    <li
      ref={ref}
      className={cn(
        "timeline-step relative grid grid-cols-[0.875rem_1fr] items-start gap-x-5 pb-12 md:grid-cols-[1fr_auto_1fr] md:gap-x-10 md:pb-16",
        isLeft ? "from-left" : "from-right",
        inView && "is-visible",
        isLast && "pb-0 md:pb-0",
      )}
    >
      {/* Desktop: left column */}
      <div className="hidden md:block">{isLeft ? copy : null}</div>

      {/* Center node — marker only, no index numbers */}
      <div className="relative z-10 flex justify-center">
        <span
          className={cn(
            "mt-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-primary/35 bg-background shadow-[0_0_0_5px_color-mix(in_oklab,var(--secondary)_55%,var(--paper))] transition-all duration-500 md:mt-2 md:h-4 md:w-4",
            inView &&
              "border-primary bg-primary shadow-[0_0_0_5px_color-mix(in_oklab,var(--secondary)_55%,var(--paper)),0_8px_18px_-8px_color-mix(in_oklab,var(--terracotta)_45%,transparent)]",
          )}
          aria-hidden
        />
      </div>

      {/* Mobile always right of line; desktop right column for even steps */}
      <div className="md:hidden">{copy}</div>
      <div className="hidden md:block">{!isLeft ? copy : null}</div>
    </li>
  );
}

function WhoShowsUpSection() {
  const { ref, inView } = useInView<HTMLElement>({
    once: true,
    threshold: 0.18,
    rootMargin: "0px 0px -6% 0px",
  });

  return (
    <section ref={ref} className="relative overflow-hidden px-5 py-16 md:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--ink) 12%, transparent) 1px, transparent 0)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse at 15% 40%, black 0%, transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 md:grid-cols-12 md:items-start md:gap-10 lg:gap-14">
        {/* Left copy */}
        <div
          className={cn(
            "audience-copy md:col-span-5",
            inView && "is-visible",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-primary" aria-hidden />
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              Who shows up
            </p>
          </div>
          <h2 className="mt-4 font-display text-[2rem] leading-[1.1] tracking-tight text-foreground md:text-[2.35rem] lg:text-[2.5rem]">
            Built for the people doing the work.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
            No badges, no tiers. If you're building, supporting builders, or
            seriously thinking about it — you belong in the room.
          </p>
          <div className="mt-8 flex items-center gap-2" aria-hidden>
            <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
            <span className="h-px w-16 bg-border" />
            <span className="h-px w-8 bg-primary/30" />
          </div>
        </div>

        {/* Right 2×2 cards */}
        <ul className="grid list-none gap-3 sm:grid-cols-2 sm:gap-4 md:col-span-7">
          {audiences.map((a, i) => (
            <li
              key={a.title}
              className={cn(
                "audience-card group relative flex flex-col rounded-[18px] border border-border/90 bg-card p-6 shadow-[0_1px_2px_color-mix(in_oklab,var(--ink)_4%,transparent)] transition-[border-color,box-shadow,transform] duration-300",
                "hover:border-primary/25 hover:shadow-[0_16px_32px_-24px_rgba(0,0,0,0.35)]",
                inView && "is-visible",
              )}
              style={{ transitionDelay: inView ? `${100 + i * 80}ms` : "0ms" }}
            >
              <div className="flex items-start justify-between gap-3">
                <a.Icon
                  className="h-4 w-4 text-primary/70 transition-colors duration-300 group-hover:text-primary"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>
              <h3 className="mt-4 font-display text-lg leading-snug tracking-tight text-foreground md:text-[1.2rem]">
                {a.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {a.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function NextMeetupSection() {
  const { ref, inView } = useInView<HTMLElement>({
    once: true,
    threshold: 0.22,
    rootMargin: "0px 0px -6% 0px",
  });

  return (
    <section ref={ref} className="relative px-5 py-14 md:py-16">
      <div className="relative mx-auto max-w-6xl">
        <div
          className={cn(
            "meetup-card grid overflow-hidden rounded-2xl bg-card shadow-[0_24px_48px_-36px_rgba(0,0,0,0.35)] ring-1 ring-border/70 md:grid-cols-2",
            inView && "is-visible",
          )}
        >
          <div
            className={cn(
              "meetup-media relative min-h-[12rem] overflow-hidden md:min-h-[18rem]",
              inView && "is-visible",
            )}
          >
            <img
              src={tableImg}
              alt="Hands gesturing across a table with chai and notebooks"
              loading="lazy"
              width={1400}
              height={900}
              className="absolute inset-0 h-full w-full scale-105 object-cover transition-transform duration-[1.1s] ease-out will-change-transform"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-ink/30 via-transparent to-transparent"
              aria-hidden
            />
          </div>

          <div
            className={cn(
              "meetup-copy flex flex-col justify-center px-5 py-6 sm:px-7 sm:py-7 md:px-8 md:py-8",
              inView && "is-visible",
            )}
          >
            <div className="meetup-item flex items-center gap-2.5">
              <span className="h-px w-5 bg-primary/70" aria-hidden />
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
                Next meetup
              </p>
            </div>

            <h2 className="meetup-item mt-2.5 font-display text-[1.45rem] leading-[1.15] tracking-tight text-foreground sm:text-[1.65rem] md:text-[1.85rem]">
              {nextMeetup.title}
            </h2>

            <div className="meetup-item mt-4 space-y-2 border-y border-border/80 py-4 text-sm leading-snug text-foreground">
              <p>
                <strong className="font-medium text-foreground">When:</strong>{" "}
                <span className="text-foreground/90">
                  {nextMeetup.dateLabel} · {nextMeetup.time}
                </span>
              </p>
              <p>
                <strong className="font-medium text-foreground">Where:</strong>{" "}
                <span className="text-foreground/90">
                  {nextMeetup.space
                    ? `${nextMeetup.venue}, ${nextMeetup.space}`
                    : nextMeetup.venue}{" "}
                  · {nextMeetup.city}
                </span>
              </p>
              <p>
                <strong className="font-medium text-foreground">Format:</strong>{" "}
                <span className="text-foreground/90">{nextMeetup.format}</span>
              </p>
            </div>

            <p className="meetup-item mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {nextMeetup.blurb}
            </p>

            <div className="meetup-item mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
              <RsvpButton
                event={nextMeetup}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_12px_28px_-14px_color-mix(in_oklab,var(--terracotta)_75%,transparent)] transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.98]"
              >
                RSVP for this meetup
              </RsvpButton>
              <Link
                to="/events/$slug"
                params={{ slug: nextMeetup.slug }}
                className="text-sm font-medium text-foreground/80 underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
              >
                See full details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <div>
      {/* HERO — full-bleed image background */}
      <section className="relative isolate min-h-[min(78dvh,640px)] overflow-hidden md:min-h-[min(72dvh,680px)]">
        <img
          src={heroImg}
          alt=""
          width={1600}
          height={1100}
          fetchPriority="high"
          decoding="async"
          className="hero-media absolute inset-0 h-full w-full object-cover object-[78%_40%] sm:object-[70%_38%] md:object-[60%_35%] lg:object-[55%_32%]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,oklch(0.15_0.02_55_/_0.86)_0%,oklch(0.17_0.025_50_/_0.68)_45%,oklch(0.2_0.03_45_/_0.28)_72%,oklch(0.22_0.03_40_/_0.12)_100%),linear-gradient(to_top,oklch(0.12_0.02_55_/_0.5)_0%,transparent_42%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(78dvh,640px)] max-w-6xl items-end px-5 pb-10 pt-16 md:min-h-[min(72dvh,680px)] md:pb-14 md:pt-20">
          <div className="hero-reveal w-full max-w-2xl">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
              <span className="hero-pulse h-1.5 w-1.5 rounded-full bg-primary" />
              Every 3rd Saturday · Hyderabad
            </p>
            <h1 className="mt-5 font-display text-[2.35rem] leading-[1.05] tracking-tight text-white md:mt-6 md:text-[3.25rem] md:leading-[1.04]">
              A founder community{" "}
              <span className="italic text-[color-mix(in_oklab,var(--saffron)_90%,white)]">
                that actually shows up.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 md:mt-5 md:text-lg">
              Monthly, community-led meetups for founders, operators and aspiring
              entrepreneurs in Hyderabad. We create space for real conversations,
              trust, and long-term collaboration — beyond the pitch deck.
            </p>
            <p className="mt-5 text-sm font-medium tracking-wide text-white/85 md:text-[0.95rem]">
              Free to attend · Community-owned · No hard selling
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
              <div className="flex min-w-0 flex-1 flex-col sm:max-w-[15.5rem]">
                <a
                  href={links.community}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[0_12px_28px_-10px_oklch(0.45_0.14_38_/_0.65)] transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.98]"
                >
                  Join WhatsApp community
                </a>
                <p className="mt-2 text-center text-xs leading-snug text-white/60 sm:text-left">
                  Get updates, intros, and monthly meetup details.
                </p>
              </div>
              <div className="flex min-w-0 flex-1 flex-col sm:max-w-[15.5rem]">
                <Link
                  to="/events"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 text-sm font-medium text-white backdrop-blur-sm transition-[background-color,border-color,transform] duration-200 hover:border-white/40 hover:bg-white/16 active:scale-[0.98]"
                >
                  See next meetup →
                </Link>
                <p className="mt-2 text-center text-xs leading-snug text-white/60 sm:text-left">
                  Check date, venue, and RSVP link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RHYTHM STRIP */}
      <RhythmStrip />

      {/* WHO IT'S FOR */}
      <WhoShowsUpSection />

      {/* OUTCOMES — TIMELINE */}
      <section className="border-y border-border/60 bg-secondary/35">
        <div className="mx-auto max-w-6xl px-5 py-24 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              What you get
            </p>
            <h2 className="mt-3 font-display text-3xl leading-[1.08] tracking-tight text-foreground md:text-[2.5rem]">
              Relationships, not just business cards.
            </h2>
          </div>

          <ol className="relative mx-auto mt-14 list-none md:mt-16">
            <span
              className="absolute top-5 bottom-5 left-[0.4375rem] w-px -translate-x-1/2 bg-primary/30 md:left-1/2"
              aria-hidden
            />
            {outcomes.map((o, i) => (
              <TimelineStep
                key={o.k}
                index={i}
                title={o.k}
                body={o.v}
                isLast={i === outcomes.length - 1}
              />
            ))}
          </ol>
        </div>
      </section>

      {/* NEXT MEETUP CARD */}
      <NextMeetupSection />

      {/* PARTNERS STRIP */}
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-5 pt-14 pb-20 md:pt-16 md:pb-28">
          <div className="flex flex-col items-center">
            <p className="max-w-xl text-center text-[11px] font-medium uppercase tracking-[0.18em] text-ink/45 md:tracking-[0.2em]">
              Friends and partners from across Hyderabad's startup ecosystem
            </p>
            <ul className="mt-8 flex list-none flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-14 md:mt-9 md:gap-x-16">
              {partners.map((p) => (
                <li key={p.name}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-2xl tracking-tight text-ink/90 transition-colors duration-200 hover:text-ink sm:text-[1.75rem] md:text-3xl"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
