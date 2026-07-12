import { createFileRoute } from "@tanstack/react-router";
import { links } from "@/lib/links";
import { cn } from "@/lib/utils";

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

const fieldClass =
  "mt-2 w-full border-0 border-b border-border/90 bg-transparent px-0 py-3 text-[0.975rem] text-foreground outline-none transition-[border-color] placeholder:text-muted-foreground/55 focus:border-primary";

function ContactPage() {
  return (
    <div>
      <header className="mx-auto max-w-[1160px] px-4 pt-12 pb-10 sm:px-6 md:px-8 md:pt-14 md:pb-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          Contact
        </p>
        <h1 className="mt-3 font-display text-[2.5rem] leading-[1.08] tracking-tight text-foreground sm:text-[3rem] md:text-[3.4rem]">
          Say hi.
        </h1>
        <p className="mt-4 text-[1.0625rem] leading-[1.65] text-muted-foreground md:text-[1.125rem]">
          Hosting an event? Want to share a story? Partner with us? Send a note.
        </p>
      </header>

      <div
        className="mx-auto max-w-[1160px] border-b border-border/70 px-4 sm:px-6 md:px-8"
        aria-hidden
      />

      <section className="mx-auto grid max-w-[1160px] gap-12 px-4 py-12 sm:px-6 md:grid-cols-12 md:gap-12 md:px-8 md:py-16 lg:gap-16">
        {/* Form — left */}
        <form
          className="md:col-span-7"
          action={`mailto:${links.email}`}
          method="post"
          encType="text/plain"
        >
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-8">
            <div>
              <label
                className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                htmlFor="name"
              >
                Your name
              </label>
              <input
                id="name"
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                className={fieldClass}
              />
            </div>
            <div>
              <label
                className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={255}
                autoComplete="email"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="mt-8">
            <label
              className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
              htmlFor="message"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              maxLength={2000}
              className={cn(fieldClass, "min-h-[8.5rem] resize-y leading-relaxed")}
            />
          </div>

          <div className="mt-10 flex flex-col gap-5 border-t border-border/70 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-[opacity,transform] duration-200 hover:opacity-95 active:scale-[0.98]"
            >
              Send message
            </button>
            <p className="text-sm text-muted-foreground">
              Or email us directly at{" "}
              <a
                className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                href={`mailto:${links.email}`}
              >
                {links.email}
              </a>
              .
            </p>
          </div>
        </form>

        {/* Guidelines — right */}
        <aside className="md:col-span-5">
          <h2 className="font-display text-[1.55rem] tracking-tight text-foreground md:text-[1.75rem]">
            Community Guidelines
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The rules that keep the room what it is.
          </p>

          <ol className="mt-8 space-y-0 border-t border-border/80">
            {guidelines.map((g, i) => (
              <li
                key={g.h}
                className="border-b border-border/80 py-5"
              >
                <div className="flex gap-4">
                  <span className="mt-0.5 text-[11px] font-medium tabular-nums text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[0.975rem] font-semibold tracking-tight text-foreground">
                      {g.h}
                    </h3>
                    <p className="mt-1.5 text-sm leading-[1.65] text-muted-foreground">
                      {g.p}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </div>
  );
}
