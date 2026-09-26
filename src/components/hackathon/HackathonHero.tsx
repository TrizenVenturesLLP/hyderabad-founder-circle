import mrduPoster from "@/assets/poster.jpg";
import {
  Award,
  Calendar,
  Clock,
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

interface HackathonHeroProps {
  details: HackathonDetails;
  totalStatements: number;
}

export function HackathonHero({ details, totalStatements }: HackathonHeroProps) {
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
    feeInfo,
    posterImage,
    venue,
    domains,
    perks,
    partners,
  } = details;

  return (
    <section className="relative overflow-hidden border-b border-(--color-border) bg-linear-to-b from-(--color-background-alt) via-(--color-background) to-(--color-background) pt-8 pb-14 md:pt-12 md:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top University Branding Banner */}
        <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-xs backdrop-blur-xs md:p-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                  {accreditation}
                </span>
                <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {department}
                </span>
              </div>
              <h2 className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-foreground sm:text-xl">
                {university}
              </h2>
              <p className="text-xs font-medium text-muted-foreground">{school}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                  Prize Pool
                </p>
                <p className="font-display text-xl font-black text-amber-800">{prizePool}</p>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Duration
                </p>
                <p className="font-display text-xl font-black text-primary">{durationBadge}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Title & Hero Grid */}
        <div className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-primary">
              <Zap className="size-3.5" />
              {motto}
            </div>

            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {title}
            </h1>

            <p className="mt-3 font-display text-lg font-bold tracking-tight text-primary sm:text-2xl">
              {tagline}
            </p>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {blurb}
            </p>

            {/* Key Metrics Strip */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Dates</p>
                <p className="mt-0.5 text-xs font-bold text-foreground">{venue.dateLabel}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Venue</p>
                <p className="mt-0.5 text-xs font-bold text-foreground">{venue.name}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Team Size</p>
                <p className="mt-0.5 text-xs font-bold text-foreground">{venue.teamSize}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">
                  Challenges
                </p>
                <p className="mt-0.5 text-xs font-bold text-primary">{totalStatements} Active</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#problem-statements"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95"
              >
                Explore 4 Domain Challenges
              </a>
              <a
                href="#venue"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <MapPin className="mr-1.5 size-4 text-primary" />
                Venue & Campus Info
              </a>
            </div>
          </div>

          {/* Right Column: Official Poster */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-neutral-950 p-2 shadow-card transition-transform hover:scale-[1.01]">
              <div className="relative  w-full overflow-hidden rounded-xl bg-neutral-900">
                <img
                  src={mrduPoster}
                  alt={title}
                  className="h-full w-full object-contain"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Perks & Highlights Bar */}
        <div className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
            Hackathon Perks & Experience Highlights
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="size-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-foreground">Stipend Based Internship</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Startup hiring tracks</p>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Music2 className="size-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-foreground">Cultural Night</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Live entertainment</p>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Store className="size-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-foreground">Innovation Stalls</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Demo & sponsor booths</p>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Flame className="size-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-foreground">Bonfire</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Founder discussions</p>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Utensils className="size-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-foreground">Food Provided</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Meals & Red Bull drinks</p>
            </div>
          </div>
        </div>

        {/* Partners & Collaborators Row */}
        <div className="mt-10 rounded-2xl border border-border bg-card/60 p-5">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            In Collaboration With
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:gap-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 shadow-2xs"
              >
                <span className="font-display text-xs font-bold text-foreground">
                  {partner.name}
                </span>
                {partner.role && (
                  <span className="text-[10px] text-muted-foreground">· {partner.role}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
