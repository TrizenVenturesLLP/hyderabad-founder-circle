import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Lock, Mail, Users } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { links } from "@/lib/links";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "A peer community of founders, operators and aspiring entrepreneurs in Hyderabad. Community-led, sponsor-supported.",
      },
      {
        property: "og:title",
        content: "Community — Hyderabad Founders Network",
      },
      {
        property: "og:description",
        content: "Who's in the room and how to join.",
      },
      { property: "og:url", content: "/community" },
    ],
    links: [{ rel: "canonical", href: "/community" }],
  }),
  component: CommunityPage,
});

const scrollRevealOpts = {
  once: true,
  threshold: 0.28,
  rootMargin: "0px 0px -22% 0px",
} as const;

const principles = [
  {
    label: "Community-led",
    title: "By founders, for founders",
    body: "Members propose themes, host roundtables, and bring the people they want to meet. No gatekeepers — no agendas hidden behind logos.",
  },
  {
    label: "Company-supported",
    title: "Sponsors keep the lights on",
    body: (
      <>
        Venue, chai, and operations are supported by{" "}
        <strong className="font-semibold text-foreground">
          {links.sponsor.name}
        </strong>{" "}
        and partner spaces. They don&apos;t sell to the room — that&apos;s the
        rule.
      </>
    ),
  },
];

const whoItsFor = [
  {
    title: "Founders",
    body: "Early to growth stage — looking for peers, not a pitch audience.",
  },
  {
    title: "Operators",
    body: "Product, growth, and engineering leads who want to stay close to builders.",
  },
  {
    title: "Aspiring builders",
    body: "Serious about starting — ready to listen, contribute, and show up.",
  },
];

const howToJoin = [
  {
    step: "01",
    title: "Join WhatsApp",
    body: "Request access to the community group for updates and intros.",
  },
  {
    step: "02",
    title: "Come to a meetup",
    body: "3rd Saturday each month. Free to attend. No pitch required.",
  },
  {
    step: "03",
    title: "Keep showing up",
    body: "Trust compounds when the same people meet on purpose, again and again.",
  },
];

/** Placeholder silhouettes — blurred until member directory ships. */
const memberPlaceholders = [
  { initials: "SR", role: "Founder", line: "Devtools · Seed" },
  { initials: "AK", role: "Operator", line: "Fintech · Series A" },
  { initials: "PM", role: "Aspiring", line: "Exploring climate" },
  { initials: "VS", role: "Founder", line: "B2B AI · Pre-seed" },
  { initials: "AD", role: "Operator", line: "D2C · Growth" },
  { initials: "RT", role: "Founder", line: "Health · Seed" },
];

const cleanCard =
  "rounded-none border border-[var(--color-border)] bg-[var(--color-background)] shadow-[var(--shadow-card)]";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-medium tracking-[0.06em] text-[var(--brand-accent)]">
      {children}
    </p>
  );
}

function CommunityPage() {
  const hero = useInView<HTMLElement>({
    once: true,
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px",
  });
  const principlesReveal = useInView<HTMLElement>(scrollRevealOpts);
  const whoReveal = useInView<HTMLElement>(scrollRevealOpts);
  const membersReveal = useInView<HTMLElement>(scrollRevealOpts);
  const joinReveal = useInView<HTMLElement>(scrollRevealOpts);
  const cta = useInView<HTMLElement>(scrollRevealOpts);

  return (
    <div className="bg-[var(--color-background)]">
      <header
        ref={hero.ref}
        className="trizen-mesh border-b border-[var(--color-border)]"
      >
        <div
          className={cn(
            "page-container reveal-up pt-9 pb-8 md:pt-11 md:pb-10",
            hero.inView && "is-visible",
          )}
        >
          <SectionLabel>Community</SectionLabel>
          <h1 className="mt-2.5 max-w-[18ch] font-display text-[clamp(1.9rem,3.6vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground">
            Owned by members. Hosted by volunteers.
          </h1>
          <p className="mt-3.5 max-w-xl text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
            A peer community — not a company event. Members host talks, share
            stories, and shape what we do. Sponsors support the room; founders
            own it.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={links.community}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary gap-2"
            >
              <WhatsAppIcon className="size-4" />
              Join the Community
            </a>
            <Link to="/events" className="btn-secondary gap-2">
              See meetups
              <ArrowUpRight className="size-3.5" strokeWidth={1.75} aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      {/* PRINCIPLES */}
      <section
        ref={principlesReveal.ref}
        className="border-b border-[var(--color-border)]"
      >
        <div className="page-container grid gap-0 md:grid-cols-2">
          {principles.map((item, i) => (
            <article
              key={item.label}
              className={cn(
                "reveal-up border-b border-[var(--color-border)] py-9 last:border-b-0 md:border-b-0 md:py-11",
                i === 0 && "md:border-r md:pr-10 lg:pr-12",
                i === 1 && "md:pl-10 lg:pl-12",
                principlesReveal.inView && "is-visible",
              )}
              style={{
                transitionDelay: principlesReveal.inView
                  ? `${i * 70}ms`
                  : undefined,
              }}
            >
              <SectionLabel>{item.label}</SectionLabel>
              <h2 className="mt-2.5 font-display text-[clamp(1.25rem,2.2vw,1.5rem)] tracking-tight text-foreground">
                {item.title}
              </h2>
              <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-[var(--color-text-secondary)]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section
        ref={whoReveal.ref}
        className="border-b border-[var(--color-border)] bg-[var(--color-background-alt)]"
      >
        <div className="page-container py-9 md:py-11">
          <div
            className={cn("reveal-up max-w-xl", whoReveal.inView && "is-visible")}
          >
            <SectionLabel>Who&apos;s in the room</SectionLabel>
            <h2 className="mt-2.5 font-display text-[clamp(1.35rem,2.4vw,1.65rem)] tracking-tight text-foreground">
              Built for people who are building.
            </h2>
          </div>
          <ul
            className={cn(
              "stagger-in mt-7 grid list-none gap-3 sm:grid-cols-3 sm:gap-4",
              whoReveal.inView && "is-visible",
            )}
          >
            {whoItsFor.map((item) => (
              <li key={item.title} className={cn(cleanCard, "p-5 md:p-6")}>
                <h3 className="font-display text-[1.05rem] tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MEMBERS — upcoming / locked */}
      <section ref={membersReveal.ref}>
        <div className="page-container py-9 md:py-11">
          <div
            className={cn(
              "reveal-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
              membersReveal.inView && "is-visible",
            )}
          >
            <div className="max-w-xl">
              <SectionLabel>Member directory</SectionLabel>
              <h2 className="mt-2.5 font-display text-[clamp(1.35rem,2.4vw,1.65rem)] tracking-tight text-foreground">
                People in the network
              </h2>
              <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
                Member profiles are an upcoming feature. Join the community now —
                unlock the directory when it goes live.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 self-start border border-[var(--color-border)] bg-[var(--color-background-alt)] px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] text-[var(--color-text-secondary)] sm:self-auto">
              <Lock className="size-3" strokeWidth={1.75} aria-hidden />
              Upcoming
            </span>
          </div>

          <div
            className={cn(
              "reveal-up relative mt-7 overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-card)]",
              membersReveal.inView && "is-visible",
            )}
            style={{
              transitionDelay: membersReveal.inView ? "60ms" : undefined,
            }}
          >
            <ul
              className="pointer-events-none select-none divide-y divide-[var(--color-border)] blur-[6px] sm:blur-[7px]"
              aria-hidden
            >
              {memberPlaceholders.map((m) => (
                <li key={m.initials}>
                  <div className="flex items-center gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
                    <span className="grid size-11 shrink-0 place-items-center bg-[color-mix(in_oklab,var(--brand-accent)_12%,transparent)] font-display text-[0.95rem] text-[var(--brand-accent)]">
                      {m.initials}
                    </span>
                    <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center sm:gap-6">
                      <div>
                        <p className="font-display text-[1rem] tracking-tight text-foreground">
                          {m.initials[0]}···· {m.initials[1]}····
                        </p>
                        <p className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
                          {m.role}
                        </p>
                      </div>
                      <p className="mt-1.5 text-[13.5px] text-[var(--color-text-secondary)] sm:mt-0">
                        {m.line}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_oklab,var(--color-background)_52%,transparent)] px-5">
              <div
                className={cn(
                  cleanCard,
                  "max-w-[22rem] px-6 py-7 text-center sm:px-7 sm:py-8",
                )}
              >
                <span className="mx-auto grid size-10 place-items-center border border-[var(--color-border)] bg-[var(--color-background-alt)] text-[var(--brand-accent)]">
                  <Users className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="mt-4 font-display text-[1.1rem] tracking-tight text-foreground">
                  Unlock member profiles
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
                  This feature is coming soon. Join the WhatsApp community now
                  to meet people in the room — and get access when profiles go
                  live.
                </p>
                <a
                  href={links.community}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5 inline-flex gap-2"
                >
                  <Lock className="size-3.5" strokeWidth={1.75} aria-hidden />
                  Join to get access
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO JOIN */}
      <section
        ref={joinReveal.ref}
        className="border-t border-[var(--color-border)] bg-[var(--color-background-alt)]"
      >
        <div className="page-container py-9 md:py-11">
          <div
            className={cn(
              "reveal-up max-w-xl",
              joinReveal.inView && "is-visible",
            )}
          >
            <SectionLabel>How to join</SectionLabel>
            <h2 className="mt-2.5 font-display text-[clamp(1.35rem,2.4vw,1.65rem)] tracking-tight text-foreground">
              Three simple steps.
            </h2>
          </div>
          <ol
            className={cn(
              "stagger-in mt-7 grid list-none gap-3 sm:grid-cols-3 sm:gap-4",
              joinReveal.inView && "is-visible",
            )}
          >
            {howToJoin.map((item) => (
              <li key={item.step} className={cn(cleanCard, "p-5 md:p-6")}>
                <span
                  className="font-display text-[0.95rem] tabular-nums tracking-tight text-[var(--brand-accent)]"
                  aria-hidden
                >
                  {item.step}
                </span>
                <h3 className="mt-3 font-display text-[1.05rem] tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
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
          <SectionLabel>WhatsApp</SectionLabel>
          <h2 className="mx-auto mt-2.5 max-w-[18ch] font-display text-[clamp(1.4rem,2.6vw,1.8rem)] font-semibold tracking-tight text-foreground">
            Conversations continue between meetups.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
            Intros, hires, beta-user calls, occasional rants. Quiet by design.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
