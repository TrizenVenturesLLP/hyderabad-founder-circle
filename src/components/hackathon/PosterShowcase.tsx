import {
  Award,
  Bot,
  Building,
  Calendar,
  Code2,
  Cpu,
  Flame,
  Globe,
  GraduationCap,
  MapPin,
  Music2,
  Palette,
  Phone,
  QrCode,
  Sparkles,
  Store,
  Terminal,
  Trophy,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import type { HackathonDetails } from "@/lib/hackathon";

interface PosterShowcaseProps {
  details: HackathonDetails;
}

export function PosterShowcase({ details }: PosterShowcaseProps) {
  const {
    university,
    accreditation,
    school,
    department,
    title,
    durationBadge,
    tagline,
    motto,
    prizePool,
    feeInfo,
    venue,
    domains,
    perks,
    partners,
    coordinators,
  } = details;

  const studentCoordinators = coordinators.filter((c) => c.type === "student");
  const facultyCoordinators = coordinators.filter((c) => c.type === "faculty");
  const academicCoordinators = coordinators.filter((c) => c.type === "academic");
  const leadership = coordinators.filter((c) => c.type === "leadership");

  const domainIcons: Record<string, React.ElementType> = {
    "ui-ux": Palette,
    "web-dev": Globe,
    "vibe-coding": Terminal,
    "agentic-ai": Bot,
  };

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-radial from-neutral-900 via-neutral-950 to-black p-6 text-white shadow-[0_0_50px_rgba(6,182,212,0.15)] sm:p-10 font-sans">
      {/* Background Cyber Grid Lines */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#06b6d410_1px,transparent_1px),linear-gradient(to_bottom,#06b6d410_1px,transparent_1px)] bg-size-[32px_32px] opacity-30" />

      {/* Glow Effects */}
      <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-amber-500/20 blur-3xl" />

      <div className="relative z-10 space-y-8">
        {/* 1. Header: University Crest & Accreditation */}
        <div className="border-b border-cyan-500/20 pb-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-amber-500/50 bg-amber-500/20 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300">
              {accreditation}
            </span>
          </div>

          <h2 className="mt-3 font-display text-xl font-black uppercase tracking-wider sm:text-2xl md:text-3xl text-white">
            {university}
          </h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-cyan-300 sm:text-sm">
            {school}
          </p>
          <div className="mt-2 inline-block rounded-md border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-200">
            Organized by: {department}
          </div>
        </div>

        {/* 2. Main Title & Glowing Badge */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-cyan-400 bg-cyan-950/80 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Zap className="mr-1.5 size-4 text-amber-400 animate-pulse" />
            {durationBadge}
          </div>

          <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-6xl md:text-7xl bg-linear-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(6,182,212,0.6)]">
            {title}
          </h1>

          <p className="mt-2 font-display text-base font-extrabold tracking-wider text-cyan-200 sm:text-xl uppercase">
            {tagline}
          </p>

          <p className="mt-1 text-xs font-mono font-bold tracking-widest text-amber-300 sm:text-sm">
            {motto}
          </p>
        </div>

        {/* 3. The 4 Domains Strip (As on Poster) */}
        <div>
          <p className="text-center font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
            DOMAINS :
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {domains.map((dom) => {
              const Icon = domainIcons[dom.id] || Cpu;
              return (
                <div
                  key={dom.id}
                  className="flex flex-col items-center rounded-2xl border border-cyan-500/30 bg-neutral-900/80 p-4 text-center shadow-lg transition-transform hover:scale-105 hover:border-cyan-400"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-950 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-3 font-display text-xs font-bold uppercase tracking-wider text-white">
                    {dom.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Center Key Info: Dates, Venue, Prize Pool, Fee, Team Size */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-cyan-500/30 bg-neutral-900/70 p-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <Calendar className="size-4" />
              <span className="font-mono text-xs font-bold uppercase">Event Dates</span>
            </div>
            <p className="mt-1.5 font-display text-base font-black text-white">{venue.dateLabel}</p>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-neutral-900/70 p-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <MapPin className="size-4" />
              <span className="font-mono text-xs font-bold uppercase">Venue</span>
            </div>
            <p className="mt-1.5 font-display text-base font-black text-white">{venue.name}</p>
            <p className="text-[11px] text-neutral-400">{venue.area}</p>
          </div>

          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-amber-400">
              <Trophy className="size-4" />
              <span className="font-mono text-xs font-bold uppercase">Prize Pooling</span>
            </div>
            <p className="mt-1.5 font-display text-xl font-black text-amber-300">
              UPTO {prizePool}
            </p>
          </div>
        </div>

        {/* Registration note & Team size */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-500/20 bg-neutral-950 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-500/40 bg-cyan-950 px-3 py-2 text-center">
              <p className="text-[10px] uppercase font-bold text-cyan-400">For Registration</p>
              <p className="font-mono text-base font-bold text-white">{feeInfo}</p>
            </div>
            <div className="rounded-xl border border-cyan-500/40 bg-cyan-950 px-3 py-2 text-center">
              <p className="text-[10px] uppercase font-bold text-cyan-400">Team Size</p>
              <p className="font-mono text-base font-bold text-white">{venue.teamSize}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-neutral-400">Department of CSE-AIML · MRDU</span>
          </div>
        </div>

        {/* 5. In Collaboration With */}
        <div className="rounded-2xl border border-cyan-500/20 bg-neutral-950/80 p-5 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
            IN COLLABORATION WITH :
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {partners.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border border-cyan-500/30 bg-neutral-900 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-200"
              >
                {p.name}
              </div>
            ))}
          </div>
        </div>

        {/* 6. Event Perks Strip */}
        <div>
          <p className="text-center font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
            EVENT HIGHLIGHTS & PERKS
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="flex flex-col items-center rounded-xl border border-cyan-500/20 bg-neutral-900/60 p-3 text-center">
              <GraduationCap className="size-5 text-cyan-400" />
              <span className="mt-2 text-[11px] font-bold text-white uppercase">
                Stipend Internship
              </span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-cyan-500/20 bg-neutral-900/60 p-3 text-center">
              <Music2 className="size-5 text-cyan-400" />
              <span className="mt-2 text-[11px] font-bold text-white uppercase">
                Cultural Night
              </span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-cyan-500/20 bg-neutral-900/60 p-3 text-center">
              <Store className="size-5 text-cyan-400" />
              <span className="mt-2 text-[11px] font-bold text-white uppercase">Stalls</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-cyan-500/20 bg-neutral-900/60 p-3 text-center">
              <Flame className="size-5 text-amber-400" />
              <span className="mt-2 text-[11px] font-bold text-white uppercase">Bonfire</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-cyan-500/20 bg-neutral-900/60 p-3 text-center col-span-2 sm:col-span-1">
              <Utensils className="size-5 text-cyan-400" />
              <span className="mt-2 text-[11px] font-bold text-white uppercase">Food Provided</span>
            </div>
          </div>
        </div>

        {/* 7. Coordinators Contact Panel */}
        <div className="rounded-2xl border border-cyan-500/20 bg-neutral-950 p-5">
          <div className="grid grid-cols-1 gap-6 text-xs sm:grid-cols-3">
            <div>
              <p className="font-mono font-bold uppercase text-cyan-400">Faculty Co-ordinators :</p>
              <ul className="mt-2 space-y-1 text-neutral-300">
                {facultyCoordinators.map((c) => (
                  <li key={c.name}>
                    {c.name} - {c.designation}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono font-bold uppercase text-cyan-400">
                Academic Co-ordinators :
              </p>
              <ul className="mt-2 space-y-1 text-neutral-300">
                {academicCoordinators.map((c) => (
                  <li key={c.name}>
                    {c.name} - {c.designation}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono font-bold uppercase text-cyan-400">Student Co-ordinators :</p>
              <ul className="mt-2 space-y-1 text-neutral-300">
                {studentCoordinators.map((c) => (
                  <li key={c.name} className="flex items-center justify-between">
                    <span>{c.name}</span>
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="font-mono text-cyan-300 hover:underline"
                      >
                        {c.phone}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Leadership Footer Strip */}
          <div className="mt-6 border-t border-cyan-500/20 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-neutral-400">
              {leadership.map((leader) => (
                <div key={leader.name}>
                  <span className="font-bold text-white">{leader.name}</span>
                  <span className="block text-neutral-500">{leader.designation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
