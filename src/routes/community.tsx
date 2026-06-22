import { createFileRoute } from "@tanstack/react-router";
import { links } from "@/lib/links";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "A peer community of founders, operators and aspiring entrepreneurs in Hyderabad. Community-led, sponsor-supported.",
      },
      { property: "og:title", content: "Community — Hyderabad Founders Network" },
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

type Member = {
  name: string;
  role: string;
  startup: string;
  openTo: string[];
};

const members: Member[] = [
  { name: "Sneha R.", role: "Founder", startup: "Devtools SaaS · Seed", openTo: ["Mentoring", "Hiring"] },
  { name: "Arjun K.", role: "Operator", startup: "Fintech · Series A", openTo: ["Collaboration", "Learning"] },
  { name: "Priya M.", role: "Aspiring", startup: "Exploring climate", openTo: ["Co-founders", "Learning"] },
  { name: "Vikram S.", role: "Founder", startup: "B2B AI · Pre-seed", openTo: ["Investors", "Beta users"] },
  { name: "Anita D.", role: "Operator", startup: "D2C · Growth", openTo: ["Mentoring"] },
  { name: "Rahul T.", role: "Founder", startup: "Health · Seed", openTo: ["Hiring", "Collaboration"] },
];

function CommunityPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-primary">Community</p>
        <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
          Owned by members. Hosted by volunteers.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          The Hyderabad Founders Network is a peer community — not a company event.
          Members host talks, share stories and shape what we do. Trizen Ventures
          supports us with venue and resources; the room belongs to its founders.
        </p>
      </header>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-7">
          <p className="text-xs uppercase tracking-wider text-primary">Community-led</p>
          <h2 className="mt-2 font-display text-2xl text-foreground">By founders, for founders</h2>
          <p className="mt-3 text-muted-foreground">
            Members propose themes, host roundtables and bring the people they want to meet.
            No gatekeepers, no agendas hidden behind logos.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7">
          <p className="text-xs uppercase tracking-wider text-primary">Company-supported</p>
          <h2 className="mt-2 font-display text-2xl text-foreground">Sponsors keep the lights on</h2>
          <p className="mt-3 text-muted-foreground">
            Venue, chai and operations are supported by Trizen Ventures and partner spaces.
            They don't sell to the room — that's the rule.
          </p>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-foreground">A few members</h2>
            <p className="mt-2 text-muted-foreground">A small sample of the regulars.</p>
          </div>
          <a
            href={links.community}
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Request to join →
          </a>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <li key={m.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 font-display text-primary">
                  {m.name[0]}
                </span>
                <div>
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-foreground">{m.startup}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Open to</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {m.openTo.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 rounded-3xl border border-border bg-secondary/40 p-8 md:p-12">
        <div className="grid gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-8">
            <h2 className="font-display text-3xl text-foreground">Join the WhatsApp group</h2>
            <p className="mt-3 text-muted-foreground">
              Between meetups, conversations continue in our community group. Intros,
              hires, beta-user calls, occasional rants. Quiet by design.
            </p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <a
              href={links.community}
              className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Join the Community
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
