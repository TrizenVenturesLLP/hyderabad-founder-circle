import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarPlus, Mail } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { links } from "@/lib/links";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/about")({
  head: () => {
    const siteUrl = "https://community.trizenventures.com";
    const title = "About — Trizen Community";
    const desc =
      "Trizen Community is an event hosting platform for Hyderabad — communities publish events, people discover and register.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `${siteUrl}/about` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}/about` }],
    };
  },
  component: AboutPage,
});

const scrollRevealOpts = {
  once: true,
  threshold: 0.22,
  rootMargin: "0px 0px -16% 0px",
} as const;

const pillars = [
  {
    title: "For attendees",
    body: "Browse events across communities, register in minutes, and get confirmation details — no public account required.",
  },
  {
    title: "For organizers",
    body: "Host your community’s events on one platform: registrations, payments, and attendee communication in one place.",
  },
  {
    title: "For Hyderabad",
    body: "A shared surface for founder meetups, music nights, workshops, and gatherings — not locked to a single community.",
  },
];

const howItWorks = [
  {
    title: "Communities publish",
    body: "Organizers list events with timings, venue, tickets, and registration details.",
  },
  {
    title: "People discover",
    body: "Attendees explore upcoming events by community, date, or interest.",
  },
  {
    title: "Everyone shows up",
    body: "Register, confirm, and walk into the room with clear event information.",
  },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

function AboutPage() {
  const hero = useInView<HTMLElement>(scrollRevealOpts);
  const pillarsReveal = useInView<HTMLElement>(scrollRevealOpts);
  const how = useInView<HTMLElement>(scrollRevealOpts);
  const built = useInView<HTMLElement>(scrollRevealOpts);
  const cta = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <div className="bg-[var(--color-background)]">
      <header
        ref={hero.ref}
        className="relative isolate overflow-hidden border-b border-[var(--color-border)]"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 90% 0%, color-mix(in oklab, var(--brand-accent) 12%, transparent), transparent 55%), radial-gradient(ellipse 45% 40% at 0% 100%, color-mix(in oklab, var(--brand-primary) 7%, transparent), transparent 50%)",
          }}
        />
        <div className="page-container relative grid gap-10 py-12 md:grid-cols-12 md:gap-12 md:py-16 lg:py-20">
          <div
            className={cn(
              "reveal-up md:col-span-7",
              hero.inView && "is-visible",
            )}
          >
            <SectionLabel>About</SectionLabel>
            <p
              className="mt-4 text-[clamp(1.25rem,2.8vw,1.55rem)] font-semibold tracking-[-0.03em] text-foreground"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              Trizen Community
            </p>
            <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(1.9rem,4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">
              An event platform for communities in Hyderabad.
            </h1>
            <p className="mt-5 max-w-[38rem] text-[15px] leading-[1.7] text-[var(--color-text-secondary)]">
              Trizen Community helps organizers publish events and helps people
              discover and register for them — founder meetups, workshops, music
              nights, and more, all in one place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/events" className="btn-primary gap-2 !rounded-full">
                Explore events
                <ArrowRight className="size-4" strokeWidth={1.75} />
              </Link>
              <Link to="/host" className="btn-secondary gap-2 !rounded-full">
                <CalendarPlus className="size-4" strokeWidth={1.75} aria-hidden />
                Host an event
              </Link>
            </div>
          </div>

          <div
            className={cn(
              "reveal-up md:col-span-5",
              hero.inView && "is-visible",
            )}
            style={{ transitionDelay: hero.inView ? "90ms" : undefined }}
          >
            <div className="overflow-hidden border border-[var(--color-border)]">
              <img
                src="/july-2026-3.jpeg"
                alt="People gathering at a community event in Hyderabad"
                width={1600}
                height={1100}
                fetchPriority="high"
                decoding="async"
                className="aspect-[4/3] w-full object-cover object-[50%_35%]"
              />
            </div>
          </div>
        </div>
      </header>

      <section
        ref={pillarsReveal.ref}
        className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)]"
      >
        <div className="page-container py-12 md:py-14">
          <div
            className={cn("reveal-up max-w-xl", pillarsReveal.inView && "is-visible")}
          >
            <SectionLabel>Who it’s for</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.45rem,2.6vw,1.85rem)] tracking-tight text-foreground">
              Built for attendees and organizers
            </h2>
          </div>
          <ul
            className={cn(
              "stagger-in mt-8 grid list-none gap-0 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] md:grid-cols-3 md:divide-x md:divide-y-0",
              pillarsReveal.inView && "is-visible",
            )}
          >
            {pillars.map((item) => (
              <li key={item.title} className="py-6 md:px-6 md:first:pl-0 md:last:pr-0">
                <h3 className="font-display text-[1.1rem] tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section ref={how.ref} className="border-b border-[var(--color-border)]">
        <div className="page-container py-12 md:py-14">
          <div className={cn("reveal-up", how.inView && "is-visible")}>
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(1.45rem,2.6vw,1.85rem)] tracking-tight text-foreground">
              From listing to the room
            </h2>
          </div>
          <ol
            className={cn(
              "stagger-in mt-8 list-none divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]",
              how.inView && "is-visible",
            )}
          >
            {howItWorks.map((item, i) => (
              <li
                key={item.title}
                className="grid gap-2 py-6 sm:grid-cols-[3.5rem_minmax(0,12rem)_minmax(0,1fr)] sm:items-baseline sm:gap-6"
              >
                <span
                  className="font-display text-[1.05rem] tabular-nums text-[var(--brand-accent)]"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-[1.05rem] tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        ref={built.ref}
        className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)]"
      >
        <div className="page-container grid gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-14">
          <div
            className={cn(
              "reveal-up md:col-span-7",
              built.inView && "is-visible",
            )}
          >
            <SectionLabel>Built by</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.45rem,2.6vw,1.85rem)] tracking-tight text-foreground">
              <a
                href={links.sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--brand-accent)]"
              >
                Trizen Ventures
              </a>
            </h2>
            <p className="mt-4 max-w-xl text-[14.5px] leading-[1.7] text-[var(--color-text-secondary)]">
              Trizen Community is built by Trizen Ventures — a Hyderabad team
              focused on products that help communities and businesses move
              faster. Communities like Hyderabad Founders Network and NanoSpace
              host events here; the platform stays open for more organizers to
              join.
            </p>
          </div>
          <div
            className={cn(
              "reveal-up md:col-span-5",
              built.inView && "is-visible",
            )}
            style={{ transitionDelay: built.inView ? "80ms" : undefined }}
          >
            <dl className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-[12px] text-[var(--color-text-muted)]">
                  Email
                </dt>
                <dd className="text-right text-[13.5px] font-medium text-foreground">
                  <a
                    href={`mailto:${links.email}`}
                    className="break-all hover:text-[var(--brand-accent)]"
                  >
                    {links.email}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-[12px] text-[var(--color-text-muted)]">
                  Phone
                </dt>
                <dd className="text-[13.5px] font-medium text-foreground">
                  <a
                    href={links.phoneHref}
                    className="hover:text-[var(--brand-accent)]"
                  >
                    {links.phone}
                  </a>
                </dd>
              </div>
              <div className="py-3.5">
                <dt className="text-[12px] text-[var(--color-text-muted)]">
                  Based in
                </dt>
                <dd className="mt-1 text-[13.5px] leading-relaxed text-foreground">
                  <a
                    href={links.address.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--brand-accent)]"
                  >
                    {links.address.line}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section ref={cta.ref} className="bg-[var(--brand-primary)]">
        <div
          className={cn(
            "page-container reveal-up py-12 text-center md:py-14",
            cta.inView && "is-visible",
          )}
        >
          <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(1.55rem,3vw,2.1rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-white">
            Ready to explore — or host?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-white/75">
            Browse events happening now, or apply to host your community’s next
            gathering on Trizen Community.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/events"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-medium text-[var(--brand-primary)] hover:opacity-90"
            >
              Explore events
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/30 px-5 text-[14px] font-medium text-white hover:bg-white/10"
            >
              <Mail className="size-4" strokeWidth={1.75} aria-hidden />
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
