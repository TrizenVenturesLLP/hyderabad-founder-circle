import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Briefcase,
  Calendar,
  Clock,
  Code2,
  Compass,
  Handshake,
  Lightbulb,
  MapPin,
  Network,
  Rocket,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import heroImg from "@/assets/hero-rooftop.jpg";
import eventImg from "@/assets/event-room.jpg";
import tableImg from "@/assets/table-detail.jpg";
import whyNetworkImg from "@/assets/why-network.jpg";
import heroCityscape from "@/assets/hero-cityscape.png";
import bestverseLogo from "@/assets/logo-Bestverse.jpeg";
import draperLogo from "@/assets/draper_logo.svg";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { meetupVenueLine, getMeetups, nextMeetup as fallbackNext } from "@/lib/events";
import { links } from "@/lib/links";
import { RsvpButton } from "@/components/rsvp/RsvpButton";

export const Route = createFileRoute("/")({
  loader: async () => {
    const meetups = await getMeetups();
    return { nextMeetup: meetups[0] ?? fallbackNext };
  },
  head: () => ({
    meta: [
      { title: "Hyderabad Founders Network — Monthly Startup Meetup" },
      {
        name: "description",
        content:
          "Build meaningful relationships with founders, builders, operators and aspiring entrepreneurs in Hyderabad. Monthly meetups, shared experiences, and a trusted community beyond pitch decks.",
      },
      { property: "og:title", content: "Hyderabad Founders Network" },
      {
        property: "og:description",
        content:
          "A trusted community where founders connect beyond business cards and pitch decks.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const audiences = [
  {
    title: "Startup Founders",
    desc: "Building the next generation of startups.",
    Icon: Sprout,
  },
  {
    title: "Co-founders",
    desc: "Looking to grow alongside fellow entrepreneurs.",
    Icon: Users,
  },
  {
    title: "Builders",
    desc: "Developers, designers and engineers building innovative products.",
    Icon: Code2,
  },
  {
    title: "Product & Startup Operators",
    desc: "Product managers, growth leaders, marketers and operators.",
    Icon: Briefcase,
  },
  {
    title: "Investors & Mentors",
    desc: "Supporting founders through experience, guidance and connections.",
    Icon: Handshake,
  },
  {
    title: "Aspiring Entrepreneurs",
    desc: "Learning from founders while preparing for their own journey.",
    Icon: Compass,
  },
];

const gains = [
  {
    title: "Meaningful Founder Relationships",
    desc: "Build trusted relationships with founders and builders across Hyderabad.",
    Icon: Network,
  },
  {
    title: "Learn From Real Experiences",
    desc: "Hear honest startup stories, challenges and lessons—not polished presentations.",
    Icon: BookOpen,
  },
  {
    title: "Find Collaboration Opportunities",
    desc: "Meet potential co-founders, partners, customers and teammates.",
    Icon: Handshake,
  },
  {
    title: "Expand Your Network",
    desc: "Connect with mentors, investors and startup ecosystem leaders.",
    Icon: Rocket,
  },
  {
    title: "Continuous Learning",
    desc: "Learn from community discussions, founder stories and shared experiences.",
    Icon: Lightbulb,
  },
  {
    title: "Grow Together",
    desc: "Become part of a community that continues long after every meetup.",
    Icon: Sparkles,
  },
];

const meetupIncludes = [
  "Founder introductions",
  "Community updates",
  "Founder story",
  "Roundtable discussions",
  "Open networking",
  "Snacks & conversations",
];

const storyTeasers = [
  "How we found our first customer",
  "Lessons from building an AI startup",
  "What founders discussed this month",
  "How collaboration led to a new partnership",
];

const communityPartner = {
  name: "DraperU",
  href: "https://www.draperuniversity.com/",
};

const marketingPartner = {
  name: "Bestverse",
  href: null as string | null,
};

const faqs = [
  {
    q: "Is this community free?",
    a: "Yes. Most community meetups are free to attend, though some special events may require registration or a nominal fee.",
  },
  {
    q: "Can I attend if I don't have a startup yet?",
    a: "Absolutely. Aspiring entrepreneurs, builders and startup enthusiasts are welcome.",
  },
  {
    q: "How often do you meet?",
    a: "We host a community meetup every third Saturday of the month, along with occasional workshops and special events.",
  },
  {
    q: "Do I need to register?",
    a: "Yes. Registration helps us manage seating and create a better experience for everyone.",
  },
  {
    q: "Where are the meetups held?",
    a: "Events are hosted at partner venues across Hyderabad such as coworking spaces, incubators and startup hubs.",
  },
];

const gallery = [
  {
    src: heroImg,
    alt: "Founders gathered around a table at golden hour",
  },
  {
    src: eventImg,
    alt: "Founders in conversation at a Hyderabad meetup",
  },
  {
    src: tableImg,
    alt: "Notes, notebooks and chai on a meetup table",
  },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

function JoinButton({
  className,
  children = "Join the Community",
}: {
  className?: string;
  children?: string;
}) {
  return (
    <a
      href={links.community}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("btn-primary", className)}
    >
      {children}
    </a>
  );
}

const scrollRevealOpts = {
  once: true,
  threshold: 0.12,
  rootMargin: "0px 0px -8% 0px",
} as const;

function WhySection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} className="section-space bg-[var(--color-background)]">
      <div className="page-container">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div
            className={cn(
              "reveal-left lg:col-span-6",
              inView && "is-visible",
            )}
          >
            <SectionLabel>Why this network</SectionLabel>
            <h2 className="mt-4 max-w-[22ch] font-display text-[clamp(1.65rem,2.8vw,2.4rem)] leading-[1.08] tracking-[-0.035em] text-foreground">
              Building a startup is hard. You shouldn't have to build it alone.
            </h2>
            <div className="mt-6 space-y-4 text-[14px] leading-[1.65] text-[var(--color-text-secondary)] md:text-[15px]">
              <p>
                Every startup journey comes with uncertainty—finding customers,
                hiring the right people, validating ideas, raising capital, and
                making difficult decisions. Most founders try to solve these in
                isolation.
              </p>
              <p>
                Hyderabad Founders Network brings together founders, builders, and
                startup professionals who believe in learning together, supporting
                one another, and building relationships that last beyond a single
                event.
              </p>
            </div>
          </div>
          <div
            className={cn(
              "reveal-right lg:col-span-6",
              inView && "is-visible",
            )}
            style={{ transitionDelay: inView ? "120ms" : undefined }}
          >
            <img
              src={whyNetworkImg}
              alt="Founders gathered around a table at golden hour"
              width={1600}
              height={1100}
              loading="lazy"
              decoding="async"
              className="aspect-[16/11] w-full object-cover object-[58%_32%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function WhoSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} className="section-space bg-[var(--color-background-alt)]">
      <div className="page-container">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div
            className={cn(
              "audience-copy lg:col-span-4",
              inView && "is-visible",
            )}
          >
            <SectionLabel>Who is this for</SectionLabel>
            <h2 className="mt-4 font-display text-[clamp(1.65rem,2.8vw,2.35rem)] leading-[1.08] tracking-[-0.035em] text-foreground">
              A place for everyone building the startup ecosystem.
            </h2>
            <span
              className="mt-8 block h-1 w-12 rounded-full bg-[var(--brand-accent)]"
              aria-hidden
            />
          </div>

          <ul className="grid list-none gap-3 sm:grid-cols-2 sm:gap-3.5 lg:col-span-8 xl:grid-cols-3">
            {audiences.map((a, i) => (
              <li
                key={a.title}
                className={cn(
                  "audience-card flex h-full flex-col rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-small)] md:p-5",
                  inView && "is-visible",
                )}
                style={{ transitionDelay: inView ? `${70 + i * 45}ms` : "0ms" }}
              >
                <a.Icon
                  className="h-4 w-4 text-[var(--brand-accent)]"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <h3 className="mt-3 font-display text-[0.98rem] tracking-tight text-foreground md:text-[1.05rem]">
                  {a.title}
                </h3>
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  {a.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function GainsSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} className="section-space">
      <div className="page-container">
        <div
          className={cn(
            "reveal-up mx-auto max-w-[760px] text-center",
            inView && "is-visible",
          )}
        >
          <SectionLabel>Why join</SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(1.65rem,2.8vw,2.35rem)] leading-[1.08] tracking-[-0.035em] text-foreground">
            What you'll gain
          </h2>
        </div>

        <ol className="relative mx-auto mt-14 max-w-[980px] list-none space-y-12 md:mt-16 md:space-y-16">
          <div
            className="pointer-events-none absolute top-3 bottom-3 left-[21px] w-px bg-[var(--color-border-strong)] md:left-1/2 md:-translate-x-1/2"
            aria-hidden
          />
          {gains.map((g, i) => {
            const left = i % 2 === 0;
            return (
              <li
                key={g.title}
                className={cn(
                  "timeline-step relative grid md:grid-cols-2 md:gap-16",
                  inView && "is-visible",
                )}
                style={{ transitionDelay: inView ? `${80 + i * 60}ms` : "0ms" }}
              >
                <span
                  className="absolute top-1.5 left-[18px] z-[1] size-2 rounded-full bg-[var(--brand-accent)] md:left-1/2 md:-translate-x-1/2"
                  aria-hidden
                />

                <div
                  className={cn(
                    "pl-10 md:pl-0",
                    left
                      ? "md:col-start-1 md:pr-10 md:text-right"
                      : "md:col-start-2 md:pl-10",
                  )}
                >
                  <g.Icon
                    className={cn(
                      "mb-3 h-4 w-4 text-[var(--brand-accent)]",
                      left && "md:ml-auto",
                    )}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <h3 className="font-display text-[1.05rem] tracking-tight text-foreground md:text-[1.05rem]">
                    {g.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 max-w-[360px] text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]",
                      left ? "md:ml-auto" : "",
                    )}
                  >
                    {g.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function MeetupSection() {
  const { nextMeetup } = Route.useLoaderData();
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section
      ref={ref}
      className="section-space border-y border-[var(--color-border)] bg-[var(--color-background-warm)]"
    >
      <div className="page-container">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div
            className={cn(
              "reveal-left lg:col-span-5",
              inView && "is-visible",
            )}
          >
            <SectionLabel>Monthly meetups</SectionLabel>
            <h2 className="mt-4 max-w-[18ch] font-display text-[clamp(1.55rem,2.6vw,2.05rem)] leading-[1.1] tracking-[-0.035em] text-foreground">
              Every Third Saturday. Same Community. New Conversations.
            </h2>
            <p className="mt-5 max-w-md text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
              No sales pitches. No long keynotes. Just genuine discussions,
              founder stories, and meaningful networking.
            </p>
            <ul className="mt-7 space-y-3">
              {meetupIncludes.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-[14px] text-foreground"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-accent)]"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={cn("meetup-card lg:col-span-7", inView && "is-visible")}
          >
            <div className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-large)]">
              <div className="grid md:grid-cols-12 md:items-stretch">
                <div
                  className={cn(
                    "meetup-media relative aspect-[16/10] md:col-span-5 md:aspect-auto md:min-h-[22rem]",
                    inView && "is-visible",
                  )}
                >
                  <img
                    src={tableImg}
                    alt="Hands gesturing across a table with chai and notebooks"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>

                <div
                  className={cn(
                    "meetup-copy flex flex-col justify-between gap-8 p-6 sm:p-8 md:col-span-7 md:p-10 lg:p-12",
                    inView && "is-visible",
                  )}
                >
                  <div>
                    <p className="meetup-item text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
                      Upcoming meetup
                    </p>
                    <h3 className="meetup-item mt-3 font-display text-[1.15rem] leading-[1.15] tracking-tight text-foreground md:text-[1.3rem]">
                      {nextMeetup.title}
                    </h3>

                    <ul className="meetup-item mt-6 space-y-4 border-t border-[var(--color-border)] pt-5 text-[14px] text-foreground">
                      <li className="flex items-start gap-3">
                        <Calendar
                          className="mt-0.5 size-4 shrink-0 text-[var(--brand-accent)]"
                          aria-hidden
                        />
                        <span>{nextMeetup.dateLabel}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock
                          className="mt-0.5 size-4 shrink-0 text-[var(--brand-accent)]"
                          aria-hidden
                        />
                        <span>{nextMeetup.time}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <MapPin
                          className="mt-0.5 size-4 shrink-0 text-[var(--brand-accent)]"
                          aria-hidden
                        />
                        <span>{meetupVenueLine(nextMeetup)}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="meetup-item flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <RsvpButton
                      event={nextMeetup}
                      className="btn-primary"
                    >
                      RSVP for this meetup
                    </RsvpButton>
                    <Link
                      to="/events/$slug"
                      params={{ slug: nextMeetup.slug }}
                      className="inline-flex min-h-11 items-center text-[14px] font-semibold text-[var(--color-text-secondary)] underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      Full details →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate min-h-[min(72dvh,620px)] overflow-hidden md:min-h-[min(70dvh,660px)]">
      <img
        src={heroCityscape}
        alt=""
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="hero-media absolute inset-0 h-full w-full object-cover object-[62%_45%] sm:object-[58%_42%] md:object-[55%_40%]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(105deg,oklch(0.12_0.02_55_/_0.78)_0%,oklch(0.14_0.02_50_/_0.55)_38%,oklch(0.18_0.025_45_/_0.22)_62%,transparent_82%),linear-gradient(to_top,oklch(0.1_0.02_55_/_0.45)_0%,transparent_42%)]"
        aria-hidden
      />

      <div className="page-container relative flex min-h-[min(72dvh,620px)] items-end pb-12 pt-16 md:min-h-[min(70dvh,660px)] md:items-center md:pb-16 md:pt-20">
        <div className="w-full max-w-[36rem]">
          <h1 className="hero-reveal font-display text-[clamp(2.2rem,4.1vw,3.15rem)] leading-[0.98] tracking-[-0.045em] text-white">
            Hyderabad Founders Network
          </h1>
          <p className="hero-reveal hero-reveal-delay-1 mt-4 text-[clamp(0.98rem,1.25vw,1.1rem)] leading-snug text-white/92 md:mt-5">
            Build meaningful relationships with founders, builders, operators
            and aspiring entrepreneurs in Hyderabad.
          </p>
          <p className="hero-reveal hero-reveal-delay-2 mt-3.5 text-[14px] leading-[1.65] text-white/72 md:text-[15px]">
            We're building a trusted community where founders connect beyond
            business cards and pitch decks. Through monthly meetups, shared
            experiences, and ongoing conversations, we help entrepreneurs
            learn from each other, discover opportunities, and grow together.
          </p>
          <div className="hero-reveal hero-reveal-delay-3 mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
            <JoinButton />
            <Link
              to="/events"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/40 bg-white/10 px-[18px] text-[12.5px] font-semibold whitespace-nowrap text-white backdrop-blur-sm transition-colors duration-200 hover:border-white/60 hover:bg-white/16"
            >
              Upcoming Meetup
            </Link>
          </div>
          <p className="hero-reveal hero-reveal-delay-4 mt-7 text-[12px] font-medium tracking-wide text-white/55">
            Community-led · Supported by Trizen Community
          </p>
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} className="section-space">
      <div className="page-container">
        <div
          className={cn("reveal-up max-w-xl", inView && "is-visible")}
        >
          <SectionLabel>Community in action</SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(1.65rem,2.8vw,2.25rem)] leading-[1.08] tracking-[-0.035em] text-foreground">
            Real conversations. Real people. Real community.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          <div
            className={cn(
              "reveal-up relative min-h-[18rem] overflow-hidden rounded-[28px] shadow-[var(--shadow-card)] md:col-span-7 md:min-h-[24rem]",
              inView && "is-visible",
            )}
            style={{ transitionDelay: inView ? "80ms" : undefined }}
          >
            <img
              src={gallery[0].src}
              alt={gallery[0].alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="grid gap-4 md:col-span-5 md:gap-5">
            <div
              className={cn(
                "reveal-right relative min-h-[11rem] overflow-hidden rounded-[24px] shadow-[var(--shadow-small)] md:min-h-[11.5rem]",
                inView && "is-visible",
              )}
              style={{ transitionDelay: inView ? "140ms" : undefined }}
            >
              <img
                src={gallery[1].src}
                alt={gallery[1].alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div
              className={cn(
                "reveal-right relative min-h-[11rem] overflow-hidden rounded-[24px] shadow-[var(--shadow-small)] md:min-h-[11.5rem]",
                inView && "is-visible",
              )}
              style={{ transitionDelay: inView ? "200ms" : undefined }}
            >
              <img
                src={gallery[2].src}
                alt={gallery[2].alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoriesSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section
      ref={ref}
      className="section-space border-y border-[var(--color-border)] bg-[var(--color-background-warm)]"
    >
      <div className="page-container">
        <div
          className={cn(
            "reveal-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
            inView && "is-visible",
          )}
        >
          <div className="max-w-xl">
            <SectionLabel>Founder stories</SectionLabel>
            <h2 className="mt-4 font-display text-[clamp(1.65rem,2.8vw,2.25rem)] leading-[1.08] tracking-[-0.035em] text-foreground">
              Stories from the Community
            </h2>
          </div>
          <Link
            to="/stories"
            className="text-[14px] font-semibold text-[var(--brand-accent)] underline-offset-4 hover:underline"
          >
            Read more stories →
          </Link>
        </div>
        <ul className="mt-12 grid list-none sm:grid-cols-2 sm:gap-x-12">
          {storyTeasers.map((title, i) => (
            <li
              key={title}
              className={cn("reveal-up", inView && "is-visible")}
              style={{
                transitionDelay: inView ? `${100 + i * 70}ms` : undefined,
              }}
            >
              <Link
                to="/stories"
                className="group flex items-baseline justify-between gap-4 border-b border-[var(--color-border)] py-6"
              >
                <span className="font-display text-[1.05rem] leading-snug tracking-tight text-foreground transition-colors group-hover:text-[var(--brand-accent)] md:text-lg">
                  {title}
                </span>
                <span
                  className="shrink-0 text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--brand-accent)]"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PartnersSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section
      ref={ref}
      className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)] py-9 md:py-11"
    >
      <div className="page-container">
        <div
          className={cn(
            "reveal-up flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-10",
            inView && "is-visible",
          )}
        >
          <div className="max-w-md">
            <SectionLabel>Partners</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.45rem,2.4vw,1.95rem)] tracking-tight text-foreground">
              Growing Together
            </h2>
            <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)] md:text-[14px]">
              Ecosystem partners, coworking spaces, incubators and volunteers
              supporting Hyderabad's startup community.
            </p>
          </div>

          <div
            className={cn(
              "reveal-up grid w-full max-w-lg grid-cols-1 divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-surface)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:w-auto md:min-w-[26rem]",
              inView && "is-visible",
            )}
            style={{ transitionDelay: inView ? "90ms" : undefined }}
          >
            <div className="flex flex-col justify-center px-5 py-4 text-left sm:px-6 sm:py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
                Community partner
              </p>
              <a
                href={communityPartner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-3 transition-opacity hover:opacity-85"
              >
                <img
                  src={draperLogo}
                  alt=""
                  width={192}
                  height={209}
                  className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
                />
                <span className="font-display text-[1.35rem] tracking-tight text-foreground">
                  {communityPartner.name}
                </span>
              </a>
            </div>
            <div className="flex flex-col justify-center px-5 py-4 text-left sm:px-6 sm:py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
                Marketing partner
              </p>
              {marketingPartner.href ? (
                <a
                  href={marketingPartner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-3 transition-opacity hover:opacity-85"
                >
                  <img
                    src={bestverseLogo}
                    alt=""
                    width={200}
                    height={200}
                    className="h-9 w-9 shrink-0 rounded-full object-cover object-center sm:h-10 sm:w-10"
                  />
                  <span className="font-display text-[1.35rem] tracking-tight text-foreground">
                    {marketingPartner.name}
                  </span>
                </a>
              ) : (
                <div className="mt-2.5 inline-flex items-center gap-3">
                  <img
                    src={bestverseLogo}
                    alt=""
                    width={200}
                    height={200}
                    className="h-9 w-9 shrink-0 rounded-full object-cover object-center sm:h-10 sm:w-10"
                  />
                  <span className="font-display text-[1.35rem] tracking-tight text-foreground">
                    {marketingPartner.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section
      ref={ref}
      className="section-space bg-[var(--color-background-alt)]"
    >
      <div className="page-container">
        <div className="mx-auto max-w-3xl">
          <div className={cn("reveal-up", inView && "is-visible")}>
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-4 font-display text-[clamp(1.65rem,2.8vw,2.15rem)] tracking-tight text-foreground">
              Questions, answered.
            </h2>
          </div>
          <dl className="mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {faqs.map((item, i) => (
              <div
                key={item.q}
                className={cn("reveal-up py-6", inView && "is-visible")}
                style={{
                  transitionDelay: inView ? `${80 + i * 60}ms` : undefined,
                }}
              >
                <dt className="font-display text-[1.05rem] tracking-tight text-foreground">
                  {item.q}
                </dt>
                <dd className="mt-2.5 text-[14px] leading-[1.65] text-[var(--color-text-secondary)] md:text-[15px]">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} className="relative overflow-hidden section-space">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,color-mix(in_oklab,var(--brand-accent)_10%,transparent),transparent_58%)]"
        aria-hidden
      />
      <div className="page-container relative">
        <div
          className={cn(
            "reveal-up mx-auto max-w-2xl text-center",
            inView && "is-visible",
          )}
        >
          <h2 className="font-display text-[clamp(1.65rem,2.8vw,2.35rem)] leading-[1.08] tracking-[-0.035em] text-foreground">
            Build your startup network before you need it.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">
            Whether you're launching your first startup or looking for your
            people—you're welcome here.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <JoinButton />
            <Link to="/events" className="btn-secondary">
              View upcoming meetup
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <div className="relative bg-[var(--color-background)]">
      <HeroSection />
      <WhySection />
      <WhoSection />
      <GainsSection />
      <MeetupSection />
      <GallerySection />
      <StoriesSection />
      <PartnersSection />
      <FaqSection />
      <FinalCtaSection />
    </div>
  );
}
