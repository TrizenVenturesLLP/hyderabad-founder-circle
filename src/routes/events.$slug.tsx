import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import eventImg from "@/assets/event-room.jpg";
import {
  meetups,
  isRsvpOpen,
  meetupLocationLabel,
  meetupMapsUrl,
  meetupSeatsLabel,
} from "@/lib/events";
import { EventShareBar } from "@/components/EventShareBar";
import { RsvpButton } from "@/components/rsvp/RsvpButton";

export const Route = createFileRoute("/events/$slug")({
  loader: ({ params }) => {
    const m = meetups.find((x) => x.slug === params.slug);
    if (!m) throw notFound();
    return { meetup: m };
  },
  head: ({ params, loaderData }) => {
    const m = loaderData?.meetup;
    const title = m
      ? `${m.title} — Hyderabad Founders Network`
      : "Meetup — Hyderabad Founders Network";
    const desc = m
      ? `${m.dateLabel} · ${m.time} · ${meetupLocationLabel(m)}, ${m.city}. Founders Open House — community-led meetup.`
      : "Community-led meetup in Hyderabad.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "event" },
        { property: "og:url", content: `/events/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/events/${params.slug}` }],
      scripts: m
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Event",
                name: m.title,
                startDate: m.dateISO,
                eventAttendanceMode:
                  "https://schema.org/OfflineEventAttendanceMode",
                eventStatus: "https://schema.org/EventScheduled",
                location: {
                  "@type": "Place",
                  name: m.venue,
                  address: m.address ?? `${m.venue}, ${m.city}, India`,
                },
                organizer: {
                  "@type": "Organization",
                  name: "Hyderabad Founders Network",
                },
                isAccessibleForFree: true,
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "INR",
                  availability: "https://schema.org/InStock",
                  url: `https://hyderabadfounders.in/events/${m.slug}`,
                },
              }),
            },
          ]
        : [],
    };
  },
  component: EventDetail,
});

const agendaEvening = [
  "5:00 — Chai & open floor intros",
  "5:30 — Two founder stories (15 min each, real numbers)",
  "6:00 — Roundtables: pricing, hiring, first customers, fundraising",
  "7:00 — Small-group conversations",
  "7:45 — Wrap & next steps",
];

const agendaMorning = [
  "11:00 — Chai & open floor intros",
  "11:20 — Two founder stories (15 min each, real numbers)",
  "11:50 — Roundtables: pricing, hiring, first customers, fundraising",
  "12:30 — Small-group conversations",
  "12:50 — Wrap & next steps",
];

const youGet = [
  "Repeat conversations with the same room each month — trust compounds.",
  "Intros to mentors, angels and operators across Hyderabad's 1,200+ startups.",
  "Real stories: pivots that worked, hires that didn't, pricing that finally clicked.",
  "Collaboration leads — design partners, beta users, co-founders.",
];

const whoFor = [
  "Founders building something — pre-seed to Series A.",
  "Operators (product, eng, growth, ops) who want a founder room.",
  "Aspiring founders seriously exploring an idea.",
  "Angels and ecosystem folks who back early.",
];

const faqs = [
  { q: "Is it free?", a: "Yes. Free to attend. We're community-owned." },
  {
    q: "Who can attend?",
    a: "Founders, operators, aspiring entrepreneurs, and ecosystem allies. No vendors or recruiters pitching the room.",
  },
  {
    q: "Dress code?",
    a: "Whatever you'd wear to a friend's house. Most folks are in t-shirts and kurtas.",
  },
  {
    q: "Parking?",
    a: "On-site parking at DraperU India, Gachibowli. Check Maps for the latest directions.",
  },
  {
    q: "What should I bring?",
    a: "Yourself, and one specific thing you're stuck on. That's how the best conversations start.",
  },
];

const quotes = [
  {
    q: "Walked in not knowing anyone. Left with two intros that turned into design partners.",
    a: "Sneha, founder, devtools SaaS",
  },
  {
    q: "The most useful 3 hours of my month. No pitching, just real talk.",
    a: "Arjun, operator, fintech",
  },
];

function EventDetail() {
  const { meetup } = Route.useLoaderData();
  const agenda = /AM/i.test(meetup.time) ? agendaMorning : agendaEvening;
  const mapsUrl = meetupMapsUrl(meetup);

  return (
    <article>
      {/* HERO — main copy + In the room panel */}
      <header className="border-b border-border/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-8 pb-10 sm:px-6 md:grid-cols-12 md:items-end md:gap-12 md:px-8 md:pt-10 md:pb-12">
          <div className="md:col-span-7">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground"
            >
              <Link
                to="/events"
                className="transition-colors duration-200 hover:text-foreground"
              >
                Events
              </Link>
              <span aria-hidden className="text-border">
                /
              </span>
              <span className="truncate text-foreground/80">{meetup.title}</span>
            </nav>

            <h1 className="mt-5 max-w-[18ch] font-display text-[2.25rem] leading-[1.08] tracking-tight text-foreground sm:text-[2.65rem] md:mt-6 md:text-[3rem]">
              {meetup.title}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]">
              {meetup.blurb}
            </p>

            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground/85">
              <span>{meetup.dateLabel}</span>
              <span aria-hidden className="text-muted-foreground/40">
                ·
              </span>
              <span>{meetup.time}</span>
              <span aria-hidden className="text-muted-foreground/40">
                ·
              </span>
              <span>{meetupLocationLabel(meetup)}</span>
              <span aria-hidden className="text-muted-foreground/40">
                ·
              </span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 transition-colors duration-200 hover:underline"
              >
                Maps
              </a>
            </p>

            <EventShareBar meetup={meetup} />
          </div>

          <div className="md:col-span-5">
            <div className="border-t border-border/70 pt-5 md:border-t-0 md:border-l md:border-border/70 md:pl-8 md:pt-1 lg:pl-10">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
                In the room
              </p>
              <ul className="mt-4 space-y-0">
                {[
                  { label: "Format", value: meetup.format },
                  { label: "Entry", value: "Free to attend" },
                  { label: "Seats", value: meetupSeatsLabel(meetup) },
                  { label: "Vibe", value: "No pitching · Real talk" },
                ].map((item) => (
                  <li
                    key={item.label}
                    className="flex items-baseline justify-between gap-4 border-b border-border/60 py-3 last:border-b-0"
                  >
                    <span className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="text-right text-sm font-medium text-foreground">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* BODY — Who this is for onward + sticky RSVP */}
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-12 md:gap-10 md:px-8 md:py-14 lg:gap-12">
        <div className="min-w-0 space-y-12 md:col-span-7 md:space-y-14 lg:col-span-8">
          <section>
            <h2 className="font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.75rem]">
              Who this is for
            </h2>
            <ul className="mt-5 divide-y divide-border/70 border-t border-border/70">
              {whoFor.map((x, i) => (
                <li key={x} className="flex gap-3.5 py-3.5">
                  <span
                    className="mt-0.5 font-display text-[1.05rem] tabular-nums tracking-tight text-primary/55"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.975rem] leading-[1.65] text-muted-foreground">
                    {x}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.75rem]">
              What you'll get
            </h2>
            <ul className="mt-5 divide-y divide-border/70 border-t border-border/70">
              {youGet.map((x, i) => (
                <li key={x} className="flex gap-3.5 py-3.5">
                  <span
                    className="mt-0.5 font-display text-[1.05rem] tabular-nums tracking-tight text-primary/55"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.975rem] leading-[1.65] text-muted-foreground">
                    {x}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.75rem]">
              Agenda
            </h2>
            <ol className="mt-5 divide-y divide-border/70 border-t border-border/70">
              {agenda.map((step, i) => (
                <li
                  key={step}
                  className="flex gap-3.5 py-3.5 text-[0.975rem] leading-[1.65] text-foreground"
                >
                  <span
                    className="mt-0.5 font-display text-[1.05rem] tabular-nums tracking-tight text-primary/55"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.75rem]">
              Hosted by the community
            </h2>
            <p className="mt-3 max-w-2xl text-[0.975rem] leading-[1.65] text-muted-foreground">
              Each meetup is hosted by 2–3 community members — founders and
              operators who've shipped, hired and raised in Hyderabad. Want to
              host or share a story?{" "}
              <Link
                to="/contact"
                className="font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
              >
                Get in touch
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.75rem]">
              From the last room
            </h2>
            <div className="mt-6 grid gap-8 sm:grid-cols-2 sm:gap-10">
              {quotes.map((t) => (
                <figure key={t.a}>
                  <span
                    className="font-display text-[2rem] leading-none text-primary/35"
                    aria-hidden
                  >
                    “
                  </span>
                  <blockquote className="mt-2 font-display text-[1.15rem] leading-snug tracking-tight text-foreground">
                    {t.q}
                  </blockquote>
                  <figcaption className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                    {t.a}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.75rem]">
              FAQ
            </h2>
            <dl className="mt-5 divide-y divide-border/70 border-t border-border/70">
              {faqs.map((f) => (
                <div key={f.q} className="py-4">
                  <dt className="text-[0.975rem] font-semibold tracking-tight text-foreground">
                    {f.q}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-[1.65] text-muted-foreground">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="md:col-span-5 lg:col-span-4">
          <div className="sticky top-24 overflow-hidden border border-border/70 bg-[color-mix(in_oklab,white_55%,var(--paper))]">
            <img
              src={eventImg}
              alt="Founders gathered around a whiteboard at a previous Hyderabad meetup"
              width={1400}
              height={900}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="px-5 py-5 md:px-6 md:py-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
                Next meetup
              </p>

              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Date
                  </dt>
                  <dd className="mt-0.5 text-[0.975rem] font-medium leading-snug text-foreground">
                    {meetup.dateLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Time
                  </dt>
                  <dd className="mt-0.5 text-[0.975rem] font-medium leading-snug text-foreground">
                    {meetup.time}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Venue
                  </dt>
                  <dd className="mt-0.5 text-[0.975rem] font-medium leading-snug text-foreground">
                    {meetupLocationLabel(meetup)}
                  </dd>
                  {meetup.address ? (
                    <dd className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      {meetup.address}
                    </dd>
                  ) : null}
                </div>
              </dl>

              <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
                {isRsvpOpen(meetup)
                  ? `Free · ${meetupSeatsLabel(meetup)} seats · No pitching`
                  : "Registration opens closer to the event date."}
              </p>

              <RsvpButton
                event={meetup}
                className="mt-5 block w-full rounded-full bg-primary px-5 py-3 text-center text-sm font-medium text-primary-foreground transition-opacity duration-200 hover:opacity-90"
              >
                Register / RSVP
              </RsvpButton>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
