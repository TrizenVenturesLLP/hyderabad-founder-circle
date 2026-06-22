import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-rooftop.jpg";
import tableImg from "@/assets/table-detail.jpg";
import { nextMeetup } from "@/lib/events";
import { links } from "@/lib/links";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hyderabad Founders Network — Monthly Startup Meetup" },
      {
        name: "description",
        content:
          "Trust-based founder community in Hyderabad. We meet on the 3rd Saturday of every month — for real conversations, mentors, and collaborations beyond the pitch deck.",
      },
      { property: "og:title", content: "Hyderabad Founders Network" },
      {
        property: "og:description",
        content:
          "Monthly, community-led meetups for founders, operators and aspiring entrepreneurs in Hyderabad.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const audiences = [
  "Early-stage founders",
  "Operators & product folks",
  "Aspiring entrepreneurs",
  "Angels & ecosystem allies",
];

const outcomes = [
  {
    k: "Trust networks",
    v: "Repeat conversations with the same people each month — the kind that turn into co-founders, hires and intros.",
  },
  {
    k: "Mentors & investors",
    v: "Meet operators who've shipped it before, and the angels who back Hyderabad early.",
  },
  {
    k: "Peer learning",
    v: "Real stories from the room — pricing pivots, first 10 customers, the hard hires — not pitch theatre.",
  },
  {
    k: "Collaboration",
    v: "Find design partners, beta users, and the person who knows the person you need.",
  },
];

const partners = ["T-Hub", "WE Hub", "eChai", "91springboard", "AIC", "iTIC"];

function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-14 pb-16 md:grid-cols-12 md:gap-12 md:pt-20 md:pb-24">
          <div className="md:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs tracking-wide text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Every 3rd Saturday · Hyderabad
            </p>
            <h1 className="mt-5 font-display text-[2.5rem] leading-[1.05] tracking-tight text-foreground md:text-6xl">
              A founder community that{" "}
              <span className="italic text-primary">actually shows up.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Monthly, community-led meetups for founders, operators and aspiring
              entrepreneurs in Hyderabad. We create space for real conversations,
              trust and long-term collaboration — beyond the pitch deck.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/community"
                className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Join the Community
              </Link>
              <Link
                to="/events"
                className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                See next meetup →
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Free to attend. Community-owned. No hard-selling.
            </p>
          </div>
          <div className="relative md:col-span-5">
            <img
              src={heroImg}
              alt="Founders around a rooftop table in Hyderabad at golden hour"
              width={1600}
              height={1100}
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]"
            />
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm md:block">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Next up</p>
              <p className="font-medium text-foreground">{nextMeetup.dateLabel}</p>
              <p className="text-muted-foreground">{nextMeetup.venue}</p>
            </div>
          </div>
        </div>
      </section>

      {/* RHYTHM STRIP */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-3 gap-x-8 px-5 py-5 text-sm">
          <p className="font-display text-base text-foreground">
            Same time, same room, same energy.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-muted-foreground">
            <span>3rd Saturday</span>
            <span aria-hidden>·</span>
            <span>5–8 PM</span>
            <span aria-hidden>·</span>
            <span>T-Hub, Madhapur</span>
            <span aria-hidden>·</span>
            <span>~80 founders / room</span>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-wider text-primary">Who shows up</p>
            <h2 className="mt-2 font-display text-3xl text-foreground md:text-4xl">
              Built for the people doing the work.
            </h2>
            <p className="mt-4 text-muted-foreground">
              No badges, no tiers. If you're building, supporting builders, or
              seriously thinking about it — you belong in the room.
            </p>
          </div>
          <ul className="grid gap-3 md:col-span-7 md:grid-cols-2">
            {audiences.map((a) => (
              <li
                key={a}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 text-foreground"
              >
                <span className="h-2 w-2 rounded-full bg-primary" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* OUTCOMES */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary">What you get</p>
              <h2 className="mt-2 font-display text-3xl text-foreground md:text-4xl">
                Relationships, not just business cards.
              </h2>
            </div>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {outcomes.map((o, i) => (
              <div key={o.k} className="group rounded-2xl border border-border bg-card p-6 md:p-8">
                <p className="font-display text-sm text-muted-foreground">
                  0{i + 1}
                </p>
                <h3 className="mt-2 font-display text-2xl text-foreground">{o.k}</h3>
                <p className="mt-3 text-muted-foreground">{o.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEXT MEETUP CARD */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-8 overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-12">
          <div className="md:col-span-5">
            <img
              src={tableImg}
              alt="Hands gesturing across a table with chai and notebooks"
              loading="lazy"
              width={1400}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-8 md:col-span-7 md:p-10">
            <p className="text-xs uppercase tracking-wider text-primary">Next meetup</p>
            <h2 className="mt-2 font-display text-3xl text-foreground md:text-4xl">
              {nextMeetup.title}
            </h2>
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">When</dt>
                <dd className="text-foreground">{nextMeetup.dateLabel}</dd>
                <dd className="text-foreground">{nextMeetup.time}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Where</dt>
                <dd className="text-foreground">{nextMeetup.venue}</dd>
                <dd className="text-foreground">{nextMeetup.city} · {nextMeetup.format}</dd>
              </div>
            </dl>
            <p className="mt-6 text-muted-foreground">{nextMeetup.blurb}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={links.rsvp}
                className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                RSVP for this meetup
              </a>
              <Link
                to="/events/$slug"
                params={{ slug: nextMeetup.slug }}
                className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                See full details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS STRIP */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-center text-xs uppercase tracking-wider text-muted-foreground">
            Part of Hyderabad's broader startup ecosystem
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {partners.map((p) => (
              <span
                key={p}
                className="font-display text-lg text-muted-foreground/80"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
