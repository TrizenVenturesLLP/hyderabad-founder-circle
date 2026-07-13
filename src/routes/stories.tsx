import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import heroImg from "@/assets/hero-rooftop.jpg";
import eventImg from "@/assets/event-room.jpg";
import tableImg from "@/assets/table-detail.jpg";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Stories — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "Short founder takeaways and photos from past meetups, plus useful Hyderabad startup resources.",
      },
      { property: "og:title", content: "Stories — Hyderabad Founders Network" },
      { property: "og:url", content: "/stories" },
    ],
    links: [{ rel: "canonical", href: "/stories" }],
  }),
  component: StoriesPage,
});

const stories = [
  {
    title: "How a 3rd-Saturday intro turned into our first enterprise customer",
    by: "Sneha · devtools SaaS",
    body:
      "I joined the meetup looking for design partners. Within two hours I had three intros. One of them — an operator at a Hyderabad fintech — became our first paid pilot a month later. We didn't pitch. We just talked about the problem.",
  },
  {
    title: "The hire I almost missed",
    by: "Vikram · B2B AI",
    body:
      "I'd been looking for a founding engineer for four months. The person who eventually joined was sitting two seats away at the August Open House. We weren't even talking about jobs.",
  },
  {
    title: "Pricing, finally",
    by: "Anita · D2C",
    body:
      "The roundtable on pricing changed how I thought about packaging. Three other founders showed me their actual price sheets. That kind of generosity doesn't exist on LinkedIn.",
  },
];

const resources = [
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

const gallery = [
  { src: heroImg, alt: "Founders gathered on a Hyderabad rooftop at golden hour" },
  { src: eventImg, alt: "Founders in conversation during an Open House session" },
  { src: tableImg, alt: "Notes, laptops and chai on a meetup table" },
] as const;

function StoriesPage() {
  return (
    <div>
      {/* HERO */}
      <header className="mx-auto max-w-[1160px] px-5 pt-12 pb-10 sm:px-6 md:px-8 md:pt-14 md:pb-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          Stories & resources
        </p>
        <h1 className="mt-3 max-w-[760px] font-display text-[2.5rem] leading-[1.08] tracking-tight text-foreground sm:text-[3rem] md:text-[3.4rem]">
          What actually happens in the room.
        </h1>
        <p className="mt-4 max-w-[640px] text-[1.0625rem] leading-[1.65] text-muted-foreground md:text-[1.125rem]">
          Short takeaways from members, photos from past meetups, and a small list
          of Hyderabad resources we keep recommending.
        </p>
      </header>

      {/* STORIES */}
      <section className="border-y border-border/60 bg-[color-mix(in_oklab,var(--secondary)_28%,var(--paper))]">
        <div className="mx-auto max-w-[1160px] px-5 py-12 sm:px-6 md:px-8 md:py-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
            Member takeaways
          </p>
          <ul className="mt-8 space-y-0 divide-y divide-border/70 md:mt-10">
            {stories.map((s, i) => (
              <li key={s.title}>
                <article className="grid gap-4 py-8 md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.15fr)] md:gap-10 md:py-10">
                  <span
                    className="font-display text-[1.35rem] tabular-nums tracking-tight text-primary/55 md:pt-1 md:text-[1.5rem]"
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-[1.35rem] leading-snug tracking-tight text-foreground md:text-[1.5rem]">
                      {s.title}
                    </h2>
                    <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                      {s.by}
                    </p>
                  </div>
                  <p className="text-[0.975rem] leading-[1.7] text-muted-foreground md:pt-1">
                    {s.body}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-[1160px] px-5 py-8 sm:px-6 md:px-8 md:py-10">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-[1.45rem] tracking-tight text-foreground md:text-[1.6rem]">
            From past meetups
          </h2>
          <p className="text-sm text-muted-foreground">
            Same room. Same energy. New faces each month.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-12 sm:gap-3">
          <figure className="group overflow-hidden rounded-xl sm:col-span-7 sm:row-span-2">
            <img
              src={gallery[0].src}
              alt={gallery[0].alt}
              loading="lazy"
              width={1600}
              height={1100}
              className="aspect-[16/10] h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] sm:aspect-auto sm:min-h-[14rem] md:min-h-[16rem]"
            />
          </figure>
          <figure className="group overflow-hidden rounded-xl sm:col-span-5">
            <img
              src={gallery[1].src}
              alt={gallery[1].alt}
              loading="lazy"
              width={1400}
              height={900}
              className="aspect-[16/9] h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          </figure>
          <figure className="group overflow-hidden rounded-xl sm:col-span-5">
            <img
              src={gallery[2].src}
              alt={gallery[2].alt}
              loading="lazy"
              width={1400}
              height={900}
              className="aspect-[16/9] h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          </figure>
        </div>
      </section>

      {/* RESOURCES */}
      <section className="border-t border-border/60 bg-[color-mix(in_oklab,var(--secondary)_22%,var(--paper))]">
        <div className="mx-auto max-w-[1160px] px-5 py-12 sm:px-6 md:px-8 md:py-16">
          <h2 className="font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.75rem]">
            Useful Hyderabad resources
          </h2>
          <p className="mt-2 max-w-xl text-[0.975rem] leading-relaxed text-muted-foreground">
            Places and communities we keep pointing founders to.
          </p>

          <ul className="mt-8 grid gap-x-8 sm:grid-cols-2 sm:gap-x-10">
            {resources.map((r) => (
              <li key={r.name} className="border-b border-border/65">
                <a
                  href={r.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group -mx-3 flex items-start justify-between gap-4 px-3 py-4 transition-[background-color,color] duration-200 hover:bg-primary hover:text-primary-foreground sm:-mx-4 sm:px-4 sm:py-5"
                >
                  <div className="min-w-0">
                    <p className="text-[1rem] font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary-foreground">
                      {r.name}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-muted-foreground transition-colors duration-200 group-hover:text-primary-foreground/85">
                      {r.desc}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/45 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-foreground"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="sr-only">Open {r.name} location in Google Maps</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
