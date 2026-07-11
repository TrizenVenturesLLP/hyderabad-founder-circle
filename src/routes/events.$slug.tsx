import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import eventImg from "@/assets/event-room.jpg";
import { meetups } from "@/lib/events";
import { links } from "@/lib/links";
import { EventShareBar } from "@/components/EventShareBar";


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
      ? `${m.dateLabel} · ${m.time} · ${m.venue}, ${m.city}. Founders Open House — community-led meetup.`
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
                  address: `${m.venue}, ${m.city}, India`,
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
                  url: links.rsvp,
                },
              }),
            },
          ]
        : [],
    };
  },
  component: EventDetail,
});

const agenda = [
  "5:00 — Chai & open floor intros",
  "5:30 — Two founder stories (15 min each, real numbers)",
  "6:00 — Roundtables: pricing, hiring, first customers, fundraising",
  "7:00 — Small-group conversations",
  "7:45 — Wrap & next steps",
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
    a: "On-site parking at T-Hub. Metro: HITEC City station is a short auto ride away.",
  },
  {
    q: "What should I bring?",
    a: "Yourself, and one specific thing you're stuck on. That's how the best conversations start.",
  },
];

function EventDetail() {
  const { meetup } = Route.useLoaderData();
  return (
    <article>
      {/* Above-the-fold basics */}
      <header className="border-b border-border bg-card/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-12 md:gap-12 md:py-20">
          <div className="md:col-span-7">
            <p className="text-xs uppercase tracking-wider text-primary">
              Founders Open House · {meetup.format}
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight text-foreground md:text-5xl">
              {meetup.title}
            </h1>
            <dl className="mt-7 grid gap-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Date</dt>
                <dd className="mt-1 font-medium text-foreground">{meetup.dateLabel}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Time</dt>
                <dd className="mt-1 font-medium text-foreground">{meetup.time}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Venue</dt>
                <dd className="mt-1 font-medium text-foreground">{meetup.venue}</dd>
                <dd>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      meetup.venue + " " + meetup.city,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Open in Maps →
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={links.rsvp}
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Register / RSVP
              </a>
              <span className="text-xs text-muted-foreground">
                Free · Limited seats · No pitching
              </span>
            </div>
            <EventShareBar meetup={meetup} />
          </div>
          <div className="md:col-span-5">
            <img
              src={eventImg}
              alt="Founders gathered around a whiteboard at a previous Hyderabad meetup"
              loading="lazy"
              width={1400}
              height={900}
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 md:grid-cols-12 md:py-20">
        {/* Main column */}
        <div className="space-y-14 md:col-span-8">
          <section>
            <h2 className="font-display text-2xl text-foreground">Who this is for</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              {whoFor.map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {x}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">What you'll get</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              {youGet.map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {x}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Agenda</h2>
            <ol className="mt-4 space-y-2 text-foreground">
              {agenda.map((step) => (
                <li
                  key={step}
                  className="rounded-lg border border-border bg-card px-4 py-3 text-sm"
                >
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Hosted by the community</h2>
            <p className="mt-3 text-muted-foreground">
              Each meetup is hosted by 2–3 community members — founders and operators
              who've shipped, hired and raised in Hyderabad. Want to host or share a
              story? <Link to="/contact" className="text-primary underline-offset-4 hover:underline">Get in touch</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">From the last room</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                { q: "Walked in not knowing anyone. Left with two intros that turned into design partners.", a: "Sneha, founder, devtools SaaS" },
                { q: "The most useful 3 hours of my month. No pitching, just real talk.", a: "Arjun, operator, fintech" },
              ].map((t) => (
                <figure key={t.a} className="rounded-2xl border border-border bg-card p-6">
                  <blockquote className="font-display text-lg text-foreground">
                    "{t.q}"
                  </blockquote>
                  <figcaption className="mt-3 text-sm text-muted-foreground">— {t.a}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">FAQ</h2>
            <dl className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
              {faqs.map((f) => (
                <div key={f.q} className="p-5">
                  <dt className="font-medium text-foreground">{f.q}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* Sticky RSVP */}
        <aside className="md:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">RSVP</p>
            <p className="mt-2 font-display text-2xl text-foreground">{meetup.dateLabel}</p>
            <p className="text-muted-foreground">{meetup.time}</p>
            <p className="mt-1 text-muted-foreground">{meetup.venue}</p>
            <a
              href={links.rsvp}
              className="mt-5 block rounded-full bg-primary px-5 py-3 text-center text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Register / RSVP
            </a>
            <Link
              to="/events"
              className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              ← All meetups
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
