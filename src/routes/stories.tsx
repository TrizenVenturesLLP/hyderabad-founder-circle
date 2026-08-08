import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { links } from "@/lib/links";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Stories — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "What founders walk away with from Hyderabad Founders Network meetups — intros, hires, advice, and partnerships — plus photos and local resources.",
      },
      { property: "og:title", content: "Stories — Hyderabad Founders Network" },
      { property: "og:url", content: "/stories" },
    ],
    links: [{ rel: "canonical", href: "/stories" }],
  }),
  component: StoriesPage,
});

const scrollRevealOpts = {
  once: true,
  threshold: 0.28,
  rootMargin: "0px 0px -22% 0px",
} as const;

/** Outcomes people can get — not fabricated member quotes. */
const outcomes = [
  {
    title: "Intros that turn into customers",
    body: "Meet operators and peers who care about the problem you're solving — design partners and early users that start as a conversation, not a cold pitch.",
  },
  {
    title: "Hiring conversations that start naturally",
    body: "Founding talent often shows up in the room. Many of the best hires begin as a side chat after the roundtable, not a LinkedIn outreach.",
  },
  {
    title: "Honest advice on pricing and GTM",
    body: "Founders share what they're actually charging, packaging, and shipping — the kind of detail that rarely makes it onto a feed.",
  },
  {
    title: "Partnerships that stick",
    body: "Collaborations grow out of repeated meetups: co-marketing, intros to investors, and working relationships that last past one Saturday.",
  },
];

const resources = [
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
    desc: "Pan-India founder community with a strong Hyderabad chapter.",
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

const gallery = [
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
] as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

function StoriesPage() {
  const hero = useInView<HTMLElement>({
    once: true,
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px",
  });
  const outcomesReveal = useInView<HTMLElement>(scrollRevealOpts);
  const galleryReveal = useInView<HTMLElement>(scrollRevealOpts);
  const resourcesReveal = useInView<HTMLElement>(scrollRevealOpts);
  const cta = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <div className="bg-[var(--color-background)]">
      <header
        ref={hero.ref}
        className="trizen-mesh border-b border-[var(--color-border)]"
      >
        <div
          className={cn(
            "page-container reveal-up pt-6 pb-5 md:pt-7 md:pb-6",
            hero.inView && "is-visible",
          )}
        >
          <SectionLabel>Stories</SectionLabel>
          <h1 className="mt-1.5 max-w-[16ch] font-display text-[clamp(1.75rem,3.4vw,2.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">
            What people walk away with.
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
            Not polished case studies — the kinds of outcomes founders leave
            the room with. Plus photos from past meetups and Hyderabad resources
            we keep recommending.
          </p>
        </div>
      </header>

      {/* OUTCOMES */}
      <section
        ref={outcomesReveal.ref}
        className="border-b border-[var(--color-border)]"
      >
        <div className="page-container py-7 md:py-8">
          <div
            className={cn(
              "reveal-up max-w-xl",
              outcomesReveal.inView && "is-visible",
            )}
          >
            <SectionLabel>In the room</SectionLabel>
            <h2 className="mt-1.5 font-display text-[clamp(1.2rem,2.2vw,1.45rem)] tracking-tight text-foreground">
              What you can get from showing up
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
              Every meetup is different. These are the kinds of wins that keep
              people coming back.
            </p>
          </div>

          <ol
            className={cn(
              "stagger-in mt-5 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]",
              outcomesReveal.inView && "is-visible",
            )}
          >
            {outcomes.map((item, i) => (
              <li key={item.title} className="py-4 md:py-[1.125rem]">
                <div className="grid gap-1.5 md:grid-cols-[2.75rem_minmax(0,0.95fr)_minmax(0,1.15fr)] md:gap-6">
                  <span
                    className="font-display text-[0.95rem] tabular-nums tracking-tight text-[var(--brand-accent)] md:pt-0.5"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-[0.98rem] leading-snug tracking-tight text-foreground md:text-[1.05rem]">
                    {item.title}
                  </h3>
                  <p className="text-[13.5px] leading-[1.55] text-[var(--color-text-secondary)] md:pt-0.5">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* GALLERY */}
      <section ref={galleryReveal.ref}>
        <div className="page-container py-7 md:py-8">
          <div
            className={cn(
              "reveal-up max-w-xl",
              galleryReveal.inView && "is-visible",
            )}
          >
            <SectionLabel>From the meetups</SectionLabel>
            <h2 className="mt-1.5 font-display text-[clamp(1.2rem,2.2vw,1.45rem)] tracking-tight text-foreground">
              Same room. New faces each month.
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              Snapshots from completed meetups.
            </p>
          </div>

          <div
            className={cn(
              "stagger-in-fast mt-5 grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4",
              galleryReveal.inView && "is-visible",
            )}
          >
            {gallery.map((shot) => (
              <figure key={shot.src} className="overflow-hidden">
                <img
                  src={shot.src}
                  alt={shot.alt}
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={800}
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* RESOURCES */}
      <section
        ref={resourcesReveal.ref}
        className="border-t border-[var(--color-border)] bg-[var(--color-background-alt)]"
      >
        <div className="page-container py-7 md:py-8">
          <div
            className={cn(
              "reveal-up max-w-xl",
              resourcesReveal.inView && "is-visible",
            )}
          >
            <SectionLabel>Hyderabad</SectionLabel>
            <h2 className="mt-1.5 font-display text-[clamp(1.2rem,2.2vw,1.45rem)] tracking-tight text-foreground">
              Useful local resources
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
              Places and communities we keep pointing founders to.
            </p>
          </div>

          <ul
            className={cn(
              "stagger-in-fast mt-4 grid list-none border-t border-[var(--color-border)] sm:grid-cols-2 sm:gap-x-8",
              resourcesReveal.inView && "is-visible",
            )}
          >
            {resources.map((r) => (
              <li key={r.name}>
                <a
                  href={r.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-baseline justify-between gap-4 border-b border-[var(--color-border)] py-3"
                >
                  <div className="min-w-0">
                    <p className="font-display text-[0.98rem] leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-[var(--brand-accent)] md:text-[1.02rem]">
                      {r.name}
                    </p>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--color-text-secondary)]">
                      {r.desc}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="size-3.5 shrink-0 text-[var(--color-text-muted)] transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--brand-accent)]"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="sr-only">
                    Open {r.name} location in Google Maps
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section
        ref={cta.ref}
        className="border-t border-[var(--color-border)] trizen-mesh"
      >
        <div
          className={cn(
            "page-container reveal-up py-8 text-center md:py-9",
            cta.inView && "is-visible",
          )}
        >
          <SectionLabel>Next meetup</SectionLabel>
          <h2 className="mx-auto mt-1.5 max-w-[18ch] font-display text-[clamp(1.3rem,2.4vw,1.6rem)] font-semibold tracking-tight text-foreground">
            Come see what the room is like.
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
            Free to attend. Open to founders, operators, and anyone serious about
            building.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href={links.community}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary gap-2"
            >
              <WhatsAppIcon className="size-4" />
              Join the community
            </a>
            <Link to="/contact" className="btn-secondary gap-2">
              Get in touch
              <ArrowUpRight className="size-3.5" strokeWidth={1.75} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
