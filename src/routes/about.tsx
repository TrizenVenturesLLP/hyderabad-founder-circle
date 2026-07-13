import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
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
  {
    name: "T-Hub",
    desc: "India's largest incubator, Madhapur.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=T-Hub+Madhapur+Hyderabad",
  },
  {
    name: "WE Hub",
    desc: "State-led incubator for women founders.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=WE+Hub+Hyderabad",
  },
  {
    name: "eChai",
    desc: "Pan-India founder community with strong Hyderabad chapter.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=eChai+Hyderabad",
  },
  {
    name: "91springboard",
    desc: "Coworking spaces across the city.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=91springboard+Hyderabad",
  },
  {
    name: "AIC at IIIT-H",
    desc: "Deep-tech incubator.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=AIC+IIIT+Hyderabad",
  },
  {
    name: "iTIC",
    desc: "IIT-H's incubator for tech startups.",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=iTIC+IIT+Hyderabad",
  },
];

const howItWorks = [
  {
    title: "Community-led",
    body: "Members host, members shape the agenda.",
  },
  {
    title: "Company-supported",
    body: (
      <>
        <strong className="font-semibold text-foreground">{links.sponsor.name}</strong>{" "}
        provides venue and resources as a sponsor — not as the host.
      </>
    ),
  },
  {
    title: "No selling",
    body: "No pitching, no selling to the room, no gatekeepers.",
  },
  {
    title: "Open room",
    body: "Free to attend. Open to anyone serious about building.",
  },
];

function AboutPage() {
  return (
    <div>
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,color-mix(in_oklab,var(--saffron)_12%,transparent),transparent_50%),radial-gradient(ellipse_at_100%_10%,color-mix(in_oklab,var(--terracotta)_7%,transparent),transparent_45%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1160px] px-5 pt-12 pb-10 sm:px-6 md:px-8 md:pt-14 md:pb-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            About
          </p>
          <h1 className="mt-3 max-w-[34ch] font-display text-[2.35rem] leading-[1.08] tracking-tight text-foreground sm:text-[2.85rem] md:mt-4 md:text-[3.15rem]">
            We started this because Hyderabad deserves its own founder room.
          </h1>
          <div className="mt-5 max-w-[38rem] space-y-3.5 text-[1.0625rem] leading-[1.65] text-muted-foreground md:mt-6 md:text-[1.125rem]">
            <p>
              The Hyderabad Founders Network exists for one simple reason: trust
              and long-term relationships only show up when the same people meet,
              on purpose, again and again.
            </p>
            <p>
              We're not an accelerator. We're not a paid programme. We're a peer
              community — founders, operators and aspiring entrepreneurs — who
              decided to meet on the 3rd Saturday of every month and keep showing
              up.
            </p>
          </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section className="border-y border-border/60 bg-[color-mix(in_oklab,var(--secondary)_28%,var(--paper))]">
        <div className="mx-auto max-w-[1160px] px-5 py-12 sm:px-6 md:px-8 md:py-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
            How it works
          </p>
          <ul className="mt-8 divide-y divide-border/70">
            {howItWorks.map((item, i) => (
              <li
                key={item.title}
                className="grid gap-2 py-6 sm:grid-cols-[4.5rem_minmax(0,12rem)_minmax(0,1fr)] sm:items-baseline sm:gap-8 sm:py-7"
              >
                <span
                  className="font-display text-[1.25rem] tabular-nums tracking-tight text-primary/55 md:text-[1.35rem]"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-[1.2rem] tracking-tight text-foreground md:text-[1.3rem]">
                  {item.title}
                </h2>
                <p className="text-[0.975rem] leading-[1.65] text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="mx-auto max-w-[1160px] px-5 py-12 sm:px-6 md:px-8 md:py-14">
        <h2 className="font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.75rem]">
          Ecosystem partners
        </h2>
        <p className="mt-2 max-w-xl text-[0.975rem] leading-relaxed text-muted-foreground">
          Communities and spaces we collaborate with across Hyderabad.
        </p>

        <ul className="mt-8 grid gap-x-8 sm:grid-cols-2 sm:gap-x-10">
          {partners.map((p) => (
            <li key={p.name} className="border-b border-border/65">
              <a
                href={p.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group -mx-3 flex items-start justify-between gap-4 px-3 py-4 transition-[background-color,color] duration-200 hover:bg-primary hover:text-primary-foreground sm:-mx-4 sm:px-4 sm:py-5"
              >
                <div className="min-w-0">
                  <p className="text-[1rem] font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary-foreground">
                    {p.name}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground transition-colors duration-200 group-hover:text-primary-foreground/85">
                    {p.desc}
                  </p>
                </div>
                <ArrowUpRight
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/45 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-foreground"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="sr-only">Open {p.name} location in Google Maps</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* SPONSOR */}
      <section className="border-t border-border/60 bg-[color-mix(in_oklab,var(--terracotta)_6%,var(--paper))]">
        <div className="mx-auto grid max-w-[1160px] gap-10 px-5 py-12 sm:px-6 md:grid-cols-12 md:gap-12 md:px-8 md:py-14 lg:gap-16">
          <div className="md:col-span-6 lg:col-span-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              Sponsor
            </p>
            <h2 className="mt-3 font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.75rem]">
              <a
                href={links.sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:text-primary"
              >
                {links.sponsor.name}
              </a>
            </h2>
            <p className="mt-3 max-w-xl text-[0.975rem] leading-[1.65] text-muted-foreground md:text-[1.05rem]">
              Venue, chai and operations are supported by{" "}
              <a
                href={links.sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
              >
                {links.sponsor.name}
              </a>
              . They don't get a sales slot. They don't get the floor. They
              believe Hyderabad's founder ecosystem grows faster when founders
              meet each other freely.
            </p>
          </div>

          <div className="md:col-span-6 lg:col-span-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
              Sponsor contact
            </p>
            <dl className="mt-4 divide-y divide-border/65 border-t border-border/65">
              <div className="py-3.5">
                <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Operational address
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-foreground">
                  <a
                    href={links.address.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-primary"
                  >
                    {links.address.line}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Phone
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  <a
                    href={links.phoneHref}
                    className="transition-colors duration-200 hover:text-primary"
                  >
                    {links.phone}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Email
                </dt>
                <dd className="min-w-0 text-right text-sm font-medium text-foreground">
                  <a
                    href={`mailto:${links.email}`}
                    className="break-all transition-colors duration-200 hover:text-primary"
                  >
                    {links.email}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Website
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  <a
                    href={links.sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 transition-colors duration-200 hover:text-primary"
                  >
                    trizenventures.com
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <div className="mx-auto flex max-w-[1160px] flex-wrap gap-3 px-5 py-10 sm:px-6 md:px-8 md:py-12">
        <a
          href={links.community}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-[opacity,transform] duration-200 hover:opacity-95 active:scale-[0.98]"
        >
          Join the Community
        </a>
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
