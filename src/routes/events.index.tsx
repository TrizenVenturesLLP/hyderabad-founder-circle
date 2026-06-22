import { createFileRoute, Link } from "@tanstack/react-router";
import { meetups } from "@/lib/events";
import { links } from "@/lib/links";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "Founders Open House — every 3rd Saturday in Hyderabad. Plus occasional demo days, pitch nights and themed sessions.",
      },
      { property: "og:title", content: "Events — Hyderabad Founders Network" },
      {
        property: "og:description",
        content: "Next 3 monthly meetups for the Hyderabad founder community.",
      },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsIndex,
});

function EventsIndex() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-primary">Events</p>
        <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
          The 3rd Saturday, every month.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Our flagship is the <em>Founders Open House</em> — a roundtable for founders
          and operators in Hyderabad. Same room, same energy, new conversations.
          Occasionally we host demo days and themed sessions.
        </p>
      </header>

      <section className="mt-14">
        <h2 className="font-display text-xl text-foreground">Next 3 meetups</h2>
        <ul className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
          {meetups.map((m) => (
            <li key={m.slug} className="grid gap-4 p-6 md:grid-cols-12 md:items-center md:p-7">
              <div className="md:col-span-3">
                <p className="font-display text-2xl text-foreground">
                  {new Date(m.dateISO).getDate()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(m.dateISO).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="md:col-span-6">
                <p className="font-medium text-foreground">{m.title}</p>
                <p className="text-sm text-muted-foreground">
                  {m.time} · {m.venue}, {m.city}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{m.blurb}</p>
              </div>
              <div className="flex gap-2 md:col-span-3 md:justify-end">
                <Link
                  to="/events/$slug"
                  params={{ slug: m.slug }}
                  className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                >
                  Details
                </Link>
                <a
                  href={links.rsvp}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  RSVP
                </a>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          New here? Start with the <Link to="/events/$slug" params={{ slug: meetups[0].slug }} className="text-foreground underline-offset-4 hover:underline">next Founders Open House</Link>.
        </p>
      </section>
    </div>
  );
}
