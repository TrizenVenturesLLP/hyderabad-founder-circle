import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { links } from "@/lib/links";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Hyderabad Founders Network" },
      {
        name: "description",
        content:
          "Get in touch with the community organisers. Plus community guidelines.",
      },
      { property: "og:title", content: "Contact — Hyderabad Founders Network" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const guidelines = [
  {
    h: "Respect first",
    p: "Treat everyone as a peer. No gatekeeping based on stage, role, or how much you've raised.",
  },
  {
    h: "No hard-selling",
    p: "Don't pitch to the room. Don't DM members with cold sales. Build relationships, not pipelines.",
  },
  {
    h: "Confidentiality",
    p: "What's shared in the room stays in the room. Numbers, struggles, intros — keep them in.",
  },
  {
    h: "Inclusion",
    p: "Open to founders of all backgrounds and stages. Aspiring founders are members too.",
  },
];

function ContactPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 md:py-24">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-wider text-primary">Contact</p>
        <h1 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
          Say hi.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Hosting an event? Want to share a story? Partner with us? Send a note.
        </p>
      </header>

      <div className="mt-12 grid gap-10 md:grid-cols-12">
        <form
          className="space-y-4 md:col-span-7"
          action={`mailto:${links.email}`}
          method="post"
          encType="text/plain"
        >
          <div>
            <label className="text-sm text-foreground" htmlFor="name">Your name</label>
            <input
              id="name"
              name="name"
              required
              maxLength={100}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm text-foreground" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={255}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm text-foreground" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              maxLength={2000}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Send message
          </button>
          <p className="text-xs text-muted-foreground">
            Or email us directly at{" "}
            <a className="text-foreground underline-offset-4 hover:underline" href={`mailto:${links.email}`}>
              {links.email}
            </a>
            .
          </p>
        </form>

        <aside className="md:col-span-5">
          <h2 className="font-display text-2xl text-foreground">Community Guidelines</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The rules that keep the room what it is.
          </p>
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
            {guidelines.map((g, i) => {
              const isOpen = open === i;
              return (
                <li key={g.h}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-foreground">{g.h}</span>
                    <span className="text-muted-foreground">{isOpen ? "–" : "+"}</span>
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-4 text-sm text-muted-foreground">{g.p}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
