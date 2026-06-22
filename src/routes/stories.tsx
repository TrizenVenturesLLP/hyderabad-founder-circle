import { createFileRoute } from "@tanstack/react-router";
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

function StoriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-primary">Stories & resources</p>
        <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
          What actually happens in the room.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Short takeaways from members, photos from past meetups, and a small list
          of Hyderabad resources we keep recommending.
        </p>
      </header>

      <section className="mt-14 grid gap-6 md:grid-cols-3">
        {stories.map((s) => (
          <article key={s.title} className="flex flex-col rounded-2xl border border-border bg-card p-7">
            <h2 className="font-display text-xl text-foreground">{s.title}</h2>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{s.body}</p>
            <p className="mt-5 text-xs uppercase tracking-wider text-primary">{s.by}</p>
          </article>
        ))}
      </section>

      <section className="mt-20">
        <h2 className="font-display text-2xl text-foreground">From past meetups</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[heroImg, eventImg, tableImg].map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Past meetup photo ${i + 1}`}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-2xl text-foreground">Useful Hyderabad resources</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {resources.map((r) => (
            <li key={r.name} className="rounded-xl border border-border bg-card p-5">
              <p className="font-medium text-foreground">{r.name}</p>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
