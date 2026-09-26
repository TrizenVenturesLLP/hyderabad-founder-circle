import {
  Building,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import type { HackathonCoordinator, HackathonVenue as VenueType } from "@/lib/hackathon";

interface HackathonVenueProps {
  venue: VenueType;
  coordinators: HackathonCoordinator[];
}

export function HackathonVenueSection({ venue, coordinators }: HackathonVenueProps) {
  const studentCoordinators = coordinators.filter((c) => c.type === "student");
  const facultyCoordinators = coordinators.filter((c) => c.type === "faculty");
  const academicCoordinators = coordinators.filter((c) => c.type === "academic");
  const leadership = coordinators.filter((c) => c.type === "leadership");

  return (
    <section
      id="venue"
      className="border-b border-(--color-border) bg-(--color-background-alt) py-12 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Campus & Logistics
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Venue & Organization Details
            </h2>
          </div>
          <a
            href={venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Open in Google Maps
            <ExternalLink className="size-4" />
          </a>
        </div>

        {/* Venue Information Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Details Card */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{venue.name}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-primary">{venue.campus}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {venue.address}
                  </p>
                </div>
              </div>

              <hr className="my-5 border-border" />

              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-foreground/85">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>24-Hour continuous lab access & power backup</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground/85">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>High-speed campus network and Wi-Fi coverage</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground/85">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>On-campus food courts, bonfire zone & resting pods</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground/85">
                  <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                  <span>24/7 Campus security and medical support staff</span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href={venue.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-95"
                >
                  <Navigation className="size-4" />
                  Get Navigation Directions to MRDU
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-3.5 text-center">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">
                  Team Structure
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">{venue.teamSize}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5 text-center">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">
                  Hackathon Format
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">{venue.format} (24 Hours)</p>
              </div>
            </div>
          </div>

          {/* Map Frame */}
          <div className="lg:col-span-7">
            <div className="relative h-85 w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-xs sm:h-105">
              <iframe
                title="MRDU Campus Venue Map"
                src={venue.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        {/* Coordinators Section From Poster */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h3 className="font-display text-base font-bold text-foreground">
            Organizing Committee & Contacts
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Contact student or faculty coordinators for campus arrival assistance and queries.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Faculty Coordinators */}
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <GraduationCap className="size-4 text-primary" />
                Faculty Co-ordinators
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {facultyCoordinators.map((c) => (
                  <li key={c.name} className="flex items-baseline justify-between">
                    <span className="font-medium text-foreground">{c.name}</span>
                    <span className="text-[11px] text-muted-foreground">{c.designation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Academic Coordinators */}
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <Building className="size-4 text-primary" />
                Academic Co-ordinators
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {academicCoordinators.map((c) => (
                  <li key={c.name} className="flex items-baseline justify-between">
                    <span className="font-medium text-foreground">{c.name}</span>
                    <span className="text-[11px] text-muted-foreground">{c.designation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Student Coordinators */}
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <Phone className="size-4 text-primary" />
                Student Co-ordinators
              </div>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                {studentCoordinators.map((c) => (
                  <li key={c.name} className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{c.name}</span>
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {c.phone}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* University Leadership Footer Strip */}
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              University Leadership & Patrons
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              {leadership.map((leader) => (
                <div key={leader.name} className="flex flex-col">
                  <span className="font-bold text-foreground">{leader.name}</span>
                  <span className="text-[10px] text-muted-foreground">{leader.designation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
