import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  MapPin,
  Ticket,
} from "lucide-react";
import bestverseLogo from "@/assets/logo-Bestverse.jpeg";
import draperLogo from "@/assets/draper_logo.svg";

/** Real photos from Hyderabad Founders Network meetups */
const eventPhotoHero = "/july-2026-1.jpeg";
const eventPhotoMeetup = "/july-2026-2.jpeg";
const eventPhotoMoment = "/july-2026-3.jpeg";
const eventPhotoCommunity = "/july-2026-4.jpeg";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import {
  meetupVenueLine,
  getMeetups,
  getNextMeetup,
  nextMeetup as fallbackNext,
  type Meetup,
} from "@/lib/events";
import { links } from "@/lib/links";
import { RsvpButton } from "@/components/rsvp/RsvpButton";
import { TrizenProductsSection } from "@/components/TrizenProductsSection";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const Route = createFileRoute("/")({
  loader: async () => {
    const meetups = await getMeetups();
    return { nextMeetup: getNextMeetup(meetups) ?? fallbackNext };
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
  },
  {
    title: "Co-founders",
    desc: "Looking to grow alongside fellow entrepreneurs.",
  },
  {
    title: "Builders",
    desc: "Developers, designers and engineers building innovative products.",
  },
  {
    title: "Product & Startup Operators",
    desc: "Product managers, growth leaders, marketers and operators.",
  },
  {
    title: "Investors & Mentors",
    desc: "Supporting founders through experience, guidance and connections.",
  },
  {
    title: "Aspiring Entrepreneurs",
    desc: "Learning from founders while preparing for their own journey.",
  },
];

const gains = [
  {
    title: "Meaningful Founder Relationships",
    desc: "Build trusted relationships with founders and builders across Hyderabad.",
  },
  {
    title: "Learn From Real Experiences",
    desc: "Hear honest startup stories, challenges and lessons—not polished presentations.",
  },
  {
    title: "Find Collaboration Opportunities",
    desc: "Meet potential co-founders, partners, customers and teammates.",
  },
  {
    title: "Expand Your Network",
    desc: "Connect with mentors, investors and startup ecosystem leaders.",
  },
  {
    title: "Continuous Learning",
    desc: "Learn from community discussions, founder stories and shared experiences.",
  },
  {
    title: "Grow Together",
    desc: "Become part of a community that continues long after every meetup.",
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
  "Intros that turn into customers",
  "Hiring conversations that start naturally",
  "Honest advice on pricing and GTM",
  "Partnerships that stick",
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
    src: eventPhotoMeetup,
    alt: "Founders at the Hyderabad Founders Network meetup",
  },
  {
    src: eventPhotoMoment,
    alt: "Speakers and hosts at a Hyderabad Founders Network session",
  },
  {
    src: eventPhotoCommunity,
    alt: "Community moment from a Hyderabad Founders Network meetup",
  },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

const scrollRevealOpts = {
  once: true,
  threshold: 0.28,
  rootMargin: "0px 0px -22% 0px",
} as const;

/** Conversion path: Hero → Trust → Why → Who → Gains → Meetup → Gallery → Stories → FAQ → CTA */

function HeroSection({ nextMeetup }: { nextMeetup: Meetup }) {
  return (
    <section
      id="hero"
      className="flex min-h-[calc(100dvh-64px)] flex-col md:min-h-[calc(100dvh-68px)]"
    >
      <div className="relative isolate min-h-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="hero-slide absolute inset-0">
            <img
              src={eventPhotoHero}
              alt=""
              width={1920}
              height={1080}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full scale-[1.02] object-cover object-[50%_58%] md:object-[50%_48%]"
            />
          </div>
        </div>

        <div
          className="hero-overlay absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,24,0.82)_0%,rgba(8,10,24,0.52)_34%,rgba(8,10,24,0.22)_58%,rgba(8,10,24,0.48)_100%)]"
          aria-hidden
        />

        <div className="page-container relative flex h-full items-center justify-center pb-10 pt-10 md:pb-14 md:pt-8">
          <div className="mx-auto w-full max-w-3xl text-center">
            <p className="hero-reveal text-[11px] font-medium tracking-[0.14em] text-white/72 uppercase md:text-[12px]">
              Trizen Community
            </p>
            <h1
              className="hero-reveal hero-reveal-delay-1 mx-auto mt-3 max-w-[14ch] font-semibold leading-[1.02] tracking-[-0.035em] text-white md:mt-4"
              style={{
                fontFamily: "var(--font-brand)",
                fontSize: "clamp(2.35rem, 7.5vw, 4.25rem)",
              }}
            >
              Hyderabad Founders Network
            </h1>
            <p className="hero-reveal hero-reveal-delay-2 mx-auto mt-4 max-w-[26rem] text-[15px] leading-relaxed text-white/82 md:mt-5 md:text-[16px]">
              Where founders find their people—and grow together.
            </p>
            <p className="hero-reveal hero-reveal-delay-2 mt-3 text-[13px] font-medium tracking-wide text-white/68 md:text-[14px]">
              Next meetup · {nextMeetup.dateLabel}
            </p>
            <div className="hero-reveal hero-reveal-delay-3 mt-6 flex flex-col items-center justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
              <RsvpButton event={nextMeetup} className="btn-primary min-w-[10.5rem] gap-2">
                <Ticket className="size-4" strokeWidth={1.75} aria-hidden />
                Book your spot
              </RsvpButton>
              <a
                href={links.community}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] min-w-[10.5rem] items-center justify-center gap-2 border border-white/28 bg-white/10 px-5 text-[14px] font-medium whitespace-nowrap text-white transition-colors duration-200 hover:border-white/45 hover:bg-white/16"
              >
                <WhatsAppIcon className="size-4" />
                Join the Community
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        className="hero-reveal hero-reveal-delay-3 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]"
        aria-label="Community trust signals"
      >
        <div className="page-container flex flex-col items-center gap-3 py-2.5 md:flex-row md:justify-between md:gap-8 md:py-3.5">
          <p className="text-center text-[12px] font-medium text-[var(--color-text-secondary)] md:text-left md:text-[13px]">
            Every third Saturday · Hyderabad · Community-led
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
            <a
              href={communityPartner.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 opacity-80 transition-opacity hover:opacity-100"
            >
              <img
                src={draperLogo}
                alt=""
                width={192}
                height={209}
                className="h-6 w-6 object-contain md:h-7 md:w-7"
              />
              <span className="text-[12.5px] font-medium text-foreground md:text-[13px]">
                {communityPartner.name}
              </span>
            </a>
            <div className="inline-flex items-center gap-2.5 opacity-80">
              <img
                src={bestverseLogo}
                alt=""
                width={200}
                height={200}
                className="h-6 w-6 rounded-full object-cover md:h-7 md:w-7"
              />
              <span className="text-[12.5px] font-medium text-foreground md:text-[13px]">
                {marketingPartner.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} id="why" className="section-space">
      <div className="page-container">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div
            className={cn("reveal-left lg:col-span-5", inView && "is-visible")}
          >
            <SectionLabel>Why we exist</SectionLabel>
            <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(1.7rem,2.8vw,2.25rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
              Building is better together.
            </h2>
            <div className="mt-5 max-w-[40ch] space-y-3.5 text-[14.5px] leading-[1.7] text-[var(--color-text-secondary)]">
              <p>
                Startup life is full of hard calls. This network exists so you
                don&apos;t have to face them alone—honest conversations, shared
                lessons, and friendships that outlast any single meetup.
              </p>
              <p>
                Every third Saturday, founders and builders gather in Hyderabad
                to learn from each other and keep growing.
              </p>
            </div>
            <div className="mt-7">
              <a href="#next-meetup" className="btn-secondary gap-2">
                <Calendar className="size-4" strokeWidth={1.75} aria-hidden />
                See upcoming meetup
              </a>
            </div>
          </div>
          <div
            className={cn("reveal-right lg:col-span-7", inView && "is-visible")}
            style={{ transitionDelay: inView ? "90ms" : undefined }}
          >
            <div className="overflow-hidden shadow-[var(--shadow-card)]">
              <img
                src={eventPhotoCommunity}
                alt="Founders connecting at a Hyderabad Founders Network meetup"
                width={1600}
                height={1100}
                loading="lazy"
                decoding="async"
                className="aspect-[16/11] w-full object-cover object-[50%_28%]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhoSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} id="who" className="section-space">
      <div className="page-container">
        <div
          className={cn(
            "reveal-up mx-auto max-w-2xl text-center",
            inView && "is-visible",
          )}
        >
          <SectionLabel>Who belongs here</SectionLabel>
          <h2 className="mt-3 font-display text-[clamp(1.7rem,2.8vw,2.25rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
            Built for everyone shaping Hyderabad&apos;s startup future.
          </h2>
          <p className="mx-auto mt-3 max-w-[36ch] text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
            Whether you&apos;re shipping your first product or still figuring
            out the idea—there&apos;s a seat for you.
          </p>
        </div>

        <ul
          className={cn(
            "stagger-in mt-10 grid list-none gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3",
            inView && "is-visible",
          )}
        >
          {audiences.map((a) => (
            <li
              key={a.title}
              className="border-t border-[var(--color-border)] py-5"
            >
              <h3 className="font-display text-[1.02rem] tracking-tight text-foreground">
                {a.title}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
                {a.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function GainsSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section
      ref={ref}
      id="gains"
      className="section-space bg-[var(--color-background-alt)]"
    >
      <div className="page-container">
        <div
          className={cn(
            "reveal-up mx-auto max-w-xl text-center",
            inView && "is-visible",
          )}
        >
          <SectionLabel>What you gain</SectionLabel>
          <h2 className="mt-3 font-display text-[clamp(1.7rem,2.8vw,2.25rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
            Relationships, clarity, and momentum.
          </h2>
        </div>

        <ul
          className={cn(
            "stagger-in mt-10 grid list-none gap-x-10 gap-y-0 sm:grid-cols-2 lg:grid-cols-3",
            inView && "is-visible",
          )}
        >
          {gains.map((g) => (
            <li
              key={g.title}
              className="border-t border-[var(--color-border)] py-6"
            >
              <h3 className="font-display text-[1.05rem] tracking-tight text-foreground">
                {g.title}
              </h3>
              <p className="mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
                {g.desc}
              </p>
            </li>
          ))}
        </ul>

        <div
          className={cn("reveal-up mt-8 text-center", inView && "is-visible")}
          style={{ transitionDelay: inView ? "280ms" : undefined }}
        >
          <a
            href="#next-meetup"
            className="text-[14px] font-medium text-[var(--brand-accent)] underline-offset-4 hover:underline"
          >
            Book the next meetup
          </a>
        </div>
      </div>
    </section>
  );
}

function MeetupSection({ nextMeetup }: { nextMeetup: Meetup }) {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} id="next-meetup" className="section-space">
      <div className="page-container">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div
            className={cn("reveal-left lg:col-span-5", inView && "is-visible")}
          >
            <SectionLabel>Monthly meetups</SectionLabel>
            <h2 className="mt-3 max-w-[14ch] font-display text-[clamp(1.7rem,2.8vw,2.25rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
              Every third Saturday.
            </h2>
            <p className="mt-4 max-w-md text-[14.5px] leading-[1.7] text-[var(--color-text-secondary)]">
              No sales pitches. No long keynotes. Just founder stories,
              roundtables, and room to connect.
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {meetupIncludes.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-[13.5px] text-[var(--color-text-secondary)]"
                >
                  <span
                    className="h-1 w-1 shrink-0 rounded-full bg-[var(--brand-accent)]"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={cn(
              "meetup-card lg:col-span-7",
              inView && "is-visible",
            )}
            style={{ transitionDelay: inView ? "100ms" : undefined }}
          >
            <div className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
              <div className="grid md:grid-cols-12 md:items-stretch">
                <div className="relative aspect-[16/10] md:col-span-5 md:aspect-auto md:min-h-[20rem]">
                  <img
                    src={eventPhotoMeetup}
                    alt="Founders at the Hyderabad Founders Network meetup"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
                  />
                </div>

                <div className="flex flex-col justify-between gap-7 p-6 sm:p-7 md:col-span-7 md:p-8">
                  <div>
                    <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
                      Upcoming meetup
                    </p>
                    <h3 className="mt-2.5 font-display text-[1.2rem] leading-[1.25] tracking-tight text-foreground md:text-[1.3rem]">
                      {nextMeetup.title}
                    </h3>

                    <ul className="mt-5 space-y-3 text-[14px] text-foreground">
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

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                    <RsvpButton event={nextMeetup} className="btn-primary gap-2">
                      <Ticket className="size-4" strokeWidth={1.75} aria-hidden />
                      Book your spot
                    </RsvpButton>
                    <Link
                      to="/events/$slug"
                      params={{ slug: nextMeetup.slug }}
                      className="group inline-flex min-h-11 items-center gap-1.5 text-[14px] font-medium text-[var(--color-text-secondary)] underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      Full details
                      <ArrowUpRight
                        className="size-3.5 transition-transform duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
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

function GallerySection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section
      ref={ref}
      id="gallery"
      className="section-space bg-[var(--color-background-alt)]"
    >
      <div className="page-container">
        <div
          className={cn(
            "reveal-up mx-auto max-w-xl text-center",
            inView && "is-visible",
          )}
        >
          <SectionLabel>In the room</SectionLabel>
          <h2 className="mt-3 font-display text-[clamp(1.7rem,2.8vw,2.25rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
            Real people. Real energy.
          </h2>
        </div>
        <div
          className={cn(
            "stagger-in-fast mt-9 grid grid-cols-1 gap-2.5 md:h-[22rem] md:grid-cols-12 md:grid-rows-2",
            inView && "is-visible",
          )}
        >
          <div className="gallery-tile relative min-h-[16rem] overflow-hidden md:col-span-7 md:row-span-2 md:min-h-0">
            <img
              src={gallery[0].src}
              alt={gallery[0].alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="gallery-tile relative min-h-[10.5rem] overflow-hidden md:col-span-5 md:min-h-0">
            <img
              src={gallery[1].src}
              alt={gallery[1].alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="gallery-tile relative min-h-[10.5rem] overflow-hidden md:col-span-5 md:min-h-0">
            <img
              src={gallery[2].src}
              alt={gallery[2].alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StoriesSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref} id="stories" className="section-space">
      <div className="page-container">
        <div
          className={cn(
            "reveal-up flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
            inView && "is-visible",
          )}
        >
          <div className="max-w-xl">
            <SectionLabel>In the room</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,2.8vw,2.25rem)] leading-[1.12] tracking-[-0.03em] text-foreground">
              What you can get from showing up
            </h2>
          </div>
          <Link
            to="/stories"
            className="text-[14px] font-medium text-[var(--brand-accent)] underline-offset-4 hover:underline"
          >
            See what people walk away with
          </Link>
        </div>
        <ul
          className={cn(
            "stagger-in-fast mt-7 grid list-none border-t border-[var(--color-border)] sm:grid-cols-2 sm:gap-x-10",
            inView && "is-visible",
          )}
        >
          {storyTeasers.map((title) => (
            <li key={title}>
              <Link
                to="/stories"
                className="group flex items-baseline justify-between gap-6 border-b border-[var(--color-border)] py-[18px]"
              >
                <span className="font-display text-[1.02rem] leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-[var(--brand-accent)] md:text-[1.08rem]">
                  {title}
                </span>
                <span
                  className="shrink-0 text-[var(--color-text-muted)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--brand-accent)]"
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

function FaqSection() {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      id="faq"
      className="section-space bg-[var(--color-background-alt)]"
    >
      <div className="page-container">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-12 lg:gap-12">
          <div
            className={cn("reveal-left lg:col-span-4", inView && "is-visible")}
          >
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,2.8vw,2.25rem)] tracking-tight text-foreground">
              Quick answers
            </h2>
            <p className="mt-3 max-w-[30ch] text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              Still unsure? These cover what founders ask most before their
              first meetup.
            </p>
          </div>
          <div
            className={cn(
              "stagger-in-fast lg:col-span-8",
              inView && "is-visible",
            )}
          >
            {faqs.map((item, i) => {
              const open = openIndex === i;
              return (
                <div
                  key={item.q}
                  className="border-t border-[var(--color-border)] last:border-b"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 py-[18px] text-left"
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    <span className="font-display text-[1.02rem] tracking-tight text-foreground">
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-[1.2rem] leading-none text-[var(--brand-accent)] transition-transform duration-200",
                        open && "rotate-45",
                      )}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-[18px] pr-8 text-[14px] leading-[1.7] text-[var(--color-text-secondary)]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection({ nextMeetup }: { nextMeetup: Meetup }) {
  const { ref, inView } = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <section ref={ref}>
      <div
        className={cn(
          "trizen-mesh reveal-up px-5 py-10 text-center md:py-12",
          inView && "is-visible",
        )}
      >
          <h2 className="mx-auto max-w-[14ch] font-display text-[clamp(2.15rem,4vw,3.1rem)] leading-[1.08] tracking-[-0.03em] text-foreground">
            Your people are already here.
          </h2>
        <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-[1.65] text-[var(--color-text-secondary)]">
          Whether you&apos;re launching or still figuring it out—you&apos;re
          welcome in this circle.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row sm:gap-3">
          <RsvpButton event={nextMeetup} className="btn-primary gap-2">
            <Ticket className="size-4" strokeWidth={1.75} aria-hidden />
            Book your spot
          </RsvpButton>
          <a
            href={links.community}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary gap-2"
          >
            <WhatsAppIcon className="size-4" />
            Join the Community
          </a>
        </div>
      </div>
    </section>
  );
}

function StickyCtaBar({ nextMeetup }: { nextMeetup: Meetup }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero");
      const meetup = document.getElementById("next-meetup");
      if (!hero) return;

      const pastHero = window.scrollY > hero.offsetHeight * 0.7;
      const meetupRect = meetup?.getBoundingClientRect();
      const meetupInView =
        meetupRect != null &&
        meetupRect.top < window.innerHeight * 0.75 &&
        meetupRect.bottom > window.innerHeight * 0.2;

      setVisible(pastHero && !meetupInView);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-300 md:hidden",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex max-w-md items-center gap-3 border border-[var(--color-border)] bg-white/92 px-3.5 py-2.5 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-md",
          !visible && "pointer-events-none",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-[0.04em] text-[var(--color-text-muted)]">
            Next meetup
          </p>
          <p className="truncate text-[13px] font-medium text-foreground">
            {nextMeetup.dateLabel}
          </p>
        </div>
        <RsvpButton
          event={nextMeetup}
          className="btn-primary shrink-0 gap-1.5 !min-h-10 !rounded-none !px-4 !text-[13px] !shadow-none"
        >
          <Ticket className="size-3.5" strokeWidth={1.75} aria-hidden />
          Book spot
        </RsvpButton>
      </div>
    </div>
  );
}

function Home() {
  const { nextMeetup } = Route.useLoaderData();

  return (
    <div className="relative bg-[var(--color-background)] pb-24 md:pb-0">
      <HeroSection nextMeetup={nextMeetup} />
      <WhySection />
      <WhoSection />
      <GainsSection />
      <MeetupSection nextMeetup={nextMeetup} />
      <GallerySection />
      <TrizenProductsSection
        tone="quiet"
        spacious
        title="More from the Trizen ecosystem"
        description="Explore products and initiatives built for founders, teams, and growing businesses."
        showVisitCta={false}
      />
      <StoriesSection />
      <FaqSection />
      <FinalCtaSection nextMeetup={nextMeetup} />
      <StickyCtaBar nextMeetup={nextMeetup} />
    </div>
  );
}
