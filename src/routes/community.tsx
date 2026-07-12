import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { links } from "@/lib/links";
import { cn } from "@/lib/utils";

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
  {
    name: "Sneha R.",
    role: "Founder",
    startup: "Devtools SaaS · Seed",
    openTo: ["Mentoring", "Hiring"],
  },
  {
    name: "Arjun K.",
    role: "Operator",
    startup: "Fintech · Series A",
    openTo: ["Collaboration", "Learning"],
  },
  {
    name: "Priya M.",
    role: "Aspiring",
    startup: "Exploring climate",
    openTo: ["Co-founders", "Learning"],
  },
  {
    name: "Vikram S.",
    role: "Founder",
    startup: "B2B AI · Pre-seed",
    openTo: ["Investors", "Beta users"],
  },
  {
    name: "Anita D.",
    role: "Operator",
    startup: "D2C · Growth",
    openTo: ["Mentoring"],
  },
  {
    name: "Rahul T.",
    role: "Founder",
    startup: "Health · Seed",
    openTo: ["Hiring", "Collaboration"],
  },
];

const filters = ["All", "Founders", "Operators", "Aspiring"] as const;
type Filter = (typeof filters)[number];

const avatarTints = [
  "bg-primary/15 text-primary",
  "bg-secondary text-foreground/80",
  "bg-[color-mix(in_oklab,var(--saffron)_18%,var(--paper))] text-foreground/75",
  "bg-primary/10 text-primary",
  "bg-secondary/80 text-foreground/80",
  "bg-[color-mix(in_oklab,var(--ink)_5%,var(--paper))] text-foreground/70",
];

function CommunityPage() {
  const [filter, setFilter] = useState<Filter>("All");

  const visibleMembers = useMemo(() => {
    if (filter === "All") return members;
    if (filter === "Founders") return members.filter((m) => m.role === "Founder");
    if (filter === "Operators") return members.filter((m) => m.role === "Operator");
    return members.filter((m) => m.role === "Aspiring");
  }, [filter]);

  return (
    <div>
      {/* HERO */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:px-8 md:py-20">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          Community
        </p>
        <h1 className="mt-3 max-w-none font-display text-[2.5rem] leading-[1.08] tracking-tight text-foreground sm:text-[3rem] md:text-[3.25rem] lg:text-[3.5rem]">
          Owned by members. Hosted by volunteers.
        </h1>
        <p className="mt-5 max-w-none text-[1.0625rem] leading-[1.65] text-muted-foreground md:text-[1.125rem] lg:text-[1.1875rem]">
          The Hyderabad Founders Network is a peer community — not a company event.
          Members host talks, share stories and shape what we do. Trizen Ventures
          supports us with venue and resources; the room belongs to its founders.
        </p>
      </section>

      {/* PRINCIPLES */}
      <section className="border-y border-border/70 bg-[color-mix(in_oklab,var(--secondary)_40%,var(--paper))]">
        <div className="mx-auto grid max-w-[1200px] gap-0 px-4 sm:px-6 md:grid-cols-2 md:px-8">
          <article className="border-b border-border/70 py-10 md:border-b-0 md:border-r md:py-12 md:pr-10 lg:pr-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              Community-led
            </p>
            <h2 className="mt-3 font-display text-[1.45rem] tracking-tight text-foreground md:text-[1.6rem]">
              By founders, for founders
            </h2>
            <p className="mt-3 max-w-md text-[0.975rem] leading-[1.65] text-muted-foreground">
              Members propose themes, host roundtables and bring the people they want to
              meet. No gatekeepers, no agendas hidden behind logos.
            </p>
          </article>

          <article className="py-10 md:py-12 md:pl-10 lg:pl-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              Company-supported
            </p>
            <h2 className="mt-3 font-display text-[1.45rem] tracking-tight text-foreground md:text-[1.6rem]">
              Sponsors keep the lights on
            </h2>
            <p className="mt-3 max-w-md text-[0.975rem] leading-[1.65] text-muted-foreground">
              Venue, chai and operations are supported by Trizen Ventures and partner
              spaces. They don't sell to the room — that's the rule.
            </p>
          </article>
        </div>
      </section>

      {/* MEMBERS */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:px-8 md:py-20">
        <div className="flex flex-col gap-5 border-b border-border/70 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-[1.85rem] tracking-tight text-foreground md:text-[2.2rem]">
              A few members
            </h2>
            <p className="mt-2 text-[0.975rem] text-muted-foreground">
              A small sample of the regulars.
            </p>
          </div>
          <a
            href={links.community}
            className="group inline-flex h-11 items-center justify-center gap-1.5 self-start rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-[opacity,transform] duration-200 hover:opacity-95 active:scale-[0.98] sm:self-auto"
          >
            Request to join
            <span
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </a>
        </div>

        <div
          className="-mx-4 mt-6 flex gap-1 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0"
          role="tablist"
          aria-label="Filter members"
        >
          {filters.map((item) => {
            const active = filter === item;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item)}
                className={cn(
                  "relative shrink-0 px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-200",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item}
                <span
                  className={cn(
                    "absolute inset-x-3.5 bottom-0 h-0.5 rounded-full bg-primary transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {visibleMembers.map((m) => {
            const tintIndex = members.findIndex((x) => x.name === m.name);
            return (
              <li key={m.name}>
                <article className="group flex h-full flex-col rounded-[18px] border border-border/75 bg-[color-mix(in_oklab,white_55%,var(--paper))] p-6 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_36px_-28px_rgba(40,28,18,0.4)] md:p-7">
                  <div className="flex items-start gap-3.5">
                    <span
                      className={cn(
                        "grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-lg ring-1 ring-border/60",
                        avatarTints[tintIndex % avatarTints.length],
                      )}
                    >
                      {m.name[0]}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="font-display text-[1.2rem] leading-tight tracking-tight text-foreground">
                        {m.name}
                      </p>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        {m.role}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-[0.9375rem] leading-snug text-foreground/85">
                    {m.startup}
                  </p>

                  <div className="mt-auto border-t border-border/60 pt-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/90">
                      Open to
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {m.openTo.map((t) => (
                        <span
                          key={t}
                          className="inline-flex h-7 items-center rounded-full border border-border/70 bg-background/80 px-3 text-[12px] text-foreground/70 transition-colors duration-200 group-hover:border-primary/20"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      {/* WHATSAPP CTA */}
      <section className="pb-16 md:pb-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8">
          <div className="flex flex-col gap-6 rounded-2xl border border-border/80 bg-secondary/50 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-9 md:px-10">
            <div className="max-w-xl">
              <h2 className="font-display text-[1.65rem] tracking-tight text-foreground md:text-[1.85rem]">
                Join the WhatsApp group
              </h2>
              <p className="mt-2 text-[0.975rem] leading-[1.65] text-muted-foreground">
                Between meetups, conversations continue in our community group. Intros,
                hires, beta-user calls, occasional rants. Quiet by design.
              </p>
            </div>
            <a
              href={links.community}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-[opacity,transform] duration-200 hover:opacity-95 active:scale-[0.98]"
            >
              Join the Community
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
