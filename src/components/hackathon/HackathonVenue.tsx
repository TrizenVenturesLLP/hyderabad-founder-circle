import {
  Building,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Landmark,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { HackathonCoordinator, HackathonVenue as VenueType } from "@/lib/hackathon";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface HackathonVenueProps {
  venue: VenueType;
  coordinators: HackathonCoordinator[];
}

const scrollRevealOpts = {
  once: true,
  threshold: 0.12,
  rootMargin: "0px 0px -8% 0px",
} as const;

const facilities: { label: string; Icon: LucideIcon }[] = [
  { label: "24-hour lab access & power backup", Icon: CheckCircle2 },
  { label: "High-speed campus network & Wi-Fi", Icon: CheckCircle2 },
  { label: "Food courts, bonfire zone & resting pods", Icon: CheckCircle2 },
  { label: "24/7 campus security & medical support", Icon: ShieldCheck },
];

function CoordinatorCard({
  title,
  Icon,
  people,
  showDesignation = true,
}: {
  title: string;
  Icon: LucideIcon;
  people: HackathonCoordinator[];
  showDesignation?: boolean;
}) {
  return (
    <div className="rounded-md border border-(--color-border) bg-white p-3">
      <div className="flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded bg-(--brand-accent-soft) text-(--brand-accent)">
          <Icon className="size-3" />
        </span>
        <p className="text-[10.5px] font-semibold tracking-[0.06em] text-foreground uppercase">
          {title}
        </p>
        <span className="ml-auto text-[10.5px] font-medium text-(--color-text-muted) tabular-nums">
          {people.length}
        </span>
      </div>
      <ul className="mt-2 space-y-0.5">
        {people.map((person) => (
          <li
            key={person.name}
            className="flex items-center justify-between gap-2 rounded px-1.5 py-1 transition-colors hover:bg-(--color-background-alt)"
          >
            <span className="min-w-0 truncate text-[12.5px] font-medium text-foreground">
              {person.name}
              {showDesignation && person.designation ? (
                <span className="ml-1.5 text-[11px] font-normal text-(--color-text-muted)">
                  {person.designation}
                </span>
              ) : null}
            </span>
            {person.phone ? (
              <a
                href={`tel:${person.phone}`}
                className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-(--brand-accent) transition-colors hover:bg-(--brand-accent-soft)"
              >
                <Phone className="size-2.5" />
                {person.phone}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HackathonVenueSection({ venue, coordinators }: HackathonVenueProps) {
  const studentCoordinators = coordinators.filter((c) => c.type === "student");
  const facultyCoordinators = coordinators.filter((c) => c.type === "faculty");
  const academicCoordinators = coordinators.filter((c) => c.type === "academic");
  const leadership = coordinators.filter((c) => c.type === "leadership");
  const venueReveal = useInView<HTMLDivElement>(scrollRevealOpts);
  const committeeReveal = useInView<HTMLDivElement>(scrollRevealOpts);

  return (
    <section
      id="venue"
      className="scroll-mt-20 border-t border-(--color-border) bg-(--color-background-alt) py-9 md:py-11"
    >
      <div ref={venueReveal.ref} className="page-container">
        <div
          className={cn(
            "reveal-up flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between",
            venueReveal.inView && "is-visible",
          )}
        >
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] text-(--brand-accent) uppercase">
              Campus & logistics
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-[1.75rem]">
              Venue & organization
            </h2>
          </div>
          <a
            href={venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex min-h-9 gap-1.5 self-start px-4 text-[13px] md:self-auto"
          >
            Open in Google Maps
            <ExternalLink className="size-3.5" />
          </a>
        </div>

        <div
          className={cn(
            "stagger-in-fast mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12",
            venueReveal.inView && "is-visible",
          )}
        >
          <div className="flex flex-col rounded-md border border-(--color-border) bg-white p-4 lg:col-span-5">
            <div className="flex items-start gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-(--brand-primary) text-white">
                <Building className="size-4" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="font-display text-[15px] font-bold text-foreground">{venue.name}</h3>
                <p className="text-[13px] font-semibold text-(--brand-accent)">{venue.campus}</p>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-(--color-text-secondary)">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-(--color-text-muted)" />
              {venue.address}
            </p>

            <ul className="mt-3 grid gap-1.5">
              {facilities.map(({ label, Icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded bg-(--color-background-alt) px-2.5 py-1.5 text-[13px] text-foreground/85"
                >
                  <Icon className="size-3.5 shrink-0 text-emerald-600" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded border border-(--color-border) p-2.5">
                <p className="text-[10px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase">
                  Team structure
                </p>
                <p className="mt-0.5 text-[13px] font-bold text-foreground">{venue.teamSize}</p>
              </div>
              <div className="rounded border border-(--color-border) p-2.5">
                <p className="text-[10px] font-semibold tracking-[0.06em] text-(--color-text-muted) uppercase">
                  Format
                </p>
                <p className="mt-0.5 text-[13px] font-bold text-foreground">
                  {venue.format} · 24 hours
                </p>
              </div>
            </div>

            <a
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 inline-flex min-h-10 items-center justify-center gap-2 text-sm"
            >
              <Navigation className="size-4" />
              Get directions to MRDU
            </a>
          </div>

          <div className="relative min-h-64 overflow-hidden rounded-md border border-(--color-border) bg-(--color-background-alt) lg:col-span-7">
            <iframe
              title="MRDU Campus Venue Map"
              src={venue.mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>

        <div ref={committeeReveal.ref} className="mt-8">
          <div className={cn("reveal-up", committeeReveal.inView && "is-visible")}>
            <h3 className="font-display text-base font-bold text-foreground">
              Organizing committee & contacts
            </h3>
            <p className="mt-0.5 text-xs text-(--color-text-secondary)">
              Contact student or faculty coordinators for campus arrival assistance and queries.
            </p>
          </div>

          <div
            className={cn(
              "stagger-in-fast mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-3",
              committeeReveal.inView && "is-visible",
            )}
          >
            <CoordinatorCard
              title="Faculty co-ordinators"
              Icon={GraduationCap}
              people={facultyCoordinators}
            />
            <CoordinatorCard
              title="Academic co-ordinators"
              Icon={Building}
              people={academicCoordinators}
            />
            <CoordinatorCard
              title="Student co-ordinators"
              Icon={Phone}
              people={studentCoordinators}
              showDesignation={false}
            />
          </div>

          {leadership.length ? (
            <div
              className={cn(
                "reveal-up mt-2.5 rounded-md border border-(--color-border) bg-white p-3 [transition-delay:200ms]",
                committeeReveal.inView && "is-visible",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded bg-(--brand-accent-soft) text-(--brand-accent)">
                  <Landmark className="size-3" />
                </span>
                <p className="text-[10.5px] font-semibold tracking-[0.06em] text-foreground uppercase">
                  University leadership & patrons
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {leadership.map((leader) => (
                  <div
                    key={leader.name}
                    className="rounded bg-(--color-background-alt) px-2.5 py-1 text-[12px]"
                  >
                    <span className="font-semibold text-foreground">{leader.name}</span>
                    <span className="ml-1.5 text-[11px] text-(--color-text-muted)">
                      {leader.designation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
