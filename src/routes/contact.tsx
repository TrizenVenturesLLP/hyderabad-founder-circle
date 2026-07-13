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
  "mt-2 w-full rounded-none border border-border/80 bg-background px-3.5 py-3 text-[0.975rem] text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/50 focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--terracotta)_18%,transparent)]";

function ContactPage() {
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
            Contact
          </p>
          <h1 className="mt-3 font-display text-[2.5rem] leading-[1.05] tracking-tight text-foreground sm:text-[3rem] md:text-[3.25rem]">
            Say hi.
          </h1>
          <p className="mt-3 max-w-xl text-[1.0625rem] leading-[1.65] text-muted-foreground md:text-[1.125rem]">
            Hosting an event? Want to share a story? Partner with us? Send a note.
          </p>
          <p className="mt-5 text-sm text-muted-foreground">
            Prefer email?{" "}
            <a
              href={`mailto:${links.email}`}
              className="font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
            >
              {links.email}
            </a>
            {" · "}
            <a
              href={links.phoneHref}
              className="font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
            >
              {links.phone}
            </a>
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            <a
              href={links.address.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-primary"
            >
              {links.address.line}
            </a>
          </p>
        </div>
      </header>

      {/* FORM + GUIDELINES */}
      <section className="border-t border-border/60">
        <div className="mx-auto grid max-w-[1160px] gap-12 px-5 py-12 sm:px-6 md:grid-cols-12 md:gap-12 md:px-8 md:py-14 lg:gap-16">
          {/* Form */}
          <div className="md:col-span-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              Send a message
            </p>
            <h2 className="mt-2 font-display text-[1.45rem] tracking-tight text-foreground md:text-[1.6rem]">
              Write to the organisers
            </h2>

            <form
              className="mt-7"
              action={`mailto:${links.email}`}
              method="post"
              encType="text/plain"
            >
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-5">
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
                    placeholder="Full name"
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
                    placeholder="you@company.com"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="mt-5">
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
                  rows={6}
                  maxLength={2000}
                  placeholder="What would you like to talk about?"
                  className={cn(fieldClass, "min-h-[9rem] resize-y leading-relaxed")}
                />
              </div>

              <div className="mt-7">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground transition-[opacity,transform] duration-200 hover:opacity-95 active:scale-[0.98]"
                >
                  Send message
                </button>
              </div>
            </form>
          </div>

          {/* Guidelines */}
          <aside className="md:col-span-5">
            <div className="md:sticky md:top-24">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                Community guidelines
              </p>
              <h2 className="mt-2 font-display text-[1.45rem] tracking-tight text-foreground md:text-[1.6rem]">
                The rules that keep the room what it is.
              </h2>

              <ol className="mt-6 divide-y divide-border/70 border-t border-border/70">
                {guidelines.map((g, i) => (
                  <li key={g.h} className="py-4">
                    <div className="flex gap-3.5">
                      <span
                        className="mt-0.5 font-display text-[1.05rem] tabular-nums tracking-tight text-primary/55"
                        aria-hidden
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[0.975rem] font-semibold tracking-tight text-foreground">
                          {g.h}
                        </h3>
                        <p className="mt-1 text-sm leading-[1.65] text-muted-foreground">
                          {g.p}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
