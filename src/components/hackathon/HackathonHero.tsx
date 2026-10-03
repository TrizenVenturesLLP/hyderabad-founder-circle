import mrduPoster from "@/assets/poster.jpg";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Flame,
  GraduationCap,
  MapPin,
  Music2,
  Store,
  Trophy,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import type { HackathonDetails } from "@/lib/hackathon";
import { MallaReddyEmblem } from "@/components/hackathon/MallaReddyEmblem";
import { Link } from "@tanstack/react-router";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface HackathonHeroProps {
  details: HackathonDetails;
}

const scrollRevealOpts = {
  once: true,
  threshold: 0.12,
  rootMargin: "0px 0px -8% 0px",
} as const;

const experienceHighlights = [
  {
    title: "Stipend Based Internship",
    description: "Startup hiring tracks",
    Icon: GraduationCap,
  },
  { title: "Cultural Night", description: "Live entertainment", Icon: Music2 },
  { title: "Innovation Stalls", description: "Demo & sponsor booths", Icon: Store },
  { title: "Bonfire", description: "Founder discussions", Icon: Flame },
  { title: "Food Provided", description: "Meals & Red Bull drinks", Icon: Utensils },
];

export function HackathonHero({ details }: HackathonHeroProps) {
  const {
    university,
    accreditation,
    school,
    department,
    title,
    durationBadge,
    tagline,
    motto,
    blurb,
    prizePool,
    venue,
    partners,
  } = details;

  const facts = [
    { label: "Dates", value: venue.dateLabel, Icon: CalendarDays },
    { label: "Venue", value: venue.name, Icon: MapPin },
    { label: "Team size", value: venue.teamSize, Icon: Users },
  ];
  const perksReveal = useInView<HTMLDivElement>(scrollRevealOpts);
  const partnersReveal = useInView<HTMLDivElement>(scrollRevealOpts);

  return (
    <section className="relative overflow-hidden border-b border-(--color-border) bg-(--color-background)">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 85% 5%, color-mix(in oklab, var(--brand-accent) 6%, transparent) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 0% 100%, color-mix(in oklab, var(--brand-primary) 4%, transparent) 0%, transparent 50%)",
        }}
      />

      <div className="page-container relative">
        <div className="hero-reveal flex flex-col gap-3 border-b border-(--color-border) py-3.5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <MallaReddyEmblem className="h-11" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
                {accreditation}
              </p>
              <h2 className="font-display text-sm font-bold text-foreground">{university}</h2>
              <p className="text-xs text-(--color-text-secondary)">
                {school} <span aria-hidden="true">·</span> {department}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-md border border-(--color-border) bg-white px-3 py-1.5">
              <Trophy className="size-4 text-amber-500" strokeWidth={1.75} />
              <div>
                <p className="text-[9.5px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase">
                  Prize pool
                </p>
                <p className="font-display text-sm leading-tight font-bold text-foreground">
                  {prizePool}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-(--color-border) bg-white px-3 py-1.5">
              <Clock3 className="size-4 text-(--brand-accent)" strokeWidth={1.75} />
              <div>
                <p className="text-[9.5px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase">
                  Duration
                </p>
                <p className="font-display text-sm leading-tight font-bold text-(--brand-accent)">
                  {durationBadge}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-center gap-8 py-7 md:py-9 lg:grid-cols-[minmax(0,1fr)_minmax(260px,330px)] lg:gap-10">
          <div>
            <p className="hero-reveal inline-flex items-center gap-1.5 rounded border border-(--color-border) bg-white px-2 py-0.5 text-[11px] font-medium text-(--color-text-secondary)">
              <Zap className="size-3 text-(--brand-accent)" />
              {motto}
            </p>

            <h1 className="hero-reveal hero-reveal-delay-1 mt-3.5 max-w-[14ch] font-display text-3xl leading-[1.05] font-bold tracking-[-0.03em] text-foreground sm:text-4xl md:text-[2.75rem]">
              {title}
            </h1>

            <p className="hero-reveal hero-reveal-delay-1 mt-2.5 font-display text-base font-semibold text-(--brand-accent) sm:text-lg">
              {tagline}
            </p>

            <p className="hero-reveal hero-reveal-delay-2 mt-2 max-w-2xl text-sm leading-relaxed text-(--color-text-secondary)">
              {blurb}
            </p>

            <dl className="hero-reveal hero-reveal-delay-2 mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
              {facts.map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="rounded-md border border-(--color-border) bg-white p-2.5"
                >
                  <dt className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase">
                    <span className="grid size-5 place-items-center rounded bg-(--brand-accent-soft) text-(--brand-accent)">
                      <Icon className="size-3" />
                    </span>
                    {label}
                  </dt>
                  <dd className="mt-1.5 text-[13px] leading-snug font-semibold text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="hero-reveal hero-reveal-delay-3 mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/hackathon/register"
                className="btn-primary group/cta inline-flex min-h-10 items-center justify-center gap-2 px-5 text-sm font-medium"
              >
                Register for Hackathon
                <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
              </Link>
              <a
                href="#domains"
                className="btn-secondary inline-flex min-h-10 items-center justify-center px-5 text-sm font-medium"
              >
                Explore 4 domains
              </a>
              <a
                href="#venue"
                className="inline-flex items-center justify-center gap-1.5 px-2 text-sm font-semibold text-(--brand-accent) hover:underline"
              >
                <MapPin className="size-4" /> Venue & campus info
              </a>
            </div>
          </div>

          <div className="hero-card-reveal hero-reveal-delay-2 relative mx-auto w-full max-w-[300px] lg:max-w-[330px]">
            <div className="relative overflow-hidden rounded-lg border border-(--color-border) bg-white p-1 shadow-(--shadow-card)">
              <img
                src={mrduPoster}
                alt={`${title} official event poster`}
                className="block h-auto w-full rounded-md bg-(--brand-primary)"
                loading="eager"
              />
            </div>
          </div>
        </div>

        <div ref={perksReveal.ref} className="border-t border-(--color-border) py-5">
          <p
            className={cn(
              "reveal-fade text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase",
              perksReveal.inView && "is-visible",
            )}
          >
            Perks & experience
          </p>
          <div
            className={cn(
              "stagger-in-fast mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5",
              perksReveal.inView && "is-visible",
            )}
          >
            {experienceHighlights.map(({ title: highlightTitle, description, Icon }) => (
              <div
                key={highlightTitle}
                className="group flex items-center gap-2.5 rounded-md border border-(--color-border) bg-white p-2.5 hover:border-(--brand-accent)/30"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-(--brand-accent-soft) text-(--brand-accent)">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{highlightTitle}</p>
                  <p className="text-[11.5px] text-(--color-text-secondary)">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={partnersReveal.ref} className="pb-6">
          <div
            className={cn(
              "reveal-up rounded-md border border-(--color-border) bg-white px-4 py-3 sm:px-5",
              partnersReveal.inView && "is-visible",
            )}
          >
            <p className="text-center text-[10.5px] font-semibold tracking-[0.08em] text-(--color-text-muted) uppercase">
              In collaboration with
            </p>
            <div
              className="partner-marquee mt-2.5"
              role="region"
              aria-label="Collaboration partners"
              tabIndex={0}
            >
              <div className="partner-marquee__track">
                {[false, true].map((isDuplicate) => (
                  <ul
                    key={String(isDuplicate)}
                    className="partner-marquee__group"
                    aria-hidden={isDuplicate || undefined}
                  >
                    {partners.map((partner) => (
                      <li
                        key={partner.name}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded border border-(--color-border) bg-(--color-background-alt) px-3 py-1.5"
                      >
                        <span className="font-display text-xs font-bold whitespace-nowrap text-foreground">
                          {partner.name}
                        </span>
                        {partner.role && (
                          <span className="text-[11px] whitespace-nowrap text-(--color-text-muted)">
                            {partner.role}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
