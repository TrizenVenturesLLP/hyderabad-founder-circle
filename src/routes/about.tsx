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
  "T-Hub",
  "WE Hub",
  "eChai",
  "91springboard",
  "AIC at IIIT-H",
  "iTIC",
];

const howItWorks = [
  "Community-led: members host, members shape the agenda.",
  <>
    Company-supported:{" "}
    <strong className="font-semibold text-foreground">{links.sponsor.name}</strong>{" "}
    provides venue and resources as a sponsor — not as the host.
  </>,
  "No pitching, no selling to the room, no gatekeepers.",
  "Free to attend. Open to anyone serious about building.",
];

function AboutPage() {
  return (
    <div>
      <header className="mx-auto max-w-[1160px] px-4 pt-12 pb-10 sm:px-6 md:px-8 md:pt-14 md:pb-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          About
        </p>
        <h1 className="mt-3 font-display text-[2.5rem] leading-[1.08] tracking-tight text-foreground sm:text-[3rem] md:text-[3.4rem]">
          We started this because Hyderabad deserves its own founder room.
        </h1>
        <div className="mt-6 space-y-5 text-[1.0625rem] leading-[1.65] text-muted-foreground md:text-[1.125rem]">
          <p>
            The Hyderabad Founders Network exists for one simple reason: trust and
            long-term relationships only show up when the same people meet, on
            purpose, again and again.
          </p>
          <p>
            We're not an accelerator. We're not a paid programme. We're a peer
            community — founders, operators and aspiring entrepreneurs — who decided
            to meet on the 3rd Saturday of every month and keep showing up.
          </p>
        </div>
      </header>

      <div
        className="mx-auto max-w-[1160px] border-b border-border/70 px-4 sm:px-6 md:px-8"
        aria-hidden
      />

      <section className="border-b border-border/60 bg-[color-mix(in_oklab,var(--secondary)_35%,var(--paper))]">
        <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-6 md:px-8 md:py-14">
          <div className="flex items-end gap-4">
            <h2 className="shrink-0 font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.85rem]">
              How it works
            </h2>
            <span className="mb-2 hidden h-px flex-1 bg-border/80 sm:block" aria-hidden />
          </div>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {howItWorks.map((item, i) => (
              <li
                key={i}
                className="flex gap-3.5 rounded-[16px] border border-border/70 bg-card px-5 py-5"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                <p className="text-[0.975rem] leading-[1.6] text-muted-foreground">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-4 py-12 sm:px-6 md:px-8 md:py-14">
        <div className="flex items-end gap-4">
          <h2 className="shrink-0 font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.85rem]">
            Ecosystem partners
          </h2>
          <span className="mb-2 hidden h-px flex-1 bg-border/80 sm:block" aria-hidden />
        </div>
        <p className="mt-3 max-w-xl text-[0.975rem] text-muted-foreground">
          Communities and spaces we collaborate with across Hyderabad.
        </p>
        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((p) => (
            <li
              key={p}
              className="flex min-h-[4.5rem] items-center justify-center rounded-[14px] border border-border/70 bg-[color-mix(in_oklab,white_55%,var(--paper))] px-3 py-4 text-center transition-colors duration-200 hover:border-primary/30"
            >
              <span className="font-display text-[1.05rem] tracking-tight text-foreground sm:text-[1.15rem]">
                {p}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1160px] px-4 pb-6 sm:px-6 md:px-8">
        <div className="rounded-[20px] border border-[color-mix(in_oklab,var(--terracotta)_20%,var(--border))] bg-[color-mix(in_oklab,var(--terracotta)_7%,var(--paper))] px-6 py-8 md:px-10 md:py-10">
          <h2 className="font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.75rem]">
            Sponsor
          </h2>
          <p className="mt-3 max-w-2xl text-[0.975rem] leading-[1.65] text-muted-foreground md:text-[1.05rem]">
            Venue, chai and operations are supported by{" "}
            <a
              href={links.sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {links.sponsor.name}
            </a>
            . They don't get a sales slot. They don't get the floor. They believe
            Hyderabad's founder ecosystem grows faster when founders meet each other
            freely.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1160px] flex-wrap gap-3 px-4 pb-16 pt-8 sm:px-6 md:px-8 md:pb-20">
        <Link
          to="/community"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-[opacity,transform] duration-200 hover:opacity-95 active:scale-[0.98]"
        >
          Join the Community
        </Link>
        <Link
          to="/contact"
          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-transparent px-6 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted"
        >
          Get in touch
        </Link>
      </div>
    </div>
  );
}
