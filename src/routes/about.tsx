import { createFileRoute, Link } from "@tanstack/react-router";
import { links } from "@/lib/links";

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

const partners = [
  "T-Hub", "WE Hub", "eChai", "91springboard", "AIC at IIIT-H", "iTIC",
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <p className="text-xs uppercase tracking-wider text-primary">About</p>
      <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
        We started this because Hyderabad deserves its own founder room.
      </h1>

      <div className="prose mt-8 max-w-none text-lg text-muted-foreground">
        <p>
          The Hyderabad Founders Network exists for one simple reason: trust and
          long-term relationships only show up when the same people meet, on
          purpose, again and again.
        </p>
        <p className="mt-5">
          We're not an accelerator. We're not a paid programme. We're a peer
          community — founders, operators and aspiring entrepreneurs — who decided
          to meet on the 3rd Saturday of every month and keep showing up.
        </p>
      </div>

      <section className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8">
        <h2 className="font-display text-xl text-foreground">How it works</h2>
        <ul className="mt-3 space-y-2 text-muted-foreground">
          <li>· Community-led: members host, members shape the agenda.</li>
          <li>· Company-supported: <strong className="text-foreground">{links.sponsor.name}</strong> provides venue and resources as a sponsor — not as the host.</li>
          <li>· No pitching, no selling to the room, no gatekeepers.</li>
          <li>· Free to attend. Open to anyone serious about building.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-foreground">Ecosystem partners</h2>
        <p className="mt-2 text-muted-foreground">
          Communities and spaces we collaborate with across Hyderabad.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {partners.map((p) => (
            <span key={p} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground">
              {p}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-foreground">Sponsor</h2>
        <p className="mt-2 text-muted-foreground">
          Venue, chai and operations are supported by{" "}
          <a href={links.sponsor.url} className="text-foreground underline-offset-4 hover:underline">
            {links.sponsor.name}
          </a>
          . They don't get a sales slot. They don't get the floor. They believe
          Hyderabad's founder ecosystem grows faster when founders meet each other
          freely.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          to="/community"
          className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Join the Community
        </Link>
        <Link
          to="/contact"
          className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          Get in touch
        </Link>
      </div>
    </div>
  );
}
