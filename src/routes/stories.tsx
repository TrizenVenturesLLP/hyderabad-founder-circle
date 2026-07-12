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
  { name: "T-Hub", desc: "India's largest incubator, Madhapur." },
  { name: "WE Hub", desc: "State-led incubator for women founders." },
  { name: "eChai", desc: "Pan-India founder community with strong Hyderabad chapter." },
  { name: "91springboard", desc: "Coworking spaces across the city." },
  { name: "AIC at IIIT-H", desc: "Deep-tech incubator." },
  { name: "iTIC", desc: "IIT-H's incubator for tech startups." },
];

const gallery = [heroImg, eventImg, tableImg] as const;

function StoriesPage() {
  return (
    <div>
      {/* HERO */}
      <header className="mx-auto max-w-[1160px] px-4 pt-12 pb-10 sm:px-6 md:px-8 md:pt-14 md:pb-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          Stories & resources
        </p>
        <h1 className="mt-3 max-w-[760px] font-display text-[2.5rem] leading-[1.08] tracking-tight text-foreground sm:text-[3rem] md:text-[3.4rem]">
          What actually happens in the room.
        </h1>
        <p className="mt-4 max-w-[760px] text-[1.0625rem] leading-[1.65] text-muted-foreground md:text-[1.125rem]">
          Short takeaways from members, photos from past meetups, and a small list
          of Hyderabad resources we keep recommending.
        </p>
      </header>

      <div
        className="mx-auto max-w-[1160px] border-b border-border/70 px-4 sm:px-6 md:px-8"
        aria-hidden
      />

      {/* STORIES */}
      <section className="mx-auto max-w-[1160px] px-4 py-12 sm:px-6 md:px-8 md:py-14">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {stories.map((s) => (
            <li key={s.title} className="h-full">
              <article className="group relative flex h-full flex-col overflow-hidden rounded-[15px] border border-border/80 bg-[color-mix(in_oklab,white_55%,var(--paper))] p-6 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_36px_-28px_rgba(40,28,18,0.4)] md:p-7">
                <span
                  className="pointer-events-none absolute left-5 top-3 select-none font-display text-[3.25rem] leading-none text-primary/15 md:left-6 md:top-4 md:text-[3.5rem]"
                  aria-hidden
                >
                  “
                </span>
                <h2 className="relative mt-6 font-display text-[1.25rem] leading-snug tracking-tight text-foreground md:text-[1.35rem]">
                  {s.title}
                </h2>
                <p className="relative mt-3.5 flex-1 text-[0.9375rem] leading-[1.65] text-muted-foreground">
                  {s.body}
                </p>
                <p className="relative mt-6 border-t border-border/60 pt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                  {s.by}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {/* GALLERY */}
      <section className="border-y border-border/60 bg-[color-mix(in_oklab,var(--secondary)_35%,var(--paper))]">
        <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-6 md:px-8 md:py-14">
          <div className="flex items-end gap-4">
            <h2 className="shrink-0 font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.85rem]">
              From past meetups
            </h2>
            <span className="mb-2 hidden h-px flex-1 bg-border/80 sm:block" aria-hidden />
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5">
            {gallery.map((src, i) => (
              <figure
                key={i}
                className="group relative overflow-hidden rounded-[16px] ring-1 ring-border/70"
              >
                <img
                  src={src}
                  alt={`Past meetup photo ${i + 1}`}
                  loading="lazy"
                  width={900}
                  height={560}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_oklab,var(--ink)_30%,transparent)] via-transparent to-transparent opacity-45 transition-opacity duration-300 group-hover:opacity-75"
                  aria-hidden
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* RESOURCES */}
      <section className="mx-auto max-w-[1160px] px-4 py-12 sm:px-6 md:px-8 md:py-16">
        <div className="flex items-end gap-4">
          <h2 className="shrink-0 font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.85rem]">
            Useful Hyderabad resources
          </h2>
          <span className="mb-2 hidden h-px flex-1 bg-border/80 sm:block" aria-hidden />
        </div>

        <ul className="mt-7 grid gap-3 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-3.5">
          {resources.map((r) => (
            <li key={r.name}>
              <div className="group flex h-full min-h-[4.75rem] items-center gap-4 rounded-[16px] border border-border/70 bg-card px-4 py-4 shadow-[0_1px_0_color-mix(in_oklab,var(--ink)_3%,transparent)] transition-[transform,border-color,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-[color-mix(in_oklab,white_70%,var(--paper))] hover:shadow-[0_14px_32px_-24px_rgba(40,28,18,0.35)] md:px-5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors duration-200 group-hover:bg-primary/15"
                  aria-hidden
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.975rem] font-semibold tracking-tight text-foreground">
                    {r.name}
                  </p>
                  <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                    {r.desc}
                  </p>
                </div>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
