import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail } from "lucide-react";
import bestverseLogo from "@/assets/logo-Bestverse.jpeg";
import draperLogo from "@/assets/draper_logo.svg";
import { useInView } from "@/hooks/use-in-view";
import { links } from "@/lib/links";
import { cn } from "@/lib/utils";
import { TrizenProductsSection } from "@/components/TrizenProductsSection";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Partners — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "Our mission, how we operate, and the partners and sponsor who help keep the lights on.",
      },
      { property: "og:title", content: "About — Hyderabad Founders Network" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const scrollRevealOpts = {
  once: true,
  threshold: 0.28,
  rootMargin: "0px 0px -22% 0px",
} as const;

const partners = [
  {
    name: "T-Hub",
    desc: "India's largest incubator, Madhapur.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=T-Hub+Madhapur+Hyderabad",
  },
  {
    name: "WE Hub",
    desc: "State-led incubator for women founders.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=WE+Hub+Hyderabad",
  },
  {
    name: "eChai",
    desc: "Pan-India founder community with strong Hyderabad chapter.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=eChai+Hyderabad",
  },
  {
    name: "91springboard",
    desc: "Coworking spaces across the city.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=91springboard+Hyderabad",
  },
  {
    name: "AIC at IIIT-H",
    desc: "Deep-tech incubator.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=AIC+IIIT+Hyderabad",
  },
  {
    name: "iTIC",
    desc: "IIT-H's incubator for tech startups.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=iTIC+IIT+Hyderabad",
  },
];

const supportingPartners = [
  {
    name: "DraperU",
    role: "Community partner",
    desc: "Home to our monthly meetups in Gachibowli.",
    href: "https://www.draperuniversity.com/",
    logo: draperLogo,
  },
  {
    name: "Bestverse",
    role: "Marketing partner",
    desc: "Supports how the community shows up and shares its story.",
    href: null as string | null,
    logo: bestverseLogo,
  },
];

const howItWorks = [
  {
    title: "Community-led",
    body: "Members host, members shape the agenda.",
  },
  {
    title: "Company-supported",
    body: (
      <>
        <strong className="font-semibold text-foreground">
          {links.sponsor.name}
        </strong>{" "}
        provides venue and resources as a sponsor — not as the host.
      </>
    ),
  },
  {
    title: "No selling",
    body: "No pitching, no selling to the room, no gatekeepers.",
  },
  {
    title: "Open room",
    body: "Free to attend. Open to anyone serious about building.",
  },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

function AboutPage() {
  const hero = useInView<HTMLElement>(scrollRevealOpts);
  const how = useInView<HTMLElement>(scrollRevealOpts);
  const ecosystem = useInView<HTMLElement>(scrollRevealOpts);
  const supporting = useInView<HTMLElement>(scrollRevealOpts);
  const sponsor = useInView<HTMLElement>(scrollRevealOpts);
  const cta = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <div className="bg-[var(--color-background)]">
      <header
        ref={hero.ref}
        className="trizen-mesh border-b border-[var(--color-border)]"
      >
        <div className="page-container grid items-center gap-8 pt-10 pb-9 md:grid-cols-12 md:gap-10 md:pt-12 md:pb-11">
          <div
            className={cn(
              "reveal-left md:col-span-6 lg:col-span-6",
              hero.inView && "is-visible",
            )}
          >
            <SectionLabel>About</SectionLabel>
            <h1 className="mt-2.5 max-w-[18ch] font-display text-[clamp(1.85rem,3.8vw,2.55rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground">
              We started this because Hyderabad deserves its own founder room.
            </h1>
            <div className="mt-4 max-w-[36rem] space-y-3 text-[14.5px] leading-[1.7] text-[var(--color-text-secondary)]">
              <p>
                The Hyderabad Founders Network exists for one simple reason:
                trust and long-term relationships only show up when the same
                people meet, on purpose, again and again.
              </p>
              <p>
                We&apos;re not an accelerator. We&apos;re not a paid programme.
                We&apos;re a peer community — founders, operators and aspiring
                entrepreneurs — who decided to meet on the 3rd Saturday of every
                month and keep showing up.
              </p>
            </div>
          </div>
          <div
            className={cn(
              "reveal-right md:col-span-6 lg:col-span-6",
              hero.inView && "is-visible",
            )}
            style={{ transitionDelay: hero.inView ? "90ms" : undefined }}
          >
            <div className="overflow-hidden shadow-[var(--shadow-card)]">
              <img
                src="/july-2026-3.jpeg"
                alt="Founders together at a Hyderabad Founders Network meetup"
                width={1600}
                height={1100}
                fetchPriority="high"
                decoding="async"
                className="aspect-[16/11] w-full object-cover object-[50%_35%]"
              />
            </div>
          </div>
        </div>
      </header>

      <section
        ref={how.ref}
        className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)]"
      >
        <div className="page-container py-10 md:py-12">
          <div className={cn("reveal-up", how.inView && "is-visible")}>
            <SectionLabel>How it works</SectionLabel>
          </div>
          <ul
            className={cn(
              "stagger-in mt-6 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]",
              how.inView && "is-visible",
            )}
          >
            {howItWorks.map((item, i) => (
              <li
                key={item.title}
                className="grid gap-1.5 py-5 sm:grid-cols-[3.5rem_minmax(0,11rem)_minmax(0,1fr)] sm:items-baseline sm:gap-6 md:py-5"
              >
                <span
                  className="font-display text-[1.05rem] tabular-nums tracking-tight text-[var(--brand-accent)]"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-[1.08rem] tracking-tight text-foreground">
                  {item.title}
                </h2>
                <p className="text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        ref={ecosystem.ref}
        className="border-b border-[var(--color-border)]"
      >
        <div className="page-container py-10 md:py-12">
          <div className={cn("reveal-up", ecosystem.inView && "is-visible")}>
            <SectionLabel>Ecosystem partners</SectionLabel>
            <h2 className="mt-2 font-display text-[clamp(1.4rem,2.5vw,1.7rem)] tracking-tight text-foreground">
              Communities and spaces across Hyderabad
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              Places and communities we collaborate with around the city.
            </p>
          </div>

          <ul
            className={cn(
              "stagger-in mt-7 grid list-none sm:grid-cols-2 sm:gap-x-10",
              ecosystem.inView && "is-visible",
            )}
          >
            {partners.map((p) => (
              <li key={p.name} className="border-t border-[var(--color-border)]">
                <a
                  href={p.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start justify-between gap-4 py-4 transition-colors duration-200 hover:text-[var(--brand-accent)]"
                >
                  <div className="min-w-0">
                    <p className="text-[1rem] font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-[var(--brand-accent)]">
                      {p.name}
                    </p>
                    <p className="mt-1 text-[13.5px] leading-snug text-[var(--color-text-secondary)]">
                      {p.desc}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="mt-0.5 size-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--brand-accent)]"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="sr-only">
                    Open {p.name} location in Google Maps
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        ref={supporting.ref}
        className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)]"
      >
        <div className="page-container py-10 md:py-12">
          <div className={cn("reveal-up", supporting.inView && "is-visible")}>
            <SectionLabel>Community & marketing</SectionLabel>
            <h2 className="mt-2 font-display text-[clamp(1.4rem,2.5vw,1.7rem)] tracking-tight text-foreground">
              Partners who help us meet and be seen
            </h2>
          </div>

          <ul
            className={cn(
              "stagger-in mt-7 grid list-none border-t border-[var(--color-border)] sm:grid-cols-2 sm:gap-x-12",
              supporting.inView && "is-visible",
            )}
          >
            {supportingPartners.map((p) => {
              const content = (
                <div className="flex items-start gap-3.5 py-5">
                  <img
                    src={p.logo}
                    alt=""
                    width={80}
                    height={80}
                    className={
                      p.name === "Bestverse"
                        ? "mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
                        : "mt-0.5 h-8 w-8 shrink-0 object-contain"
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-[1.02rem] font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-[var(--brand-accent)]">
                        {p.name}
                      </p>
                      <p className="text-[12px] text-[var(--color-text-muted)]">
                        {p.role}
                      </p>
                    </div>
                    <p className="mt-1.5 max-w-[34ch] text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
                      {p.desc}
                    </p>
                  </div>
                  {p.href ? (
                    <ArrowUpRight
                      className="mt-1 size-3.5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--brand-accent)]"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  ) : null}
                </div>
              );

              return (
                <li
                  key={p.name}
                  className="border-b border-[var(--color-border)]"
                >
                  {p.href ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        ref={sponsor.ref}
        className="border-b border-[var(--color-border)]"
      >
        <div className="page-container grid gap-8 py-10 md:grid-cols-12 md:gap-10 md:py-12">
          <div
            className={cn(
              "reveal-left md:col-span-7",
              sponsor.inView && "is-visible",
            )}
          >
            <SectionLabel>Sponsor</SectionLabel>
            <h2 className="mt-2 font-display text-[clamp(1.4rem,2.5vw,1.7rem)] tracking-tight text-foreground">
              <a
                href={links.sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:text-[var(--brand-accent)]"
              >
                {links.sponsor.name}
              </a>
            </h2>
            <p className="mt-3 max-w-xl text-[14.5px] leading-[1.7] text-[var(--color-text-secondary)]">
              Venue, chai and operations are supported by{" "}
              <a
                href={links.sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-[var(--brand-accent)] hover:underline"
              >
                {links.sponsor.name}
              </a>
              . They don&apos;t get a sales slot. They don&apos;t get the floor.
              They believe Hyderabad&apos;s founder ecosystem grows faster when
              founders meet each other freely.
            </p>
          </div>

          <div
            className={cn(
              "reveal-right md:col-span-5",
              sponsor.inView && "is-visible",
            )}
            style={{ transitionDelay: sponsor.inView ? "100ms" : undefined }}
          >
            <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
              Sponsor contact
            </p>
            <dl className="mt-3 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
              <div className="py-3">
                <dt className="text-[11px] font-medium text-[var(--color-text-muted)]">
                  Operational address
                </dt>
                <dd className="mt-1 text-[13.5px] leading-relaxed text-foreground">
                  <a
                    href={links.address.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-[var(--brand-accent)]"
                  >
                    {links.address.line}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[11px] font-medium text-[var(--color-text-muted)]">
                  Phone
                </dt>
                <dd className="text-[13.5px] font-medium text-foreground">
                  <a
                    href={links.phoneHref}
                    className="transition-colors duration-200 hover:text-[var(--brand-accent)]"
                  >
                    {links.phone}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[11px] font-medium text-[var(--color-text-muted)]">
                  Email
                </dt>
                <dd className="min-w-0 text-right text-[13.5px] font-medium text-foreground">
                  <a
                    href={`mailto:${links.email}`}
                    className="break-all transition-colors duration-200 hover:text-[var(--brand-accent)]"
                  >
                    {links.email}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[11px] font-medium text-[var(--color-text-muted)]">
                  Website
                </dt>
                <dd className="text-[13.5px] font-medium text-foreground">
                  <a
                    href={links.sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 transition-colors duration-200 hover:text-[var(--brand-accent)]"
                  >
                    trizenventures.com
                    <ArrowUpRight
                      className="size-3.5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <TrizenProductsSection
        title="Continue your journey with Trizen"
        description="Products and initiatives from the organization behind Hyderabad Founders Circle."
        showVisitCta={false}
        className="border-t-0"
      />

      <section
        ref={cta.ref}
        className="trizen-mesh border-t border-[var(--color-border)]"
      >
        <div
          className={cn(
            "page-container reveal-up py-10 text-center md:py-12",
            cta.inView && "is-visible",
          )}
        >
          <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(1.55rem,3vw,2.1rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground">
            Be part of the room.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
            Join WhatsApp for community updates — or get in touch if you want to
            partner, host, or share a story.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row sm:gap-3">
            <a
              href={links.community}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary gap-2"
            >
              <WhatsAppIcon className="size-4" />
              Join the Community
            </a>
            <Link to="/contact" className="btn-secondary gap-2">
              <Mail className="size-4" strokeWidth={1.75} aria-hidden />
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
